from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.achievements import check_achievements
from app.daily_challenges import advance_progress
from app.database import get_db
from app.models import GameScore, LanguagePair, User
from app.schemas import GameScoreSubmit
from app.security import get_current_user
from app.websocket_manager import bump_streak

router = APIRouter(prefix="/api/games", tags=["games"])

_GAME_TOPIC_IDS = ("greetings", "cafe", "travel")
_GAME_TYPE_PATTERN = "^(vocabulary_learning|vocab_match|translation|speed_challenge|multiple_choice|word_scramble|listening|speaking|writing|reading)$"
_TOPIC_UNLOCK_SCORE = 80

_XP_MULTIPLIER = {
    "vocabulary_learning": 0.3,
    "vocab_match": 0.3,
    "translation": 0.4,
    "speed_challenge": 0.5,
    "multiple_choice": 0.35,
    "word_scramble": 0.4,
    "listening": 0.4,
    "speaking": 0.5,
    "writing": 0.45,
    "reading": 0.4,
}


def _get_owned_language_pair(db: Session, user_id: int, pair_id: int) -> LanguagePair:
    pair = (
        db.query(LanguagePair)
        .filter(LanguagePair.id == pair_id, LanguagePair.user_id == user_id)
        .first()
    )
    if not pair:
        raise HTTPException(status_code=404, detail="Language pair not found")
    return pair


def _get_unlocked_topics(db: Session, user_id: int, game_type: str, pair_id: int) -> list[str]:
    completed_topics = {
        topic_id
        for (topic_id,) in (
            db.query(GameScore.topic_id)
            .filter(
                GameScore.user_id == user_id,
                GameScore.game_type == game_type,
                GameScore.language_pair_id == pair_id,
                GameScore.score >= _TOPIC_UNLOCK_SCORE,
                GameScore.topic_id.in_(_GAME_TOPIC_IDS),
            )
            .distinct()
            .all()
        )
    }
    unlocked = [_GAME_TOPIC_IDS[0]]
    for previous_topic, next_topic in zip(_GAME_TOPIC_IDS, _GAME_TOPIC_IDS[1:]):
        if previous_topic not in completed_topics:
            break
        unlocked.append(next_topic)
    return unlocked


@router.get("/progress")
def get_game_progress(
    game_type: str = Query(pattern=_GAME_TYPE_PATTERN),
    language_pair_id: int = Query(ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_language_pair(db, current_user.id, language_pair_id)
    return {
        "unlocked_topics": _get_unlocked_topics(db, current_user.id, game_type, language_pair_id),
        "unlock_score": _TOPIC_UNLOCK_SCORE,
    }


@router.post("/submit")
def submit_score(
    payload: GameScoreSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    unlocked_topics_before = None
    if payload.topic_id is not None:
        if payload.language_pair_id is None:
            raise HTTPException(status_code=422, detail="A language pair is required for topic progress")
        if payload.score > 100:
            raise HTTPException(status_code=422, detail="Topic scores must be percentages from 0 to 100")
        _get_owned_language_pair(db, current_user.id, payload.language_pair_id)
        unlocked_topics_before = _get_unlocked_topics(
            db, current_user.id, payload.game_type, payload.language_pair_id
        )
        if payload.topic_id not in unlocked_topics_before:
            raise HTTPException(status_code=409, detail="This game topic is locked")

    xp_earned = int(payload.score * _XP_MULTIPLIER.get(payload.game_type, 0.3))

    game_score = GameScore(
        user_id=current_user.id,
        game_type=payload.game_type,
        topic_id=payload.topic_id,
        language_pair_id=payload.language_pair_id,
        score=payload.score,
        xp_earned=xp_earned,
    )
    db.add(game_score)

    current_user.xp += xp_earned
    current_user.coins += xp_earned // 3
    bump_streak(current_user)

    if payload.language_pair_id:
        pair = (
            db.query(LanguagePair)
            .filter(LanguagePair.id == payload.language_pair_id, LanguagePair.user_id == current_user.id)
            .first()
        )
        if pair:
            pair.xp += xp_earned

    db.commit()

    if payload.score >= 80:
        advance_progress(db, current_user, "score_game", 1)
    check_achievements(db, current_user)

    topic_unlocked = False
    if unlocked_topics_before is not None and payload.score >= _TOPIC_UNLOCK_SCORE:
        unlocked_topics_after = _get_unlocked_topics(
            db, current_user.id, payload.game_type, payload.language_pair_id
        )
        topic_unlocked = len(unlocked_topics_after) > len(unlocked_topics_before)

    return {
        "xp_earned": xp_earned,
        "total_xp": current_user.xp,
        "coins": current_user.coins,
        "topic_unlocked": topic_unlocked,
    }
