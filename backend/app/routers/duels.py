import random
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GameDuel, LanguagePair, Notification, User
from app.routers.games import _get_unlocked_topics
from app.security import get_current_user
from app.social import is_practice_partner
from app.time_utils import utcnow_naive

router = APIRouter(prefix="/api/duels", tags=["duels"])

# vocab_match always ends 100% (pure matching) and vocabulary_learning has its
# own summary flow, so neither can produce a fair comparison.
DUEL_GAME_TYPES = (
    "translation|speed_challenge|multiple_choice|word_scramble|"
    "listening|speaking|writing|reading"
)
LANGUAGE_PATTERN = "^(tj|ru|en|de|fr|es|it|tr|ar|fa|zh-CN|ja)$"
STAKE_OPTIONS = (10, 25, 50, 100)
PENDING_EXPIRY_HOURS = 72


class DuelCreateRequest(BaseModel):
    language_pair_id: int = Field(ge=1)
    opponent_id: int = Field(ge=1)
    game_type: str = Field(pattern=f"^({DUEL_GAME_TYPES})$")
    topic_id: str = Field(min_length=1, max_length=50)
    stake: int
    source_language: str = Field(pattern=LANGUAGE_PATTERN)
    target_language: str = Field(pattern=LANGUAGE_PATTERN)


class DuelSubmitRequest(BaseModel):
    score: int = Field(ge=0, le=100)


def _duel_out(db: Session, duel: GameDuel, viewer_id: int) -> dict:
    counterparty_id = duel.opponent_id if duel.challenger_id == viewer_id else duel.challenger_id
    counterparty = db.query(User).filter(User.id == counterparty_id).first()
    my_score = duel.challenger_score if duel.challenger_id == viewer_id else duel.opponent_score
    their_score = duel.opponent_score if duel.challenger_id == viewer_id else duel.challenger_score
    return {
        "id": duel.id,
        "role": "challenger" if duel.challenger_id == viewer_id else "opponent",
        "counterparty_name": f"{counterparty.first_name} {counterparty.last_name}" if counterparty else "—",
        "game_type": duel.game_type,
        "topic_id": duel.topic_id,
        "stake": duel.stake,
        "status": duel.status,
        "source_language": duel.source_language,
        "target_language": duel.target_language,
        "my_score": my_score,
        "their_score": their_score,
        "winner_id": duel.winner_id,
        "i_won": duel.status == "finished" and duel.winner_id == viewer_id if duel.winner_id else False,
        "created_at": duel.created_at.isoformat() if duel.created_at else None,
        "can_accept": duel.status == "pending" and duel.opponent_id == viewer_id,
        "can_cancel": duel.status == "pending" and duel.challenger_id == viewer_id,
        "i_submitted": my_score is not None,
    }


def _expire_stale_pending(db: Session, user_id: int) -> None:
    """Refund the challenger on pending duels older than the expiry window."""
    stale = (
        db.query(GameDuel)
        .filter(
            GameDuel.status == "pending",
            GameDuel.expires_at < utcnow_naive(),
            or_(GameDuel.challenger_id == user_id, GameDuel.opponent_id == user_id),
        )
        .all()
    )
    for duel in stale:
        challenger = db.query(User).filter(User.id == duel.challenger_id).first()
        if challenger:
            challenger.coins = (challenger.coins or 0) + duel.stake
        duel.status = "expired"
    if stale:
        db.commit()


def _owned_duel(db: Session, duel_id: int, user_id: int) -> GameDuel:
    duel = (
        db.query(GameDuel)
        .filter(
            GameDuel.id == duel_id,
            or_(GameDuel.challenger_id == user_id, GameDuel.opponent_id == user_id),
        )
        .first()
    )
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")
    return duel
