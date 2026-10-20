from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LanguagePair, Notification, User
from app.schemas import LanguagePairOut, OnboardingRequest
from app.security import get_current_user

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


@router.post("/complete", response_model=LanguagePairOut)
def complete_onboarding(
    payload: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.source_language.strip().lower() == payload.target_language.strip().lower():
        raise HTTPException(status_code=400, detail="Source and target languages must differ")

    current_user.first_name = payload.first_name.strip()
    current_user.last_name = payload.last_name.strip()
    current_user.age = payload.age
    current_user.region = payload.region.strip()
    current_user.interface_language = payload.interface_language
    current_user.onboarding_completed = True

    existing_pair = (
        db.query(LanguagePair)
        .filter(
            LanguagePair.user_id == current_user.id,
            LanguagePair.source_language == payload.source_language,
            LanguagePair.target_language == payload.target_language,
        )
        .first()
    )
    if existing_pair:
        raise HTTPException(status_code=400, detail="Language pair already exists for this user")

    pair = LanguagePair(
        user_id=current_user.id,
        source_language=payload.source_language,
        target_language=payload.target_language,
        current_level=payload.current_level,
        learning_goal=payload.learning_goal,
        daily_time_minutes=payload.daily_time_minutes,
    )
    db.add(pair)

    db.add(
        Notification(
            user_id=current_user.id,
            title="Welcome to Lingolion",
            message=f"{current_user.first_name}, your study plan is ready. Start your first lesson today!",
            kind="welcome",
        )
    )

    db.commit()
    db.refresh(pair)
    return pair
