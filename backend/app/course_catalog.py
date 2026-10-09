CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
LESSON_TYPES = ("grammar", "practice", "speaking", "writing", "listening")
COURSE_UNITS_PER_LEVEL = 50


def course_lesson_type(unit_number: int) -> str:
    return LESSON_TYPES[(unit_number - 1) % len(LESSON_TYPES)]
