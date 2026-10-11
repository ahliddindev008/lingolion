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
from app.models import ChatMessage, ChatRoomState, ChatSpace, ChatSpaceMember, LanguagePair, Notification, User
from app.schemas import (
    ChatMessageOut,
    ChatSendRequest,
    ChatSpaceAddMembers,
    ChatSpaceCreate,
    ChatSpaceJoinRequest,
    ChatSpaceOut,
    PartnerOut,
)
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


def _space_of(db: Session, room: str):
    """Return the ChatSpace for a ``space_{id}`` room, else None."""
    parts = room.split("_")
    if parts[0] != "space" or len(parts) != 2:
        return None
    try:
        space_id = int(parts[1])
    except ValueError:
        return None
    return db.query(ChatSpace).filter(ChatSpace.id == space_id).first()


def _space_membership(db: Session, space_id: int, user_id: int):
    return (
        db.query(ChatSpaceMember)
        .filter(ChatSpaceMember.space_id == space_id, ChatSpaceMember.user_id == user_id)
        .first()
    )


def _room_allowed(db: Session, room: str, user_id: int) -> bool:
    parts = room.split("_")
    try:
        if parts[:2] == ["ai", "tutor"] and len(parts) == 4:
            owner_id, pair_id = int(parts[2]), int(parts[3])
            return owner_id == user_id and pair_id > 0
        if parts[0] == "partner" and len(parts) == 3:
            first_id, second_id = int(parts[1]), int(parts[2])
            return first_id < second_id and user_id in {first_id, second_id}
        if parts[0] == "space" and len(parts) == 2:
            space_id = int(parts[1])
            return _space_membership(db, space_id, user_id) is not None
    except (IndexError, ValueError):
        return False
    return False


def _can_post_in_room(db: Session, room: str, user_id: int) -> bool:
    """Channels are broadcast-only: owners/admins post, members read."""
    space = _space_of(db, room)
    if not space:
        return True
    if space.kind != "channel":
        return True
    membership = _space_membership(db, space.id, user_id)
    return bool(membership and membership.role in {"owner", "admin"})


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


def _notify_room(db: Session, room: str, sender_id: int, message: str, message_id: int) -> None:
    if room.startswith("partner_"):
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
        return

    # Group/channel message: every member except the sender gets notified.
    space = _space_of(db, room)
    if not space:
        return
    sender = db.query(User).filter(User.id == sender_id).first()
    sender_name = f"{sender.first_name} {sender.last_name}".strip() if sender else ""
    recipient_ids = [
        uid
        for (uid,) in db.query(ChatSpaceMember.user_id)
        .filter(ChatSpaceMember.space_id == space.id, ChatSpaceMember.user_id != sender_id)
        .all()
    ]
    for recipient_id in recipient_ids:
        db.add(Notification(
            user_id=recipient_id,
            chat_message_id=message_id,
            title=space.name,
            message=f"{sender_name}: {message}"[:500] if sender_name else message[:500],
            kind="message",
        ))


CALL_SIGNAL_ACTIONS = {"offer", "answer", "ice", "end", "reject"}
PRACTICE_SCENARIOS = {"free_talk", "introductions", "cafe", "travel", "work"}


def _reply_preview(message: "ChatMessage") -> dict:
    """Build a compact, client-safe preview of the message being replied to."""
    snippet = message.content
    if snippet.startswith(ATTACHMENT_PREFIX):
        parts = snippet.split("|", 2)
        snippet = parts[2] if len(parts) == 3 else ""
    return {
        "id": message.id,
        "sender_name": None,
        "is_ai": message.is_ai,
        "snippet": snippet[:160],
    }


def _resolve_reply_to(db: Session, room: str, reply_to_id):
    """Return the referenced message when it is a valid, same-room target."""
    if not isinstance(reply_to_id, int) or isinstance(reply_to_id, bool) or reply_to_id <= 0:
        return None
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.id == reply_to_id, ChatMessage.room == room)
        .first()
    )


def _sender_name(db: Session, user_id):
    if not user_id:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    return f"{user.first_name} {user.last_name}".strip() or None


def serialize_chat_message(db: Session, message: "ChatMessage") -> dict:
    """Serialize a chat message, embedding a compact preview of its reply target."""
    reply_to = None
    if message.reply_to_id:
        ref = db.query(ChatMessage).filter(ChatMessage.id == message.reply_to_id).first()
        if ref:
            preview = _reply_preview(ref)
            preview["sender_name"] = _sender_name(db, ref.sender_id)
            reply_to = preview
    return {
        "id": message.id,
        "room": message.room,
        "sender_id": message.sender_id,
        "is_ai": message.is_ai,
        "content": message.content,
        "corrected_text": message.corrected_text,
        "correction_notes": message.correction_notes,
        "reply_to_id": message.reply_to_id,
        "reply_to": reply_to,
        "sender_name": _sender_name(db, message.sender_id) if message.room.startswith("space_") else None,
        "created_at": message.created_at.isoformat(),
    }


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
    if not _room_allowed(db, room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")
    query = db.query(ChatMessage).filter(ChatMessage.room == room)
    cleared_at = _room_clear_time(db, current_user.id, room)
    if cleared_at:
        query = query.filter(ChatMessage.created_at > cleared_at)
    messages = query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
    ordered = list(reversed(messages))
    return [serialize_chat_message(db, message) for message in ordered]


@router.delete("/rooms/{room}/messages")
def clear_messages(
    room: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _room_allowed(db, room, current_user.id):
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
    if not _room_allowed(db, room, current_user.id):
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
    if not _room_allowed(db, room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")
    if not _can_post_in_room(db, room, current_user.id):
        raise HTTPException(status_code=403, detail="Only channel owners and admins can post")

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
        _notify_room(db, room, current_user.id, f"📎 {safe_name}", message.id)
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
    if not _room_allowed(db, room, current_user.id):
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


# ---------- Chat spaces: WhatsApp-style groups & channels ----------


def _serialize_space(db: Session, space: ChatSpace, viewer_id: int) -> dict:
    member_rows = (
        db.query(ChatSpaceMember, User)
        .join(User, User.id == ChatSpaceMember.user_id)
        .filter(ChatSpaceMember.space_id == space.id)
        .order_by(ChatSpaceMember.joined_at)
        .all()
    )
    members = [
        {
            "user_id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": member.role,
            "joined_at": member.joined_at,
        }
        for member, user in member_rows
    ]
    my_role = next((member["role"] for member in members if member["user_id"] == viewer_id), None)
    if my_role is None:
        raise HTTPException(status_code=403, detail="Not a member of this space")
    last_message = (
        db.query(ChatMessage)
        .filter(ChatMessage.room == space.room)
        .order_by(ChatMessage.id.desc())
        .first()
    )
    return {
        "id": space.id,
        "kind": space.kind,
        "name": space.name,
        "description": space.description,
        "room": space.room,
        "invite_code": space.invite_code,
        "creator_id": space.creator_id,
        "my_role": my_role,
        "can_post": space.kind == "group" or my_role in {"owner", "admin"},
        "member_count": len(members),
        "members": members,
        "last_message": serialize_chat_message(db, last_message) if last_message else None,
        "created_at": space.created_at,
    }


def _get_member_space(db: Session, space_id: int, user_id: int) -> ChatSpace:
    space = db.query(ChatSpace).filter(ChatSpace.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    if _space_membership(db, space.id, user_id) is None:
        raise HTTPException(status_code=403, detail="Not a member of this space")
    return space


def _invite_users(db: Session, space_id: int, user_ids, skip_user_id: int) -> None:
    already = {
        row[0]
        for row in db.query(ChatSpaceMember.user_id).filter(ChatSpaceMember.space_id == space_id).all()
    }
    for user_id in user_ids:
        if not isinstance(user_id, int) or user_id in already or user_id == skip_user_id:
            continue
        invited = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
        if invited:
            db.add(ChatSpaceMember(space_id=space_id, user_id=invited.id, role="member"))
            already.add(invited.id)


@router.post("/spaces", response_model=ChatSpaceOut)
def create_space(
    payload: ChatSpaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    space = ChatSpace(
        kind=payload.kind,
        name=name,
        description=(payload.description or "").strip() or None,
        room="pending",
        invite_code=uuid.uuid4().hex[:10].upper(),
        creator_id=current_user.id,
    )
    db.add(space)
    db.flush()
    space.room = f"space_{space.id}"
    db.add(ChatSpaceMember(space_id=space.id, user_id=current_user.id, role="owner"))
    if payload.kind == "group":
        _invite_users(db, space.id, payload.member_ids, current_user.id)
    db.commit()
    db.refresh(space)
    return _serialize_space(db, space, current_user.id)


@router.get("/spaces", response_model=list[ChatSpaceOut])
def list_spaces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    space_ids = [
        row[0]
        for row in db.query(ChatSpaceMember.space_id)
        .filter(ChatSpaceMember.user_id == current_user.id)
        .all()
    ]
    if not space_ids:
        return []
    spaces = (
        db.query(ChatSpace)
        .filter(ChatSpace.id.in_(space_ids))
        .order_by(ChatSpace.created_at.desc())
        .all()
    )
    return [_serialize_space(db, space, current_user.id) for space in spaces]


@router.post("/spaces/join", response_model=ChatSpaceOut)
def join_space(
    payload: ChatSpaceJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    code = payload.code.strip().upper()
    space = db.query(ChatSpace).filter(ChatSpace.invite_code == code).first()
    if not space:
        raise HTTPException(status_code=404, detail="Invite code not found")
    if _space_membership(db, space.id, current_user.id) is None:
        db.add(ChatSpaceMember(space_id=space.id, user_id=current_user.id, role="member"))
        db.commit()
        db.refresh(space)
    return _serialize_space(db, space, current_user.id)


@router.post("/spaces/{space_id}/members", response_model=ChatSpaceOut)
def add_space_members(
    space_id: int,
    payload: ChatSpaceAddMembers,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = _get_member_space(db, space_id, current_user.id)
    membership = _space_membership(db, space.id, current_user.id)
    if space.kind != "group":
        raise HTTPException(status_code=400, detail="Members can only be added to groups")
    if membership.role not in {"owner", "admin"}:
        raise HTTPException(status_code=403, detail="Only owners and admins can add members")
    _invite_users(db, space.id, payload.user_ids, current_user.id)
    db.commit()
    db.refresh(space)
    return _serialize_space(db, space, current_user.id)


@router.post("/spaces/{space_id}/leave")
def leave_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = _get_member_space(db, space_id, current_user.id)
    membership = _space_membership(db, space.id, current_user.id)
    remaining = (
        db.query(ChatSpaceMember)
        .filter(ChatSpaceMember.space_id == space.id, ChatSpaceMember.user_id != current_user.id)
        .order_by(ChatSpaceMember.joined_at)
        .all()
    )

    if membership.role == "owner" and not remaining:
        # The last member leaving dissolves the space and its history.
        message_ids = [
            row[0] for row in db.query(ChatMessage.id).filter(ChatMessage.room == space.room).all()
        ]
        if message_ids:
            db.query(ChatMessage).filter(ChatMessage.reply_to_id.in_(message_ids)).update(
                {"reply_to_id": None}, synchronize_session=False
            )
            db.query(Notification).filter(Notification.chat_message_id.in_(message_ids)).delete(
                synchronize_session=False
            )
            db.query(ChatMessage).filter(ChatMessage.id.in_(message_ids)).delete(
                synchronize_session=False
            )
        db.query(ChatRoomState).filter(ChatRoomState.room == space.room).delete(
            synchronize_session=False
        )
        db.delete(space)
        db.commit()
        return {"status": "deleted"}

    db.delete(membership)
    if membership.role == "owner":
        remaining[0].role = "owner"
    db.commit()
    return {"status": "left"}


@router.post("/send", response_model=ChatMessageOut)
def send_message(
    payload: ChatSendRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not _room_allowed(db, payload.room, current_user.id):
        raise HTTPException(status_code=403, detail="Not allowed to access this room")
    if not _can_post_in_room(db, payload.room, current_user.id):
        raise HTTPException(status_code=403, detail="Only channel owners and admins can post")

    clean_content = _sanitize(payload.content)
    reply_to_id = None
    if payload.reply_to_id is not None and _resolve_reply_to(db, payload.room, payload.reply_to_id):
        reply_to_id = payload.reply_to_id
    user_msg = ChatMessage(
        room=payload.room,
        sender_id=current_user.id,
        is_ai=False,
        content=clean_content,
        reply_to_id=reply_to_id,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    if payload.room.startswith("space_"):
        _notify_room(db, payload.room, current_user.id, clean_content, user_msg.id)
        db.commit()

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

    with SessionLocal() as db:
        allowed = _room_allowed(db, room, user_id)
    if not allowed:
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
                if not _can_post_in_room(db, room, user_id):
                    continue
                reply_target = _resolve_reply_to(db, room, data.get("reply_to_id"))
                user_msg = ChatMessage(
                    room=room,
                    sender_id=user_id,
                    is_ai=False,
                    content=content,
                    reply_to_id=reply_target.id if reply_target else None,
                )
                db.add(user_msg)
                db.flush()
                _notify_room(db, room, user_id, content, user_msg.id)
                db.commit()
                db.refresh(user_msg)
                await manager.broadcast(
                    room,
                    {
                        "id": user_msg.id,
                        "room": room,
                        "sender_id": user_id,
                        "is_ai": False,
                        "content": content,
                        "reply_to_id": user_msg.reply_to_id,
                        "reply_to": (
                            {**_reply_preview(reply_target), "sender_name": _sender_name(db, reply_target.sender_id)}
                            if reply_target
                            else None
                        ),
                        "created_at": user_msg.created_at.isoformat(),
                        "sender_name": _sender_name(db, user_id) if room.startswith("space_") else None,
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
