from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import Integer, case, cast, desc, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GameScore, LanguagePair, Lesson, User
from app.schemas import LeaderboardEntry
from app.security import get_current_user
from app.time_utils import utcnow_naive

router = APIRouter(prefix="/api/rating", tags=["rating"])

CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]


def _entry(user: User, xp: int, streak_days: int) -> LeaderboardEntry:
    return LeaderboardEntry(
        user_id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
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


def _period_start(period: str) -> Optional[datetime]:
    """Return the inclusive lower bound for a leaderboard period, or None for all-time."""
    now = utcnow_naive()
    if period == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "week":
        return now - timedelta(days=7)
    if period == "month":
        return now - timedelta(days=30)
    return None


def _normalize_region(region: Optional[str]) -> Optional[str]:
    if region is None:
        return None
    cleaned = region.strip()
    return cleaned or None


def _lesson_xp_expr():
    """Mirror the XP a completed lesson awards: ``max(10, score // 2)``."""
    return cast(case((Lesson.score >= 20, Lesson.score / 2), else_=10), Integer)


def _period_xp_by_user(db: Session, since: Optional[datetime]) -> dict:
    """XP earned per user since ``since`` from games and completed lessons."""
    totals: dict = {}

    game_rows = (
        db.query(GameScore.user_id, func.coalesce(func.sum(GameScore.xp_earned), 0))
        .filter(GameScore.created_at >= since)
        .group_by(GameScore.user_id)
        .all()
    )
    for user_id, xp in game_rows:
        totals[user_id] = totals.get(user_id, 0) + int(xp or 0)

    lesson_rows = (
        db.query(LanguagePair.user_id, func.coalesce(func.sum(_lesson_xp_expr()), 0))
        .join(Lesson, Lesson.language_pair_id == LanguagePair.id)
        .filter(Lesson.is_completed.is_(True), Lesson.completed_at >= since)
        .group_by(LanguagePair.user_id)
        .all()
    )
    for user_id, xp in lesson_rows:
        totals[user_id] = totals.get(user_id, 0) + int(xp or 0)

    return totals


def _period_xp_by_pair(db: Session, since: Optional[datetime]) -> dict:
    """XP earned per language pair since ``since`` from games and completed lessons."""
    totals: dict = {}

    game_rows = (
        db.query(GameScore.language_pair_id, func.coalesce(func.sum(GameScore.xp_earned), 0))
        .filter(GameScore.created_at >= since, GameScore.language_pair_id.isnot(None))
        .group_by(GameScore.language_pair_id)
        .all()
    )
    for pair_id, xp in game_rows:
        totals[pair_id] = totals.get(pair_id, 0) + int(xp or 0)

    lesson_rows = (
        db.query(Lesson.language_pair_id, func.coalesce(func.sum(_lesson_xp_expr()), 0))
        .filter(Lesson.is_completed.is_(True), Lesson.completed_at >= since)
        .group_by(Lesson.language_pair_id)
        .all()
    )
    for pair_id, xp in lesson_rows:
        totals[pair_id] = totals.get(pair_id, 0) + int(xp or 0)

    return totals


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(
    limit: int = 50,
    pair_id: Optional[int] = Query(default=None),
    period: str = Query(default="all", pattern="^(all|today|week|month)$"),
    level: Optional[str] = Query(default=None, pattern="^(A1|A2|B1|B2|C1|C2)$"),
    region: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rank learners globally, or — with ``pair_id`` — within one language pair.

    Pair scoping ranks everyone studying the same source→target combination by
    that pair's XP, so every language combination gets its own rating.

    ``period`` switches between all-time XP and XP earned today / this week /
    this month. ``level`` and ``region`` narrow the ranked learners further.
    """
    since = _period_start(period)
    region_value = _normalize_region(region)

    if pair_id is not None:
        my_pair = _owned_pair(db, pair_id, current_user.id)
        if my_pair:
            query = (
                db.query(LanguagePair, User)
                .join(User, User.id == LanguagePair.user_id)
                .filter(
                    LanguagePair.source_language == my_pair.source_language,
                    LanguagePair.target_language == my_pair.target_language,
                    User.is_active.is_(True),
                )
            )
            if level:
                query = query.filter(LanguagePair.current_level == level)
            if region_value:
                query = query.filter(User.region == region_value)

            if since is not None:
                pair_xp = _period_xp_by_pair(db, since)
                rows = sorted(
                    query.all(),
                    key=lambda pu: pair_xp.get(pu[0].id, 0),
                    reverse=True,
                )[:limit]
                return [
                    _entry(user, pair_xp.get(pair.id, 0), pair.streak_days)
                    for pair, user in rows
                ]

            rows = query.order_by(desc(LanguagePair.xp)).limit(limit).all()
            return [_entry(user, pair.xp, pair.streak_days) for pair, user in rows]

    users_query = db.query(User).filter(User.is_active.is_(True))
    if region_value:
        users_query = users_query.filter(User.region == region_value)
    if level:
        level_user_ids = (
            db.query(LanguagePair.user_id)
            .filter(LanguagePair.current_level == level)
            .distinct()
        )
        users_query = users_query.filter(User.id.in_(level_user_ids))

    if since is not None:
        user_xp = _period_xp_by_user(db, since)
        users = sorted(
            users_query.all(),
            key=lambda u: user_xp.get(u.id, 0),
            reverse=True,
        )[:limit]
        return [
            _entry(user, user_xp.get(user.id, 0), user.streak_days)
            for user in users
        ]

    users = users_query.order_by(desc(User.xp)).limit(limit).all()
    return [_entry(user, user.xp, user.streak_days) for user in users]


@router.get("/me", response_model=LeaderboardEntry)
def my_rating(
    pair_id: Optional[int] = Query(default=None),
    period: str = Query(default="all", pattern="^(all|today|week|month)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = _period_start(period)
    if pair_id is not None:
        pair = _owned_pair(db, pair_id, current_user.id)
        if pair:
            if since is not None:
                pair_xp = _period_xp_by_pair(db, since)
                return _entry(current_user, pair_xp.get(pair.id, 0), pair.streak_days)
            return _entry(current_user, pair.xp, pair.streak_days)
    if since is not None:
        user_xp = _period_xp_by_user(db, since)
        return _entry(current_user, user_xp.get(current_user.id, 0), current_user.streak_days)
    return _entry(current_user, current_user.xp, current_user.streak_days)


@router.get("/filters")
def rating_filters():
    """Available level and period options for the rating filter controls."""
    return {"levels": CEFR_LEVELS, "periods": ["all", "today", "week", "month"]}

