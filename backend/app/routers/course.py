from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import gemini_service
from app.achievements import check_achievements
from app.course_catalog import CEFR_LEVELS, COURSE_UNITS_PER_LEVEL, course_lesson_type
from app.daily_challenges import advance_progress
from app.database import get_db
from app.models import (
    LanguagePair,
    Lesson,
    Notification,
    SharedCourseLessonContent,
    SharedCustomLessonContent,
    SharedSpeakingPracticeContent,
    User,
)
from app.schemas import (
    CustomLessonGenerateRequest,
    LanguagePairCreate,
    LanguagePairOut,
    LanguagePairUpdate,
    LessonCompleteRequest,
    LessonGenerateRequest,
    LessonOut,
    PlacementResult,
    SpeakingPracticeGenerateRequest,
)
from app.security import get_current_user
from app.time_utils import utcnow_naive
from app.websocket_manager import bump_streak

router = APIRouter(prefix="/api/course", tags=["course"])
_CEFR_LEVELS = CEFR_LEVELS
_UNITS_PER_LEVEL = COURSE_UNITS_PER_LEVEL
_PASS_SCORE = 80
_LESSON_UNAVAILABLE_MESSAGE = "Lesson content is temporarily unavailable. Please try again shortly."
_SPEAKING_PRACTICE_TRACK = "conversation-v1"
_SPEAKING_PRACTICE_TOPICS = (
    ("introductions", "Meeting someone new"),
    ("daily_life", "Daily life and routines"),
    ("cafe", "Ordering at a cafe"),
    ("directions", "Finding your way around"),
    ("shopping", "Shopping and choosing"),
    ("work_study", "Work and study"),
    ("health", "Health and appointments"),
    ("social_plans", "Making social plans"),
    ("travel", "Travel and getting help"),
    ("stories_opinions", "Sharing stories and opinions"),
)
_SPEAKING_PRACTICE_LEVELS = ("A1", "A2", "B1", "B2", "C1")


def _get_owned_pair(db: Session, pair_id: int, user: User) -> LanguagePair:
    pair = db.query(LanguagePair).filter(LanguagePair.id == pair_id, LanguagePair.user_id == user.id).first()
    if not pair:
        raise HTTPException(status_code=404, detail="Language pair not found")
    return pair


def _lesson_content_unavailable(content: dict) -> bool:
    return content.get("grammar_explanation") == _LESSON_UNAVAILABLE_MESSAGE


def _has_speaking_conversation(content: dict) -> bool:
    conversation = content.get("conversation")
    return (
        isinstance(conversation, list)
        and len(conversation) == 4
        and all(isinstance(turn, dict) for turn in conversation)
    )


def _normalize_custom_topic(topic: str) -> str:
    """Lower-case, whitespace-collapsed topic so equal requests share one cached lesson."""
    return " ".join(topic.casefold().split())


def _shared_custom_content(db: Session, pair: LanguagePair, level: str, topic_key: str) -> SharedCustomLessonContent | None:
    return (
        db.query(SharedCustomLessonContent)
        .filter(
            SharedCustomLessonContent.source_language == pair.source_language,
            SharedCustomLessonContent.target_language == pair.target_language,
            SharedCustomLessonContent.level == level,
            SharedCustomLessonContent.topic_key == topic_key,
        )
        .first()
    )


def _course_lessons(db: Session, pair: LanguagePair, level: str) -> dict[int, Lesson]:
    lessons = (
        db.query(Lesson)
        .filter(Lesson.language_pair_id == pair.id, Lesson.level == level)
        .order_by(Lesson.created_at.desc(), Lesson.id.desc())
        .all()
    )
    units = {}
    for lesson in lessons:
        content = lesson.content or {}
        if content.get("offline") is True:
            continue
        if _lesson_content_unavailable(content):
            continue
        unit_number = content.get("course_unit")
        if isinstance(unit_number, int) and 1 <= unit_number <= _UNITS_PER_LEVEL + 1:
            units.setdefault(unit_number, lesson)
    return units


def _unit_type(unit_number: int) -> str:
    return course_lesson_type(unit_number)


def _is_passed(lesson: Lesson | None) -> bool:
    return bool(lesson and lesson.is_completed and (lesson.score or 0) >= _PASS_SCORE)


def _speaking_practice_level(unit_number: int) -> str:
    return _SPEAKING_PRACTICE_LEVELS[(unit_number - 1) // 10]


def _speaking_practice_lessons(db: Session, pair_id: int) -> dict[int, Lesson]:
    lessons = (
        db.query(Lesson)
        .filter(Lesson.language_pair_id == pair_id)
        .order_by(Lesson.created_at.desc(), Lesson.id.desc())
        .all()
    )
    units: dict[int, Lesson] = {}
    for lesson in lessons:
        content = lesson.content or {}
        unit_number = content.get("speaking_practice_unit")
        if (
            content.get("speaking_practice_track") == _SPEAKING_PRACTICE_TRACK
            and isinstance(unit_number, int)
            and 1 <= unit_number <= 50
        ):
            units.setdefault(unit_number, lesson)
    return units


def _speaking_practice_status(db: Session, pair: LanguagePair) -> dict:
    lessons = _speaking_practice_lessons(db, pair.id)
    next_unit = next(
        (unit_number for unit_number in range(1, 51) if not _is_passed(lessons.get(unit_number))),
        51,
    )
    units = []
    for unit_number in range(1, 51):
        lesson = lessons.get(unit_number)
        passed = _is_passed(lesson)
        topic_id, topic = _SPEAKING_PRACTICE_TOPICS[(unit_number - 1) % len(_SPEAKING_PRACTICE_TOPICS)]
        units.append({
            "unit_number": unit_number,
            "level": _speaking_practice_level(unit_number),
            "topic_id": topic_id,
            "topic": topic,
            "lesson_id": lesson.id if lesson else None,
            "title": lesson.title if lesson else None,
            "score": lesson.score if lesson else None,
            "status": "completed" if passed else "available" if unit_number == next_unit else "locked",
        })
    return {
        "unit_count": 50,
        "completed_count": sum(_is_passed(lessons.get(number)) for number in range(1, 51)),
        "required_score": _PASS_SCORE,
        "units": units,
    }


def _curriculum_status(db: Session, pair: LanguagePair) -> dict:
    level = pair.current_level
    units = _course_lessons(db, pair, level)
    next_unit = next(
        (unit_number for unit_number in range(1, _UNITS_PER_LEVEL + 1) if not _is_passed(units.get(unit_number))),
        _UNITS_PER_LEVEL + 1,
    )
    entries = []
    for unit_number in range(1, _UNITS_PER_LEVEL + 1):
        lesson = units.get(unit_number)
        passed = _is_passed(lesson)
        entries.append({
            "unit_number": unit_number,
            "lesson_type": _unit_type(unit_number),
            "lesson_id": lesson.id if lesson else None,
            "title": lesson.title if lesson else None,
            "score": lesson.score if lesson else None,
            "status": "completed" if passed else "available" if unit_number == next_unit else "locked",
        })
    exam = units.get(_UNITS_PER_LEVEL + 1)
    exam_passed = _is_passed(exam)
    return {
        "level": level,
        "unit_count": _UNITS_PER_LEVEL,
        "required_score": _PASS_SCORE,
        "completed_count": sum(_is_passed(units.get(number)) for number in range(1, _UNITS_PER_LEVEL + 1)),
        "units": entries,
        "exam": {
            "lesson_id": exam.id if exam else None,
            "score": exam.score if exam else None,
            "status": "passed" if exam_passed else "available" if next_unit == _UNITS_PER_LEVEL + 1 else "locked",
        },
    }


@router.get("/pairs", response_model=list[LanguagePairOut])
def list_pairs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(LanguagePair).filter(LanguagePair.user_id == current_user.id).all()


@router.post("/pairs", response_model=LanguagePairOut)
def create_pair(
    payload: LanguagePairCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if payload.source_language.strip().lower() == payload.target_language.strip().lower():
        raise HTTPException(status_code=400, detail="Source and target languages must differ")

    existing = (
        db.query(LanguagePair)
        .filter(
            LanguagePair.user_id == current_user.id,
            LanguagePair.source_language == payload.source_language,
            LanguagePair.target_language == payload.target_language,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Language pair already exists")
    pair = LanguagePair(user_id=current_user.id, **payload.model_dump())
    db.add(pair)
    db.commit()
    db.refresh(pair)
    return pair


@router.patch("/pairs/{pair_id}", response_model=LanguagePairOut)
def update_pair(
    pair_id: int,
    payload: LanguagePairUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, pair_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pair, field, value)
    db.commit()
    db.refresh(pair)
    return pair


@router.get("/pairs/{pair_id}/lessons", response_model=list[LessonOut])
def list_lessons(pair_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pair = _get_owned_pair(db, pair_id, current_user)
    return db.query(Lesson).filter(Lesson.language_pair_id == pair.id).order_by(Lesson.created_at.desc()).all()


@router.get("/pairs/{pair_id}/curriculum")
def get_curriculum(
    pair_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, pair_id, current_user)
    return _curriculum_status(db, pair)


@router.get("/pairs/{pair_id}/speaking-practice")
def get_speaking_practice(
    pair_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, pair_id, current_user)
    return _speaking_practice_status(db, pair)


@router.post("/speaking-practice/generate", response_model=LessonOut)
def generate_speaking_practice_lesson(
    payload: SpeakingPracticeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, payload.language_pair_id, current_user)
    status = _speaking_practice_status(db, pair)
    unit = status["units"][payload.unit_number - 1]
    existing = _speaking_practice_lessons(db, pair.id).get(payload.unit_number)
    if unit["status"] == "locked":
        raise HTTPException(status_code=409, detail="Complete the previous speaking practice lesson first")
    if existing and _has_speaking_conversation(existing.content or {}):
        return existing

    topic_id, topic = _SPEAKING_PRACTICE_TOPICS[(payload.unit_number - 1) % len(_SPEAKING_PRACTICE_TOPICS)]
    level = _speaking_practice_level(payload.unit_number)
    shared_content = (
        db.query(SharedSpeakingPracticeContent)
        .filter(
            SharedSpeakingPracticeContent.source_language == pair.source_language,
            SharedSpeakingPracticeContent.target_language == pair.target_language,
            SharedSpeakingPracticeContent.level == level,
            SharedSpeakingPracticeContent.unit_number == payload.unit_number,
        )
        .first()
    )

    if shared_content:
        content = dict(shared_content.content)
    else:
        content = gemini_service.generate_lesson(
            source_language=pair.source_language,
            target_language=pair.target_language,
            level=level,
            topic=topic,
            lesson_type="speaking",
            unit_number=None,
        )
        if not isinstance(content, dict) or _lesson_content_unavailable(content):
            raise HTTPException(status_code=503, detail="lesson_content_unavailable")
        if not _has_speaking_conversation(content):
            raise HTTPException(status_code=503, detail="speaking_conversation_unavailable")
        content.update({
            "speaking_practice_track": _SPEAKING_PRACTICE_TRACK,
            "speaking_practice_unit": payload.unit_number,
            "speaking_practice_topic": topic_id,
            "lesson_type": "speaking",
        })
        shared_content = SharedSpeakingPracticeContent(
            source_language=pair.source_language,
            target_language=pair.target_language,
            level=level,
            unit_number=payload.unit_number,
            title=content.get("title", topic),
            topic=content.get("topic", topic),
            content=content,
        )
        db.add(shared_content)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            shared_content = (
                db.query(SharedSpeakingPracticeContent)
                .filter(
                    SharedSpeakingPracticeContent.source_language == pair.source_language,
                    SharedSpeakingPracticeContent.target_language == pair.target_language,
                    SharedSpeakingPracticeContent.level == level,
                    SharedSpeakingPracticeContent.unit_number == payload.unit_number,
                )
                .first()
            )
            if shared_content is None:
                raise
            content = dict(shared_content.content)

    if existing:
        existing.title = content.get("title", topic)
        existing.level = level
        existing.topic = topic
        existing.content = content
        db.commit()
        db.refresh(existing)
        return existing

    lesson = Lesson(
        language_pair_id=pair.id,
        title=content.get("title", topic),
        level=level,
        topic=topic,
        content=content,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get("/review")
def review_queue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lessons = (
        db.query(Lesson)
        .join(LanguagePair)
        .filter(LanguagePair.user_id == current_user.id)
        .order_by(Lesson.created_at.desc())
        .all()
    )

    review_items = []
    seen_words = set()
    for lesson in lessons:
        content = lesson.content or {}
        for vocab in content.get("vocabulary", []):
            word = (vocab.get("word") or "").strip()
            if not word:
                continue
            key = word.lower()
            if key in seen_words:
                continue
            seen_words.add(key)

            score = lesson.score or 0
            if lesson.is_completed and score >= 80:
                status = "mastered"
            elif lesson.is_completed and score < 60:
                status = "retry"
            else:
                status = "due_today"

            review_items.append(
                {
                    "word": word,
                    "translation": (vocab.get("translation") or "").strip(),
                    "example": (vocab.get("example") or "").strip(),
                    "status": status,
                    "due": "today",
                    "source": lesson.title,
                }
            )
    status_priority = {"retry": 0, "due_today": 1, "mastered": 2}
    review_items.sort(key=lambda item: status_priority[item["status"]])
    return review_items[:8]


@router.post("/lessons/generate", response_model=LessonOut)
def generate_lesson(
    payload: LessonGenerateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    pair = _get_owned_pair(db, payload.language_pair_id, current_user)
    course_level = pair.current_level
    curriculum = _curriculum_status(db, pair)
    next_unit = next((unit for unit in curriculum["units"] if unit["status"] == "available"), None)
    if not next_unit:
        raise HTTPException(status_code=409, detail="All 50 lessons are passed; take the final exam")
    unit_number = payload.unit_number or next_unit["unit_number"]
    if unit_number != next_unit["unit_number"]:
        raise HTTPException(status_code=409, detail="Pass the current lesson with at least 80% before unlocking another lesson")
    lesson_type = _unit_type(unit_number)
    if payload.lesson_type and payload.lesson_type != lesson_type:
        raise HTTPException(status_code=409, detail="Lesson type does not match this curriculum unit")

    existing = _course_lessons(db, pair, course_level).get(unit_number)
    if existing:
        if lesson_type == "speaking" and not _has_speaking_conversation(existing.content or {}):
            refreshed_content = gemini_service.generate_lesson(
                source_language=pair.source_language,
                target_language=pair.target_language,
                level=course_level,
                topic=existing.topic,
                lesson_type=lesson_type,
                unit_number=unit_number,
            )
            conversation = refreshed_content.get("conversation") if isinstance(refreshed_content, dict) else None
            if not _has_speaking_conversation({"conversation": conversation}):
                raise HTTPException(status_code=503, detail="speaking_conversation_unavailable")
            existing.content = {**(existing.content or {}), "conversation": conversation}
            db.commit()
            db.refresh(existing)
        return existing

    shared_content = None
    if not (payload.topic or "").strip():
        shared_content = (
            db.query(SharedCourseLessonContent)
            .filter(
                SharedCourseLessonContent.source_language == pair.source_language,
                SharedCourseLessonContent.target_language == pair.target_language,
                SharedCourseLessonContent.level == course_level,
                SharedCourseLessonContent.unit_number == unit_number,
            )
            .first()
        )

    if shared_content:
        content = dict(shared_content.content)
    else:
        content = gemini_service.generate_lesson(
            source_language=pair.source_language,
            target_language=pair.target_language,
            level=course_level,
            topic=payload.topic,
            lesson_type=lesson_type,
            unit_number=unit_number,
        )
        if not isinstance(content, dict) or _lesson_content_unavailable(content):
            raise HTTPException(status_code=503, detail="lesson_content_unavailable")
    if lesson_type == "speaking" and not _has_speaking_conversation(content):
        raise HTTPException(status_code=503, detail="speaking_conversation_unavailable")
    content.update({"course_unit": unit_number, "lesson_type": lesson_type})

    if shared_content is None and not (payload.topic or "").strip():
        shared_content = SharedCourseLessonContent(
            source_language=pair.source_language,
            target_language=pair.target_language,
            level=course_level,
            unit_number=unit_number,
            title=content.get("title", f"{course_level} lesson {unit_number}"),
            topic=content.get("topic"),
            content=content,
        )
        db.add(shared_content)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            shared_content = (
                db.query(SharedCourseLessonContent)
                .filter(
                    SharedCourseLessonContent.source_language == pair.source_language,
                    SharedCourseLessonContent.target_language == pair.target_language,
                    SharedCourseLessonContent.level == course_level,
                    SharedCourseLessonContent.unit_number == unit_number,
                )
                .first()
            )
            if shared_content is None:
                raise
            content = dict(shared_content.content)
            content.update({"course_unit": unit_number, "lesson_type": lesson_type})

    lesson = Lesson(
        language_pair_id=pair.id,
        title=content.get("title", f"{course_level} lesson {unit_number}"),
        level=course_level,
        topic=content.get("topic", payload.topic),
        content=content,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.post("/lessons/generate-custom", response_model=LessonOut)
def generate_custom_lesson(
    payload: CustomLessonGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, payload.language_pair_id, current_user)
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=422, detail="Topic must not be blank")

    course_level = pair.current_level
    topic_key = _normalize_custom_topic(topic)
    shared_content = _shared_custom_content(db, pair, course_level, topic_key)

    if shared_content:
        content = dict(shared_content.content)
    else:
        content = gemini_service.generate_lesson(
            source_language=pair.source_language,
            target_language=pair.target_language,
            level=course_level,
            topic=topic,
            lesson_type="grammar",
            unit_number=None,
        )
        if not isinstance(content, dict) or _lesson_content_unavailable(content):
            raise HTTPException(status_code=503, detail="lesson_content_unavailable")

    content.update({"custom_topic": True, "lesson_type": "custom"})

    if shared_content is None:
        shared_content = SharedCustomLessonContent(
            source_language=pair.source_language,
            target_language=pair.target_language,
            level=course_level,
            topic_key=topic_key,
            title=content.get("title", topic),
            topic=content.get("topic", topic),
            content=content,
        )
        db.add(shared_content)
        try:
            db.commit()
        except IntegrityError:
            # Another learner requested the same topic first and won the insert.
            db.rollback()
            winner = _shared_custom_content(db, pair, course_level, topic_key)
            if winner is None:
                raise
            content = dict(winner.content)
            content.update({"custom_topic": True, "lesson_type": "custom"})

    lesson = Lesson(
        language_pair_id=pair.id,
        title=content.get("title", topic),
        level=course_level,
        topic=content.get("topic", topic),
        content=content,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.post("/pairs/{pair_id}/exam", response_model=LessonOut)
def get_or_create_level_exam(
    pair_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, pair_id, current_user)
    course_level = pair.current_level
    curriculum = _curriculum_status(db, pair)
    if curriculum["completed_count"] != _UNITS_PER_LEVEL:
        raise HTTPException(status_code=409, detail="Pass all 50 lessons with at least 80% to unlock the final exam")

    existing = _course_lessons(db, pair, course_level).get(_UNITS_PER_LEVEL + 1)
    if existing:
        return existing

    content = gemini_service.generate_level_exam(pair.source_language, pair.target_language, course_level)
    exercises = content.get("exercises") or []
    if not exercises:
        raise HTTPException(status_code=503, detail="The final exam is temporarily unavailable")
    content.update({"course_unit": _UNITS_PER_LEVEL + 1, "lesson_type": "exam"})
    exam = Lesson(
        language_pair_id=pair.id,
        title=content.get("title", f"{course_level} final exam"),
        level=course_level,
        topic="Final exam",
        content=content,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


@router.get("/placement-test/{pair_id}")
def get_placement_test(
    pair_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, pair_id, current_user)
    test = gemini_service.generate_placement_test(pair.source_language, pair.target_language)
    if not test.get("items"):
        raise HTTPException(status_code=503, detail="Placement test is temporarily unavailable")
    return test


@router.post("/placement-test/{pair_id}")
def save_placement_result(
    pair_id: int,
    payload: PlacementResult,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pair = _get_owned_pair(db, pair_id, current_user)
    pair.current_level = payload.level
    db.commit()
    db.refresh(pair)
    return {"current_level": pair.current_level, "score": payload.score}


@router.get("/certificate/{pair_id}")
def get_course_certificate(
    pair_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    pair = _get_owned_pair(db, pair_id, current_user)
    passed_exams = (
        db.query(Lesson)
        .filter(
            Lesson.language_pair_id == pair.id,
            Lesson.is_completed.is_(True),
            Lesson.score >= _PASS_SCORE,
        )
        .order_by(Lesson.completed_at.desc(), Lesson.id.desc())
        .all()
    )
    exam = next(
        (lesson for lesson in passed_exams if (lesson.content or {}).get("lesson_type") == "exam"),
        None,
    )
    if not exam:
        raise HTTPException(status_code=409, detail="Pass all 50 lessons and the level exam with at least 80% to earn a certificate")

    level_units = _course_lessons(db, pair, exam.level)
    completed_units = [level_units.get(unit_number) for unit_number in range(1, _UNITS_PER_LEVEL + 1)]
    if not all(_is_passed(lesson) for lesson in completed_units):
        raise HTTPException(status_code=409, detail="All 50 lessons at this level must be passed before certification")
    average_score = round(sum(lesson.score for lesson in completed_units if lesson and lesson.score is not None) / _UNITS_PER_LEVEL)

    return {
        "learner_name": f"{current_user.first_name} {current_user.last_name}".strip(),
        "source_language": pair.source_language,
        "target_language": pair.target_language,
        "level": exam.level,
        "lessons_completed": _UNITS_PER_LEVEL,
        "average_score": average_score,
        "issued_on": (exam.completed_at or utcnow_naive()).date().isoformat(),
    }


@router.post("/lessons/complete", response_model=LessonOut)
def complete_lesson(
    payload: LessonCompleteRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).join(LanguagePair).filter(Lesson.id == payload.lesson_id).first()
    if not lesson or lesson.language_pair.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lesson not found")
    metadata = lesson.content or {}
    unit_number = metadata.get("course_unit")
    is_exam = metadata.get("lesson_type") == "exam" and unit_number == _UNITS_PER_LEVEL + 1
    if _is_passed(lesson):
        raise HTTPException(status_code=409, detail="This lesson has already been passed")
    if metadata.get("speaking_practice_track") == _SPEAKING_PRACTICE_TRACK:
        speaking_unit = metadata.get("speaking_practice_unit")
        if not isinstance(speaking_unit, int) or not 1 <= speaking_unit <= 50:
            raise HTTPException(status_code=409, detail="Invalid speaking practice lesson")
        speaking_units = _speaking_practice_lessons(db, lesson.language_pair.id)
        next_speaking_unit = next(
            (number for number in range(1, 51) if not _is_passed(speaking_units.get(number))),
            51,
        )
        if speaking_unit != next_speaking_unit:
            raise HTTPException(status_code=409, detail="Complete the previous speaking practice lesson first")
    if isinstance(unit_number, int) and 1 <= unit_number <= _UNITS_PER_LEVEL:
        curriculum = _curriculum_status(db, lesson.language_pair)
        next_unit = next(unit for unit in curriculum["units"] if unit["status"] == "available")
        if unit_number != next_unit["unit_number"]:
            raise HTTPException(status_code=409, detail="Complete the previous lesson first")
    if is_exam:
        level_units = _course_lessons(db, lesson.language_pair, lesson.level)
        if not all(_is_passed(level_units.get(number)) for number in range(1, _UNITS_PER_LEVEL + 1)):
            raise HTTPException(status_code=409, detail="Pass all 50 lessons before taking the final exam")

    lesson.is_completed = True
    lesson.score = payload.score
    lesson.completed_at = utcnow_naive()

    xp_gain = max(10, payload.score // 2)
    lesson.language_pair.xp += xp_gain
    current_user.xp += xp_gain
    current_user.coins += xp_gain // 2
    if is_exam and payload.score >= _PASS_SCORE:
        level_index = _CEFR_LEVELS.index(lesson.level) if lesson.level in _CEFR_LEVELS else 0
        if level_index < len(_CEFR_LEVELS) - 1:
            lesson.language_pair.current_level = _CEFR_LEVELS[level_index + 1]
    bump_streak(current_user)
    db.commit()

    advance_progress(db, current_user, "complete_lesson", 1)
    check_achievements(db, current_user)

    db.add(
        Notification(
            user_id=current_user.id,
            title="Lesson complete",
            message=f"You finished '{lesson.title}' and earned {xp_gain} XP.",
            kind="lesson",
        )
    )

    db.commit()
    db.refresh(lesson)
    return lesson
