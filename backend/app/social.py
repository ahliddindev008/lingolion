"""Shared social graph helpers."""
from sqlalchemy.orm import Session

from app.models import LanguagePair


def is_practice_partner(db: Session, user_a_id: int, user_b_id: int) -> bool:
    """True when the two users share a mirrored language pair (A→B vs B→A)."""
    my_pairs = db.query(LanguagePair).filter(LanguagePair.user_id == user_a_id).all()
    for mine in my_pairs:
        match = (
            db.query(LanguagePair)
            .filter(
                LanguagePair.user_id == user_b_id,
                LanguagePair.source_language == mine.target_language,
                LanguagePair.target_language == mine.source_language,
            )
            .first()
        )
        if match:
            return True
    return False
