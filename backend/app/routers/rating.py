from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LanguagePair, User
from app.schemas import LeaderboardEntry
from app.security import get_current_user

router = APIRouter(prefix="/api/rating", tags=["rating"])


def _entry(user: User, xp: int, streak_days: int) -> LeaderboardEntry:
    return LeaderboardEntry(
        user_id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        xp=xp,
        reputation_score=user.reputation_score,
        streak_days=streak_days,
    )


def _owned_pair(db: Session, pair_id: int, user_id: int) -> Optional[LanguagePair]:
    return (
        db.query(LanguagePair)
        .filter(LanguagePair.id == pair_id, LanguagePair.user_id == user_id)
        .first()
    )


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(
    limit: int = 50,
    pair_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rank learners globally, or — with ``pair_id`` — within one language pair.

    Pair scoping ranks everyone studying the same source→target combination by
    that pair's XP, so every language combination gets its own rating.
    """
    if pair_id is not None:
        my_pair = _owned_pair(db, pair_id, current_user.id)
        if my_pair:
            rows = (
                db.query(LanguagePair, User)
                .join(User, User.id == LanguagePair.user_id)
                .filter(
                    LanguagePair.source_language == my_pair.source_language,
                    LanguagePair.target_language == my_pair.target_language,
                    User.is_active.is_(True),
                )
                .order_by(desc(LanguagePair.xp))
                .limit(limit)
                .all()
            )
            return [_entry(user, pair.xp, pair.streak_days) for pair, user in rows]

    users = db.query(User).order_by(desc(User.xp)).limit(limit).all()
    return [
        _entry(user, user.xp, user.streak_days)
        for user in users
    ]


@router.get("/me", response_model=LeaderboardEntry)
def my_rating(
    pair_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if pair_id is not None:
        pair = _owned_pair(db, pair_id, current_user.id)
        if pair:
            return _entry(current_user, pair.xp, pair.streak_days)
    return _entry(current_user, current_user.xp, current_user.streak_days)
