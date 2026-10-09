from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LeaderboardEntry
from app.security import get_current_user

router = APIRouter(prefix="/api/rating", tags=["rating"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).order_by(desc(User.xp)).limit(limit).all()
    return [
        LeaderboardEntry(
            user_id=u.id,
            first_name=u.first_name,
            last_name=u.last_name,
            xp=u.xp,
            reputation_score=u.reputation_score,
            streak_days=u.streak_days,
        )
        for u in users
    ]


@router.get("/me", response_model=LeaderboardEntry)
def my_rating(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = LeaderboardEntry(
        user_id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        xp=current_user.xp,
        reputation_score=current_user.reputation_score,
        streak_days=current_user.streak_days,
    )
    return entry
