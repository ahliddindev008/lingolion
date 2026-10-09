from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.daily_challenges import get_or_create_today
from app.database import get_db
from app.models import User
from app.schemas import DailyChallengeOut
from app.security import get_current_user

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


@router.get("/today", response_model=list[DailyChallengeOut])
def today_challenges(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_or_create_today(db, current_user)
