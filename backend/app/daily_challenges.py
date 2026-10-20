"""Daily challenge generation and progress tracking."""
from datetime import date

from sqlalchemy.orm import Session

from app.models import DailyChallenge, User

# Fixed set of daily challenges — simple and predictable, refreshed once per day.
CHALLENGE_TEMPLATES = [
    {"code": "complete_lesson", "title": "Як дарсро анҷом диҳед", "target": 1, "xp_reward": 20},
    {"code": "score_game", "title": "Дар бозӣ 80%+ ба даст оред", "target": 1, "xp_reward": 20},
    {"code": "send_messages", "title": "5 паём ба AI Тутор фиристед", "target": 5, "xp_reward": 15},
]


def get_or_create_today(db: Session, user: User) -> list[DailyChallenge]:
    today = date.today()
    challenges = (
        db.query(DailyChallenge)
        .filter(DailyChallenge.user_id == user.id, DailyChallenge.challenge_date == today)
        .all()
    )
    if challenges:
        return challenges

    challenges = []
    for template in CHALLENGE_TEMPLATES:
        challenge = DailyChallenge(
            user_id=user.id,
            challenge_date=today,
            code=template["code"],
            title=template["title"],
            target=template["target"],
            xp_reward=template["xp_reward"],
        )
        db.add(challenge)
        challenges.append(challenge)
    db.commit()
    for c in challenges:
        db.refresh(c)
    return challenges


def advance_progress(db: Session, user: User, code: str, amount: int = 1) -> None:
    """Increment today's progress for a challenge code and award XP once on completion."""
    today = date.today()
    get_or_create_today(db, user)
    challenge = (
        db.query(DailyChallenge)
        .filter(
            DailyChallenge.user_id == user.id,
            DailyChallenge.challenge_date == today,
            DailyChallenge.code == code,
            DailyChallenge.completed.is_(False),
        )
        .first()
    )
    if not challenge:
        return

    challenge.progress = min(challenge.target, (challenge.progress or 0) + amount)
    if challenge.progress >= challenge.target:
        challenge.completed = True
        user.xp = (user.xp or 0) + challenge.xp_reward
        user.coins = (user.coins or 0) + challenge.xp_reward // 2
    db.commit()
