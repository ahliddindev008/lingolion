"""Resumable pre-generation of shared courses for every supported language pair."""
import argparse
import time

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import gemini_service
from app.course_catalog import CEFR_LEVELS, COURSE_UNITS_PER_LEVEL, course_lesson_type
from app.database import SessionLocal
from app.language_catalog import SUPPORTED_LEARNING_LANGUAGES
from app.models import SharedCourseLessonContent


def pre_generate_course_catalog(
    db: Session,
    max_new_lessons: int | None = None,
    delay_seconds: float = 0,
) -> tuple[int, int]:
    generated = 0
    existing = 0
    for source_language in SUPPORTED_LEARNING_LANGUAGES:
        for target_language in SUPPORTED_LEARNING_LANGUAGES:
            if source_language == target_language:
                continue
            for level in CEFR_LEVELS:
                cached_units = {
                    unit_number
                    for (unit_number,) in (
                        db.query(SharedCourseLessonContent.unit_number)
                        .filter(
                            SharedCourseLessonContent.source_language == source_language,
                            SharedCourseLessonContent.target_language == target_language,
                            SharedCourseLessonContent.level == level,
                        )
                        .all()
                    )
                }
                for unit_number in range(1, COURSE_UNITS_PER_LEVEL + 1):
                    if unit_number in cached_units:
                        existing += 1
                        continue

                    lesson_type = course_lesson_type(unit_number)
                    content = gemini_service.generate_lesson(
                        source_language=source_language,
                        target_language=target_language,
                        level=level,
                        lesson_type=lesson_type,
                        unit_number=unit_number,
                    )
                    if (
                        not isinstance(content, dict)
                        or content.get("grammar_explanation")
                        == "Lesson content is temporarily unavailable. Please try again shortly."
                    ):
                        raise RuntimeError(
                            f"Content generation failed for {source_language} -> "
                            f"{target_language}, {level}, unit {unit_number}"
                        )
                    if lesson_type == "speaking" and (
                        not isinstance(content.get("conversation"), list)
                        or len(content["conversation"]) != 4
                    ):
                        raise RuntimeError(
                            f"Speaking content is incomplete for {source_language} -> "
                            f"{target_language}, {level}, unit {unit_number}"
                        )

                    content.update({"course_unit": unit_number, "lesson_type": lesson_type})
                    db.add(SharedCourseLessonContent(
                        source_language=source_language,
                        target_language=target_language,
                        level=level,
                        unit_number=unit_number,
                        title=content.get("title", f"{level} lesson {unit_number}"),
                        topic=content.get("topic"),
                        content=content,
                    ))
                    try:
                        db.commit()
                    except IntegrityError:
                        db.rollback()
                        winner = (
                            db.query(SharedCourseLessonContent)
                            .filter(
                                SharedCourseLessonContent.source_language == source_language,
                                SharedCourseLessonContent.target_language == target_language,
                                SharedCourseLessonContent.level == level,
                                SharedCourseLessonContent.unit_number == unit_number,
                            )
                            .first()
                        )
                        if winner is None:
                            raise
                        existing += 1
                        cached_units.add(unit_number)
                        continue

                    generated += 1
                    cached_units.add(unit_number)
                    if generated % 25 == 0:
                        print(f"Created {generated} shared lessons; {existing} already existed.")
                    if delay_seconds:
                        time.sleep(delay_seconds)
                    if max_new_lessons is not None and generated >= max_new_lessons:
                        return generated, existing
    return generated, existing


def main() -> None:
    parser = argparse.ArgumentParser(description="Pre-generate and cache shared course lessons.")
    parser.add_argument("--max-new-lessons", type=int, help="Stop after creating this many lessons.")
    parser.add_argument(
        "--delay-seconds",
        type=float,
        default=1,
        help="Pause between successful API calls to reduce provider load (default: 1).",
    )
    args = parser.parse_args()
    if args.max_new_lessons is not None and args.max_new_lessons < 1:
        parser.error("--max-new-lessons must be at least 1")
    if args.delay_seconds < 0:
        parser.error("--delay-seconds cannot be negative")

    db = SessionLocal()
    try:
        generated, existing = pre_generate_course_catalog(
            db,
            max_new_lessons=args.max_new_lessons,
            delay_seconds=args.delay_seconds,
        )
        print(f"Finished: created {generated} lessons; {existing} lessons were already cached.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
