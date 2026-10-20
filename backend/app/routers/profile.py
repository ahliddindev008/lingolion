from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import gemini_service
from app.account_service import delete_user_account
from app.database import get_db
from app.models import Achievement, GameScore, LanguagePair, Lesson, Notification, User
from app.schemas import DeleteAccountRequest, LanguagePairOut, NotificationOut, ProfileUpdate, UserOut
from app.security import get_current_user, verify_password
from app.time_utils import utcnow_naive

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def delete_account(
    payload: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Incorrect password.")
    delete_user_account(db, current_user)


@router.get("/language-pairs", response_model=list[LanguagePairOut])
def get_language_pairs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(LanguagePair).filter(LanguagePair.user_id == current_user.id).all()


@router.get("/achievements")
def get_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).all()
    return [{"code": a.code, "title": a.title, "unlocked_at": a.unlocked_at} for a in achievements]


@router.get("/notifications", response_model=list[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.post("/notifications/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pair_count = db.query(LanguagePair).filter(LanguagePair.user_id == current_user.id).count()
    lessons_completed = (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(LanguagePair.user_id == current_user.id, Lesson.is_completed.is_(True))
        .count()
    )
    games_played = db.query(GameScore).filter(GameScore.user_id == current_user.id).count()
    study_minutes = sum(pair.daily_time_minutes for pair in current_user.language_pairs)
    unread_notifications = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read.is_(False)).count()
    week_start = utcnow_naive() - timedelta(days=7)
    weekly_lessons = (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(
            LanguagePair.user_id == current_user.id,
            Lesson.is_completed.is_(True),
            Lesson.completed_at >= week_start,
        )
        .all()
    )
    weekly_games = (
        db.query(GameScore)
        .filter(GameScore.user_id == current_user.id, GameScore.created_at >= week_start)
        .all()
    )
    active_dates = {
        lesson.completed_at.date() for lesson in weekly_lessons if lesson.completed_at
    } | {game.created_at.date() for game in weekly_games if game.created_at}
    vocabulary_scores = [
        game.score for game in db.query(GameScore).filter(
            GameScore.user_id == current_user.id,
            GameScore.game_type.in_(("vocabulary_learning", "vocab_match", "multiple_choice", "word_scramble")),
        ).all()
    ]
    translation_scores = [
        game.score for game in db.query(GameScore).filter(
            GameScore.user_id == current_user.id, GameScore.game_type == "translation"
        ).all()
    ]
    lesson_scores = [lesson.score for lesson in db.query(Lesson).join(LanguagePair).filter(
        LanguagePair.user_id == current_user.id, Lesson.is_completed.is_(True), Lesson.score.isnot(None)
    ).all()]

    def average(scores):
        return round(sum(scores) / len(scores)) if scores else 0

    current_level = "A1"
    if current_user.language_pairs:
        level_order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
        current_level = max(
            (pair.current_level for pair in current_user.language_pairs),
            key=lambda value: level_order.get(value, 0),
            default="A1",
        )

    recent_activities = []
    completed_lessons = (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(LanguagePair.user_id == current_user.id, Lesson.is_completed.is_(True))
        .order_by(Lesson.completed_at.desc())
        .limit(4)
        .all()
    )
    for lesson in completed_lessons:
        recent_activities.append(
            {
                "type": "lesson",
                "label": lesson.title,
                "detail": lesson.topic or "lesson",
                "value": f"{lesson.score or 0}%",
            }
        )

    for game in db.query(GameScore).filter(GameScore.user_id == current_user.id).order_by(GameScore.created_at.desc()).limit(3):
        recent_activities.append(
            {
                "type": "game",
                "label": game.game_type,
                "detail": "game session",
                "value": f"+{game.xp_earned} XP",
            }
        )

    weekly_goal = max(30, min(180, (pair_count or 1) * 30))
    weekly_progress = min(100, round((lessons_completed * 10 + games_played * 5) / max(weekly_goal / 2, 1) * 100))

    return {
        "xp": current_user.xp,
        "coins": current_user.coins,
        "streak_days": current_user.streak_days,
        "lessons_completed": lessons_completed,
        "games_played": games_played,
        "current_level": current_level,
        "study_minutes": study_minutes,
        "weekly_goal": weekly_goal,
        "weekly_progress": weekly_progress,
        "weekly_summary": {
            "lessons_completed": len(weekly_lessons),
            "games_played": len(weekly_games),
            "active_days": len(active_dates),
        },
        "skill_progress": {
            "vocabulary": average(vocabulary_scores),
            "translation": average(translation_scores),
            "lessons": average(lesson_scores),
        },
        "recent_activities": recent_activities[:5],
        "unread_notifications": unread_notifications,
    }


@router.get("/pronunciation")
def get_pronunciation_tip(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    latest_lesson = (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(LanguagePair.user_id == current_user.id)
        .order_by(Lesson.created_at.desc())
        .first()
    )

    vocabulary = (latest_lesson.content or {}).get("vocabulary", []) if latest_lesson else []
    word = "hello"
    if vocabulary:
        word = (vocabulary[0].get("word") or word).strip()

    pair = db.query(LanguagePair).filter(LanguagePair.user_id == current_user.id).order_by(LanguagePair.created_at.desc()).first()
    source_language = pair.source_language if pair else "Tajik"
    target_language = pair.target_language if pair else "English"

    tip = (
        gemini_service.analyze_message(
            source_language=source_language,
            target_language=target_language,
            level=pair.current_level if pair else "A1",
            user_message=f"How do I pronounce {word} clearly and naturally? Give me a short pronunciation tip.",
        )
        .get("reply")
        or f"Focus on the stressed syllable in '{word}'. Speak slowly and repeat it 5 times."
    )

    return {"word": word, "tip": tip}
