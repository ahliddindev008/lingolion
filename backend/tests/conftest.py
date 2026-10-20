import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.rate_limit import limiter

# Real settings (Neon Postgres) load normally from backend/.env вЂ” app.main's
# create_all() against it on import is a harmless no-op (tables already exist).
# All actual test queries are redirected to an isolated in-memory SQLite DB below,
# so tests never read or write real data.
test_engine = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
Base.metadata.create_all(bind=test_engine)

limiter.enabled = False  # avoid cross-test rate-limit bleed


def _override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def _clean_db(monkeypatch):
    from app.routers import communication

    monkeypatch.setattr(communication, "SessionLocal", TestSessionLocal)
    yield
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)


@pytest.fixture(autouse=True)
def _mock_gemini(monkeypatch):
    """Tests must never depend on network access or Gemini quota."""
    from app import gemini_service

    def fake_generate_lesson(source_language, target_language, level, topic=None, lesson_type="grammar", unit_number=1):
        return {
            "title": f"{target_language} {lesson_type} unit {unit_number}",
            "topic": topic or "test",
            "grammar_explanation": "Test grammar explanation.",
            "vocabulary": [{"word": "hello", "translation": "salom", "example": "Hello!"}],
            "examples": ["Hello there."],
            "exercises": [
                {
                    "question": "What does 'hello' mean?",
                    "options": ["salom", "not", "kitob", "khona"],
                    "correct_answer": "salom",
                    "explanation": "It's a greeting.",
                }
            ],
            "activity_prompt": "Say or write a greeting.",
            "model_answer": "Hello there.",
            "keywords": ["hello", "there"],
            "listening_exercises": [
                {
                    "text": "Hello there.",
                    "question": "What is the greeting?",
                    "options": ["Salom", "Goodbye"],
                    "correct_answer": "Salom",
                }
            ],
        }

    def fake_analyze_message(source_language, target_language, level, user_message, **kwargs):
        return {"reply": "Good job!", "has_errors": False, "corrected_text": "", "correction_notes": ""}

    def fake_generate_placement_test(source_language, target_language):
        return {
            "items": [
                {
                    "question": f"Question {level}",
                    "options": ["a", "b", "c", "d"],
                    "correct_answer": "a",
                    "level": level,
                }
                for level in ("A1", "A1", "A2", "A2", "B1", "B1", "B2", "B2", "C1", "C1", "C2", "C2")
            ]
        }

    def fake_generate_level_exam(source_language, target_language, level):
        return {
            "title": f"{level} final exam",
            "exercises": [
                {
                    "question": "Choose the correct answer.",
                    "options": ["a", "b", "c", "d"],
                    "correct_answer": "a",
                    "explanation": "Test explanation.",
                }
                for _ in range(20)
            ],
        }

    monkeypatch.setattr(gemini_service, "generate_lesson", fake_generate_lesson)
    monkeypatch.setattr(gemini_service, "analyze_message", fake_analyze_message)
    monkeypatch.setattr(gemini_service, "generate_placement_test", fake_generate_placement_test)
    monkeypatch.setattr(gemini_service, "generate_level_exam", fake_generate_level_exam)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def create_user(client):
    """Creates a password account, optionally bound to a device."""
    def create(email, device_id=None):
        headers = {"X-Device-Id": device_id} if device_id else {}
        response = client.post(
            "/api/auth/register",
            json={"email": email, "password": "StrongPass123"},
            headers=headers,
        )
        assert response.status_code == 200, response.text
        return response

    return create


@pytest.fixture
def registered_user(client, create_user):
    """Creates a device-bound account and completes onboarding."""
    device_id = "registered-device-0001"
    tokens = create_user("learner@example.com", device_id).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    headers["X-Device-Id"] = device_id
    onboarding_resp = client.post(
        "/api/onboarding/complete",
        headers=headers,
        json={
            "first_name": "Test",
            "last_name": "Learner",
            "age": 20,
            "region": "Dushanbe",
            "source_language": "Tajik",
            "target_language": "English",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "tj",
        },
    )
    assert onboarding_resp.status_code == 200, onboarding_resp.text
    pair = onboarding_resp.json()

    return {"headers": headers, "tokens": tokens, "pair": pair}


@pytest.fixture
def seed_course_units():
    from datetime import datetime

    from app.models import Lesson

    def seed(pair_id, level, score=90):
        db = TestSessionLocal()
        lesson_types = ("grammar", "practice", "speaking", "writing", "listening")
        try:
            db.add_all(
                Lesson(
                    language_pair_id=pair_id,
                    title=f"{level} unit {unit_number}",
                    level=level,
                    topic="curriculum",
                    content={"course_unit": unit_number, "lesson_type": lesson_types[(unit_number - 1) % 5]},
                    is_completed=True,
                    score=score,
                    completed_at=datetime.now(),
                )
                for unit_number in range(1, 51)
            )
            db.commit()
        finally:
            db.close()

    return seed
