import asyncio
import html
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app import gemini_service
from app.daily_challenges import advance_progress
from app.database import SessionLocal, get_db
from app.models import ChatMessage, ChatRoomState, LanguagePair, Notification, User
from app.schemas import ChatMessageOut, ChatSendRequest, PartnerOut
from app.security import decode_access_token, get_current_user, is_device_session_active
from app.time_utils import utcnow_naive
from app.websocket_manager import bump_streak, manager

router = APIRouter(prefix="/api/communication", tags=["communication"])
CHAT_UPLOAD_DIR = Path(__file__).resolve().parents[2] / ".chat_uploads"
MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024
ATTACHMENT_PREFIX = "attachment:"
INLINE_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
INLINE_AUDIO_TYPES = {"audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"}


def _device_session_is_active(payload: dict, user_id: int) -> bool:
    with SessionLocal() as db:
        return is_device_session_active(payload, db, user_id)


def _sanitize(text: str) -> str:
    """Escape HTML to prevent stored XSS in chat messages."""
    return html.escape(text.strip())


def _room_allowed(room: str, user_id: int) -> bool:
    parts = room.split("_")
    try:
        if parts[:2] == ["ai", "tutor"] and len(parts) == 4:
            owner_id, pair_id = int(parts[2]), int(parts[3])
            return owner_id == user_id and pair_id > 0
        if parts[0] == "partner" and len(parts) == 3:
            first_id, second_id = int(parts[1]), int(parts[2])
            return first_id < second_id and user_id in {first_id, second_id}
    except (IndexError, ValueError):
        return False
    return False


def _partner_room(user_a: int, user_b: int) -> str:
    lo, hi = sorted([user_a, user_b])
    return f"partner_{lo}_{hi}"


def _recent_ai_conversation(db: Session, room: str, exclude_message_id: int) -> list[dict[str, str]]:
    room_state = db.query(ChatRoomState).filter(
        ChatRoomState.user_id == int(room.split("_")[2]),
        ChatRoomState.room == room,
    ).first()
    query = db.query(ChatMessage).filter(ChatMessage.room == room, ChatMessage.id != exclude_message_id)
    if room_state:
        query = query.filter(ChatMessage.created_at > room_state.cleared_at)
    recent_messages = (
        query
        .order_by(ChatMessage.id.desc())
        .limit(8)
        .all()
    )
    return [
        {
            "role": "assistant" if message.is_ai else "learner",
            "content": message.content,
        }
        for message in reversed(recent_messages)
        if not message.content.startswith(ATTACHMENT_PREFIX)
    ]


def _room_clear_time(db: Session, user_id: int, room: str):
    state = db.query(ChatRoomState).filter(
        ChatRoomState.user_id == user_id,
        ChatRoomState.room == room,
    ).first()
    return state.cleared_at if state else None


def _remove_attachment_file(content: str) -> None:
    attachment = re.match(r"^attachment:([a-f0-9]{32})\|", content)
    if not attachment:
        return
    for file_path in CHAT_UPLOAD_DIR.glob(f"{attachment.group(1)}.*"):
        file_path.unlink(missing_ok=True)


def _notify_partner(db: Session, room: str, sender_id: int, message: str, message_id: int) -> None:
    if not room.startswith("partner_"):
        return
    try:
        participants = [int(part) for part in room.split("_")[1:]]
        recipient_id = next(user_id for user_id in participants if user_id != sender_id)
    except (ValueError, StopIteration):
        return

    sender = db.query(User).filter(User.id == sender_id).first()
    recipient = db.query(User).filter(User.id == recipient_id).first()
    if sender and recipient:
        sender_name = f"{sender.first_name} {sender.last_name}".strip()
        db.add(Notification(
            user_id=recipient_id,
            chat_message_id=message_id,
            title=sender_name,
            message=message[:500],
            kind="message",
        ))


CALL_SIGNAL_ACTIONS = {"offer", "answer", "ice", "end", "reject"}
PRACTICE_SCENARIOS = {"free_talk", "introductions", "cafe", "travel", "work"}


@router.get("/partners", response_model=list[PartnerOut])
def find_partners(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Match users with the same or mirrored language pair."""
    my_pairs = db.query(LanguagePair).filter(LanguagePair.user_id == current_user.id).all()
    if not my_pairs:
        return []

    results: list[PartnerOut] = []
    seen_users: set[int] = set()

    for mine in my_pairs:
        candidates = (
            db.query(LanguagePair, User)
            .join(User, User.id == LanguagePair.user_id)
            .filter(
                or_(
                    and_(
                        LanguagePair.source_language == mine.source_language,
                        LanguagePair.target_language == mine.target_language,
                    ),
                    and_(
                        LanguagePair.source_language == mine.target_language,
                        LanguagePair.target_language == mine.source_language,
                    ),
                ),
                LanguagePair.user_id != current_user.id,
            )
            .limit(20)
            .all()
        )
        for pair, user in candidates:
            if user.id in seen_users:
                continue
            seen_users.add(user.id)
            results.append(
                PartnerOut(
                    user_id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    source_language=pair.source_language,
                    target_language=pair.target_language,
                    current_level=pair.current_level,
                    room=_partner_room(current_user.id, user.id),
                )
            )

    return results


@router.get("/rooms/{room}/messages", response_model=list[ChatMessageOut])
def get_messages(
    room: str,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _room_allowed(room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")
    query = db.query(ChatMessage).filter(ChatMessage.room == room)
    cleared_at = _room_clear_time(db, current_user.id, room)
    if cleared_at:
        query = query.filter(ChatMessage.created_at > cleared_at)
    messages = query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
    return list(reversed(messages))


@router.delete("/rooms/{room}/messages")
def clear_messages(
    room: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _room_allowed(room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")

    cleared_at = utcnow_naive()
    state = db.query(ChatRoomState).filter(
        ChatRoomState.user_id == current_user.id,
        ChatRoomState.room == room,
    ).first()
    if state:
        state.cleared_at = cleared_at
    else:
        db.add(ChatRoomState(user_id=current_user.id, room=room, cleared_at=cleared_at))
    room_message_ids = db.query(ChatMessage.id).filter(ChatMessage.room == room)
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.chat_message_id.in_(room_message_ids),
    ).delete(synchronize_session=False)
    db.commit()
    return {"status": "cleared"}


@router.delete("/rooms/{room}/messages/{message_id}")
async def delete_message(
    room: str,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _room_allowed(room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")
    message = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.room == room,
    ).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if message.sender_id != current_user.id or message.is_ai:
        raise HTTPException(status_code=403, detail="Only your own messages can be cancelled")

    attachment_content = message.content
    db.query(Notification).filter(Notification.chat_message_id == message.id).delete(synchronize_session=False)
    db.delete(message)
    db.commit()
    _remove_attachment_file(attachment_content)
    await manager.broadcast(room, {"type": "message_deleted", "message_id": message_id})
    return {"status": "deleted", "message_id": message_id}


@router.post("/rooms/{room}/attachments", response_model=ChatMessageOut)
async def upload_attachment(
    room: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _room_allowed(room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")

    contents = await file.read(MAX_ATTACHMENT_SIZE + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(contents) > MAX_ATTACHMENT_SIZE:
        raise HTTPException(status_code=413, detail="Files must be 10 MB or smaller")

    original_name = Path((file.filename or "attachment").replace("\\", "/")).name
    safe_name = original_name.replace("|", "_")[:255] or "attachment"
    extension = Path(safe_name).suffix
    if not re.fullmatch(r"\.[a-zA-Z0-9]{1,10}", extension):
        extension = ""
    content_type = file.content_type or "application/octet-stream"
    if not re.fullmatch(r"[\w.+-]+/[\w.+-]+", content_type):
        content_type = "application/octet-stream"

    attachment_id = uuid.uuid4().hex
    CHAT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_path = CHAT_UPLOAD_DIR / f"{attachment_id}{extension.lower()}"
    file_path.write_bytes(contents)

    message = ChatMessage(
        room=room,
        sender_id=current_user.id,
        is_ai=False,
        content=f"{ATTACHMENT_PREFIX}{attachment_id}|{content_type}|{safe_name}",
    )
    try:
        db.add(message)
        db.flush()
        _notify_partner(db, room, current_user.id, f"📎 {safe_name}", message.id)
        db.commit()
        db.refresh(message)
    except Exception:
        file_path.unlink(missing_ok=True)
        raise

    await manager.broadcast(
        room,
        {
            "id": message.id,
            "room": room,
            "sender_id": current_user.id,
            "is_ai": False,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        },
    )
    return message


@router.get("/rooms/{room}/attachments/{attachment_id}")
def download_attachment(
    room: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _room_allowed(room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")
    if not re.fullmatch(r"[a-f0-9]{32}", attachment_id):
        raise HTTPException(status_code=404, detail="Attachment not found")

    message = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.room == room,
            ChatMessage.content.like(f"{ATTACHMENT_PREFIX}{attachment_id}|%"),
        )
        .first()
    )
    file_path = next(CHAT_UPLOAD_DIR.glob(f"{attachment_id}.*"), None)
    if not message or not file_path or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Attachment not found")

    _, content_type, filename = message.content.split("|", 2)
    inline = content_type in INLINE_IMAGE_TYPES or content_type in INLINE_AUDIO_TYPES
    return FileResponse(
        file_path,
        filename=filename,
        media_type=content_type if inline else "application/octet-stream",
        content_disposition_type="inline" if inline else "attachment",
        headers={"X-Content-Type-Options": "nosniff"},
    )


@router.post("/send", response_model=ChatMessageOut)
def send_message(
    payload: ChatSendRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not _room_allowed(payload.room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")

    clean_content = _sanitize(payload.content)
    user_msg = ChatMessage(room=payload.room, sender_id=current_user.id, is_ai=False, content=clean_content)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # AI tutor rooms get an automatic AI reply with grammar correction
    if payload.room.startswith("ai_tutor_") and payload.language_pair_id:
        pair = (
            db.query(LanguagePair)
            .filter(LanguagePair.id == payload.language_pair_id, LanguagePair.user_id == current_user.id)
            .first()
        )
        if pair:
            conversation_history = _recent_ai_conversation(db, payload.room, user_msg.id)
            analysis = gemini_service.analyze_message(
                source_language=pair.source_language,
                target_language=pair.target_language,
                level=pair.current_level,
                user_message=clean_content,
                conversation_history=conversation_history,
                practice_scenario=payload.practice_scenario,
            )
            ai_msg = ChatMessage(
                room=payload.room,
                sender_id=None,
                is_ai=True,
                content=analysis.get("reply", ""),
                corrected_text=analysis.get("corrected_text") or None,
                correction_notes=analysis.get("correction_notes") or None,
            )
            db.add(ai_msg)
            bump_streak(current_user)
            advance_progress(db, current_user, "send_messages", 1)
            db.commit()
            db.refresh(ai_msg)
            return ai_msg

    return user_msg


@router.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str, token: str = Query(...)):
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
        if not _device_session_is_active(payload, user_id):
            await websocket.close(code=4401)
            return
    except Exception:
        await websocket.close(code=4401)
        return

    if not _room_allowed(room, user_id):
        await websocket.close(code=4403)
        return

    await manager.connect(room, websocket)
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=30)
            except asyncio.TimeoutError:
                if not _device_session_is_active(payload, user_id):
                    await websocket.close(code=4401)
                    return
                continue
            if not _device_session_is_active(payload, user_id):
                await websocket.close(code=4401)
                return
            if data.get("type") == "call_signal":
                if not room.startswith("partner_"):
                    continue
                action = data.get("action")
                call_id = data.get("call_id")
                if action not in CALL_SIGNAL_ACTIONS or not isinstance(call_id, str) or len(call_id) > 64:
                    continue

                signal = {"type": "call_signal", "sender_id": user_id, "action": action, "call_id": call_id}
                if action in {"offer", "answer"}:
                    description = data.get("description")
                    if (
                        not isinstance(description, dict)
                        or description.get("type") != action
                        or not isinstance(description.get("sdp"), str)
                        or len(description["sdp"]) > 50000
                    ):
                        continue
                    signal["description"] = {"type": action, "sdp": description["sdp"]}
                elif action == "ice":
                    candidate = data.get("candidate")
                    if not isinstance(candidate, dict) or not isinstance(candidate.get("candidate"), str):
                        continue
                    if len(candidate["candidate"]) > 4096:
                        continue
                    signal["candidate"] = {
                        key: candidate.get(key)
                        for key in ("candidate", "sdpMid", "sdpMLineIndex", "usernameFragment")
                    }

                await manager.broadcast(room, signal)
                continue
            if data.get("type") == "message_deleted":
                message_id = data.get("message_id")
                if not isinstance(message_id, int) or isinstance(message_id, bool):
                    continue
                with SessionLocal() as db:
                    message = db.query(ChatMessage).filter(
                        ChatMessage.id == message_id,
                        ChatMessage.room == room,
                    ).first()
                    if not message or message.sender_id != user_id or message.is_ai:
                        continue
                    attachment_content = message.content
                    db.query(Notification).filter(
                        Notification.chat_message_id == message.id
                    ).delete(synchronize_session=False)
                    db.delete(message)
                    db.commit()
                    _remove_attachment_file(attachment_content)
                await manager.broadcast(room, {"type": "message_deleted", "message_id": message_id})
                continue

            content = _sanitize(str(data.get("content", "")))
            if not content:
                continue

            db = SessionLocal()
            try:
                user_msg = ChatMessage(room=room, sender_id=user_id, is_ai=False, content=content)
                db.add(user_msg)
                db.flush()
                _notify_partner(db, room, user_id, content, user_msg.id)
                db.commit()
                db.refresh(user_msg)
                await manager.broadcast(
                    room,
                    {
                        "id": user_msg.id,
                        "sender_id": user_id,
                        "is_ai": False,
                        "content": content,
                        "created_at": user_msg.created_at.isoformat(),
                    },
                )

                if room.startswith("ai_tutor_") and data.get("language_pair_id"):
                    pair = (
                        db.query(LanguagePair)
                        .filter(LanguagePair.id == data["language_pair_id"], LanguagePair.user_id == user_id)
                        .first()
                    )
                    if pair:
                        practice_scenario = data.get("practice_scenario")
                        if not isinstance(practice_scenario, str) or practice_scenario not in PRACTICE_SCENARIOS:
                            practice_scenario = "free_talk"
                        analysis = gemini_service.analyze_message(
                            source_language=pair.source_language,
                            target_language=pair.target_language,
                            level=pair.current_level,
                            user_message=content,
                            conversation_history=_recent_ai_conversation(db, room, user_msg.id),
                            practice_scenario=practice_scenario,
                        )
                        ai_msg = ChatMessage(
                            room=room,
                            sender_id=None,
                            is_ai=True,
                            content=analysis.get("reply", ""),
                            corrected_text=analysis.get("corrected_text") or None,
                            correction_notes=analysis.get("correction_notes") or None,
                        )
                        db.add(ai_msg)
                        user = db.query(User).filter(User.id == user_id).first()
                        if user:
                            advance_progress(db, user, "send_messages", 1)
                        db.commit()
                        db.refresh(ai_msg)
                        await manager.broadcast(
                            room,
                            {
                                "id": ai_msg.id,
                                "sender_id": None,
                                "is_ai": True,
                                "content": ai_msg.content,
                                "corrected_text": ai_msg.corrected_text,
                                "correction_notes": ai_msg.correction_notes,
                                "created_at": ai_msg.created_at.isoformat(),
                            },
                        )
            finally:
                db.close()
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)
