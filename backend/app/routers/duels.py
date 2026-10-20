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
from app.social import shares_language_pair
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
        "pot": (duel.stake or 0) * 2,
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


def _user_name(db: Session, user: User) -> str:
    return f"{user.first_name} {user.last_name}".strip() or user.email


def _resolve_duel(db: Session, duel: GameDuel) -> None:
    """Settle a finished duel: the winner takes the pot, a draw refunds both."""
    duel.status = "finished"
    duel.resolved_at = utcnow_naive()
    challenger = db.query(User).filter(User.id == duel.challenger_id).first()
    opponent = db.query(User).filter(User.id == duel.opponent_id).first()

    if duel.challenger_score == duel.opponent_score:
        duel.winner_id = None
        if challenger:
            challenger.coins = (challenger.coins or 0) + duel.stake
        if opponent:
            opponent.coins = (opponent.coins or 0) + duel.stake
        for player in (challenger, opponent):
            if player:
                db.add(Notification(
                    user_id=player.id,
                    title="Duel finished",
                    message="Draw — your stake was returned.",
                    kind="duel",
                ))
        return

    winner = challenger if (duel.challenger_score or 0) > (duel.opponent_score or 0) else opponent
    duel.winner_id = winner.id if winner else None
    if winner:
        winner.coins = (winner.coins or 0) + duel.stake * 2
    challenger_won = winner is challenger
    for player, won in ((challenger, challenger_won), (opponent, not challenger_won)):
        if player:
            db.add(Notification(
                user_id=player.id,
                title="Duel finished",
                message=f"You won {duel.stake * 2} coins!" if won else "You lost the duel.",
                kind="duel",
            ))


@router.get("")
def list_duels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """All duels the current user takes part in (newest first)."""
    _expire_stale_pending(db, current_user.id)
    duels = (
        db.query(GameDuel)
        .filter(or_(GameDuel.challenger_id == current_user.id, GameDuel.opponent_id == current_user.id))
        .order_by(GameDuel.id.desc())
        .limit(50)
        .all()
    )
    return [_duel_out(db, duel, current_user.id) for duel in duels]


@router.post("", status_code=201)
def create_duel(
    payload: DuelCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Challenge a friend; the stake is escrowed until the duel resolves."""
    _expire_stale_pending(db, current_user.id)
    if payload.stake not in STAKE_OPTIONS:
        raise HTTPException(status_code=422, detail="Invalid stake")
    if payload.opponent_id == current_user.id:
        raise HTTPException(status_code=422, detail="Cannot challenge yourself")

    opponent = db.query(User).filter(User.id == payload.opponent_id, User.is_active.is_(True)).first()
    if not opponent:
        raise HTTPException(status_code=404, detail="Opponent not found")
    if not shares_language_pair(db, current_user.id, opponent.id):
        raise HTTPException(status_code=403, detail="Opponent is not your practice partner")

    pair = (
        db.query(LanguagePair)
        .filter(LanguagePair.id == payload.language_pair_id, LanguagePair.user_id == current_user.id)
        .first()
    )
    if not pair:
        raise HTTPException(status_code=404, detail="Language pair not found")
    if payload.topic_id not in _get_unlocked_topics(db, current_user.id, payload.game_type, payload.language_pair_id):
        raise HTTPException(status_code=403, detail="Topic is locked")
    if (current_user.coins or 0) < payload.stake:
        raise HTTPException(status_code=402, detail="Not enough coins")

    current_user.coins = (current_user.coins or 0) - payload.stake
    duel = GameDuel(
        challenger_id=current_user.id,
        opponent_id=opponent.id,
        game_type=payload.game_type,
        topic_id=payload.topic_id,
        stake=payload.stake,
        source_language=payload.source_language,
        target_language=payload.target_language,
        # Same seed on both sides → both players answer the same questions.
        seed=random.randint(1, 2**31 - 1),
        status="pending",
        expires_at=utcnow_naive() + timedelta(hours=PENDING_EXPIRY_HOURS),
    )
    db.add(duel)
    db.flush()
    db.add(Notification(
        user_id=opponent.id,
        title="Game challenge",
        message=f"{_user_name(db, current_user)} challenges you for {payload.stake} coins!",
        kind="duel",
    ))
    db.commit()
    db.refresh(duel)
    return _duel_out(db, duel, current_user.id)


@router.post("/{duel_id}/accept")
def accept_duel(
    duel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """The opponent escrows their stake and the duel goes live."""
    _expire_stale_pending(db, current_user.id)
    duel = _owned_duel(db, duel_id, current_user.id)
    if duel.status != "pending" or duel.opponent_id != current_user.id:
        raise HTTPException(status_code=409, detail="Duel cannot be accepted")
    if (current_user.coins or 0) < duel.stake:
        raise HTTPException(status_code=402, detail="Not enough coins")

    current_user.coins = (current_user.coins or 0) - duel.stake
    duel.status = "active"
    db.add(Notification(
        user_id=duel.challenger_id,
        title="Challenge accepted",
        message=f"{_user_name(db, current_user)} accepted the duel for {duel.stake} coins!",
        kind="duel",
    ))
    db.commit()
    db.refresh(duel)
    return _duel_out(db, duel, current_user.id)


@router.post("/{duel_id}/decline")
def decline_duel(
    duel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """The opponent refuses; the challenger gets their stake back."""
    duel = _owned_duel(db, duel_id, current_user.id)
    if duel.status != "pending" or duel.opponent_id != current_user.id:
        raise HTTPException(status_code=409, detail="Duel cannot be declined")
    duel.status = "declined"
    challenger = db.query(User).filter(User.id == duel.challenger_id).first()
    if challenger:
        challenger.coins = (challenger.coins or 0) + duel.stake
    db.add(Notification(
        user_id=duel.challenger_id,
        title="Challenge declined",
        message=f"{_user_name(db, current_user)} declined the duel. Your stake was returned.",
        kind="duel",
    ))
    db.commit()
    db.refresh(duel)
    return _duel_out(db, duel, current_user.id)


@router.post("/{duel_id}/cancel")
def cancel_duel(
    duel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """The challenger withdraws a pending challenge and keeps their stake."""
    duel = _owned_duel(db, duel_id, current_user.id)
    if duel.status != "pending" or duel.challenger_id != current_user.id:
        raise HTTPException(status_code=409, detail="Duel cannot be cancelled")
    duel.status = "cancelled"
    current_user.coins = (current_user.coins or 0) + duel.stake
    db.add(Notification(
        user_id=duel.opponent_id,
        title="Challenge cancelled",
        message=f"{_user_name(db, current_user)} cancelled the duel.",
        kind="duel",
    ))
    db.commit()
    db.refresh(duel)
    return _duel_out(db, duel, current_user.id)


@router.post("/{duel_id}/submit")
def submit_duel_score(
    duel_id: int,
    payload: DuelSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a player's score; the duel settles once both scores are in."""
    duel = _owned_duel(db, duel_id, current_user.id)
    if duel.status != "active":
        raise HTTPException(status_code=409, detail="Duel is not active")

    if duel.challenger_id == current_user.id:
        if duel.challenger_score is not None:
            raise HTTPException(status_code=409, detail="Score already submitted")
        duel.challenger_score = payload.score
        other_id, other_score = duel.opponent_id, duel.opponent_score
    else:
        if duel.opponent_score is not None:
            raise HTTPException(status_code=409, detail="Score already submitted")
        duel.opponent_score = payload.score
        other_id, other_score = duel.challenger_id, duel.challenger_score

    if other_score is None:
        db.add(Notification(
            user_id=other_id,
            title="Your turn",
            message=f"{_user_name(db, current_user)} has already played the duel — your turn!",
            kind="duel",
        ))
    else:
        _resolve_duel(db, duel)
    db.commit()
    db.refresh(duel)
    return _duel_out(db, duel, current_user.id)
