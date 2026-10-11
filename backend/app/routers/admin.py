from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.account_service import delete_user_account
from app.config import settings
from app.database import get_db
from app.language_catalog import SUPPORTED_LEARNING_LANGUAGES
from app.models import GameScore, LanguagePair, Lesson, User
from app.security import get_current_user
from app.time_utils import utcnow_naive

router = APIRouter(prefix="/api/admin", tags=["admin"])


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRewardsUpdate(BaseModel):
    xp: int = Field(ge=0, le=1_000_000)
    coins: int = Field(ge=0, le=1_000_000)


def _is_admin(user: User) -> bool:
    return user.email.strip().casefold() in settings.admin_emails_list


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not _is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def _available_learning_languages(db: Session) -> list[str]:
    source_languages = db.query(LanguagePair.source_language).distinct().all()
    target_languages = db.query(LanguagePair.target_language).distinct().all()
    languages = {
        *SUPPORTED_LEARNING_LANGUAGES,
        *(language for (language,) in source_languages + target_languages if language),
    }
    return sorted(languages, key=str.casefold)


@router.get("/status")
def admin_status(current_user: User = Depends(get_current_user)):
    return {"is_admin": _is_admin(current_user)}


@router.get("/overview")
def admin_overview(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active.is_(True)).count(),
        "inactive_users": db.query(User).filter(User.is_active.is_(False)).count(),
        "new_users_30d": db.query(User).filter(User.created_at >= utcnow_naive() - timedelta(days=30)).count(),
        "onboarded_users": db.query(User).filter(User.onboarding_completed.is_(True)).count(),
        "pending_onboarding": db.query(User).filter(User.onboarding_completed.is_(False)).count(),
        "total_xp": db.query(func.coalesce(func.sum(User.xp), 0)).scalar(),
        "completed_lessons": db.query(Lesson).filter(Lesson.is_completed.is_(True)).count(),
        "games_played": db.query(GameScore).count(),
        "available_languages": _available_learning_languages(db),
    }


@router.get("/users")
def list_users(
    search: str = Query(default="", max_length=100),
    status: str = Query(default="all", max_length=10),
    language: str = Query(default="all", max_length=50),
    sort: str = Query(default="joined", max_length=10),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users_query = db.query(User)
    search = search.strip()
    if search:
        pattern = f"%{search}%"
        users_query = users_query.filter(
            or_(User.email.ilike(pattern), User.first_name.ilike(pattern), User.last_name.ilike(pattern))
        )
    if status == "active":
        users_query = users_query.filter(User.is_active.is_(True))
    elif status == "inactive":
        users_query = users_query.filter(User.is_active.is_(False))
    elif status != "all":
        raise HTTPException(status_code=422, detail="Invalid status filter")

    if language != "all":
        if language not in _available_learning_languages(db):
            raise HTTPException(status_code=422, detail="Invalid language filter")
        users_query = users_query.filter(
            User.language_pairs.any(
                or_(
                    LanguagePair.source_language == language,
                    LanguagePair.target_language == language,
                )
            )
        )

    sort_columns = {
        "joined": (User.created_at.desc(), User.id.desc()),
        "xp": (User.xp.desc(), User.id.desc()),
        "coins": (User.coins.desc(), User.id.desc()),
        "name": (User.first_name.asc(), User.last_name.asc(), User.id.asc()),
    }
    if sort not in sort_columns:
        raise HTTPException(status_code=422, detail="Invalid sort option")

    total = users_query.count()
    total = users_query.count()
    page_count = max(1, (total + page_size - 1) // page_size)
    page = min(page, page_count)
    users = (
        users_query.order_by(*sort_columns[sort])
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "total": total,
        "page": page,
        "page_count": page_count,
        "page_size": page_size,
        "items": [
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "interface_language": user.interface_language,
                "is_active": user.is_active,
                "is_admin": _is_admin(user),
                "xp": user.xp,
                "coins": user.coins,
                "onboarding_completed": user.onboarding_completed,
                "created_at": user.created_at,
            }
            for user in users
        ],
    }


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=409, detail="You cannot change your own account status")
    if _is_admin(user) and not payload.is_active:
        raise HTTPException(status_code=409, detail="Admin accounts cannot be deactivated here")

    user.is_active = payload.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}


@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    language_pairs = db.query(LanguagePair).filter(LanguagePair.user_id == user.id).all()
    lesson_count = (
        db.query(Lesson)
        .join(LanguagePair, Lesson.language_pair_id == LanguagePair.id)
        .filter(LanguagePair.user_id == user.id)
        .count()
    )
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "age": user.age,
        "region": user.region,
        "interface_language": user.interface_language,
        "xp": user.xp,
        "coins": user.coins,
        "streak_days": user.streak_days,
        "reputation_score": user.reputation_score,
        "is_active": user.is_active,
        "is_admin": _is_admin(user),
        "onboarding_completed": user.onboarding_completed,
        "created_at": user.created_at,
        "last_active_date": user.last_active_date,
        "games_played": db.query(GameScore).filter(GameScore.user_id == user.id).count(),
        "lessons_created": lesson_count,
        "language_pairs": [
            {
                "source_language": pair.source_language,
                "target_language": pair.target_language,
                "current_level": pair.current_level,
                "xp": pair.xp,
                "streak_days": pair.streak_days,
                "is_active": pair.is_active,
            }
            for pair in language_pairs
        ],
    }


@router.patch("/users/{user_id}/rewards")
def update_user_rewards(
    user_id: int,
    payload: UserRewardsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id or _is_admin(user):
        raise HTTPException(status_code=409, detail="Admin rewards cannot be changed here")

    user.xp = payload.xp
    user.coins = payload.coins
    db.commit()
    return {"id": user.id, "xp": user.xp, "coins": user.coins}


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=409, detail="You cannot delete your own account here")
    if _is_admin(user):
        raise HTTPException(status_code=409, detail="Admin accounts cannot be deleted here")

    delete_user_account(db, user)


@router.get("/ratings")
def language_ratings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Rankings of every learning-language pair, grouped for the admin panel."""
    rows = (
        db.query(LanguagePair, User)
        .join(User, User.id == LanguagePair.user_id)
        .filter(User.is_active.is_(True))
        .order_by(
            LanguagePair.source_language.asc(),
            LanguagePair.target_language.asc(),
            LanguagePair.xp.desc(),
            LanguagePair.id.asc(),
        )
        .all()
    )
    grouped: dict[tuple[str, str], list[dict]] = {}
    for pair, user in rows:
        key = (pair.source_language or "", pair.target_language or "")
        grouped.setdefault(key, []).append(
            {
                "user_id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "xp": pair.xp,
                "streak_days": pair.streak_days,
            }
        )
    return [
        {
            "source_language": source,
            "target_language": target,
            "learner_count": len(entries),
            "entries": entries[:100],
        }
        for (source, target), entries in grouped.items()
    ]