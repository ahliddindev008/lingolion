"""Achievement unlock logic — call check_achievements() after XP/streak/score changes."""
from sqlalchemy.orm import Session

from app.models import Achievement, GameScore, Lesson, LanguagePair, User

# code -> (title, predicate(user, db) -> bool)
def _completed_lessons_count(user: User, db: Session) -> int:
    return (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(LanguagePair.user_id == user.id, Lesson.is_completed.is_(True))
        .count()
    )


def _perfect_lesson_exists(user: User, db: Session) -> bool:
    return (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(LanguagePair.user_id == user.id, Lesson.score == 100)
        .first()
        is not None
    )


def _games_played_count(user: User, db: Session) -> int:
    return db.query(GameScore).filter(GameScore.user_id == user.id).count()


ACHIEVEMENTS = [
    ("first_lesson", "Дарси аввал", lambda u, db: _completed_lessons_count(u, db) >= 1),
    ("lessons_10", "10 дарс анҷом дода шуд", lambda u, db: _completed_lessons_count(u, db) >= 10),
    ("perfect_score", "Натиҷаи 100%", lambda u, db: _perfect_lesson_exists(u, db)),
    ("streak_7", "Силсилаи 7-рӯза", lambda u, db: (u.streak_days or 0) >= 7),
    ("streak_30", "Силсилаи 30-рӯза", lambda u, db: (u.streak_days or 0) >= 30),
    ("xp_100", "100 XP", lambda u, db: (u.xp or 0) >= 100),
    ("xp_1000", "1000 XP", lambda u, db: (u.xp or 0) >= 1000),
    ("game_master", "10 бозӣ анҷом дода шуд", lambda u, db: _games_played_count(u, db) >= 10),
]


def check_achievements(db: Session, user: User) -> list[Achievement]:
    """Evaluate all achievement predicates and persist any newly unlocked ones."""
    existing_codes = {a.code for a in db.query(Achievement).filter(Achievement.user_id == user.id).all()}
    newly_unlocked = []

    for code, title, predicate in ACHIEVEMENTS:
        if code in existing_codes:
            continue
        try:
            if predicate(user, db):
                achievement = Achievement(user_id=user.id, code=code, title=title)
                db.add(achievement)
                newly_unlocked.append(achievement)
        except Exception:
            continue

    if newly_unlocked:
        db.commit()
        for a in newly_unlocked:
            db.refresh(a)
    return newly_unlocked
