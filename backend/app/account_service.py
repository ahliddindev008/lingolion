from pathlib import Path

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import ChatMessage, DailyChallenge, DeviceSession, RefreshToken, User


def delete_user_account(db: Session, user: User) -> None:
    """Delete a user and data not removed through ORM relationships."""
    user_id = user.id
    messages = db.query(ChatMessage).filter(
        or_(
            ChatMessage.sender_id == user_id,
            ChatMessage.room.like(f"ai_tutor_{user_id}_%"),
            ChatMessage.room.like(f"partner_{user_id}_%"),
            ChatMessage.room.like(f"partner_%_{user_id}"),
        )
    ).all()
    upload_dir = Path(__file__).resolve().parents[1] / ".chat_uploads"
    for message in messages:
        if message.content.startswith("attachment:"):
            attachment_id = message.content.split(":", 1)[1].split("|", 1)[0]
            if attachment_id and Path(attachment_id).name == attachment_id:
                (upload_dir / attachment_id).unlink(missing_ok=True)
                for upload in upload_dir.glob(f"{attachment_id}.*"):
                    upload.unlink(missing_ok=True)
        db.delete(message)

    db.query(DailyChallenge).filter(DailyChallenge.user_id == user_id).delete(synchronize_session=False)
    db.query(DeviceSession).filter(DeviceSession.user_id == user_id).delete(synchronize_session=False)
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()