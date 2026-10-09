def test_generate_and_complete_lesson_awards_xp_and_achievement(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]

    gen_resp = client.post(
        "/api/course/lessons/generate", headers=headers, json={"language_pair_id": pair_id, "topic": "greetings"}
    )
    assert gen_resp.status_code == 200
    lesson = gen_resp.json()
    assert lesson["content"]["vocabulary"]

    complete_resp = client.post(
        "/api/course/lessons/complete", headers=headers, json={"lesson_id": lesson["id"], "score": 100}
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["is_completed"] is True

    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.json()["xp"] > 0

    achievements_resp = client.get("/api/profile/achievements", headers=headers)
    codes = [a["code"] for a in achievements_resp.json()]
    assert "first_lesson" in codes
    assert "perfect_score" in codes


def test_shared_course_content_is_reused_between_learners(
    client, registered_user, create_user, monkeypatch, db_session
):
    from app import gemini_service
    from app.models import SharedCourseLessonContent

    generated = []
    original_generate = gemini_service.generate_lesson

    def count_generation(**kwargs):
        generated.append(kwargs)
        return original_generate(**kwargs)

    monkeypatch.setattr(gemini_service, "generate_lesson", count_generation)
    first_response = client.post(
        "/api/course/lessons/generate",
        headers=registered_user["headers"],
        json={"language_pair_id": registered_user["pair"]["id"], "unit_number": 1},
    )
    assert first_response.status_code == 200

    device_id = "shared-course-device-0001"
    registration = create_user("shared-course@example.com", device_id)
    tokens = registration.json()
    headers = {
        "Authorization": f"Bearer {tokens['access_token']}",
        "X-Device-Id": device_id,
    }
    onboarding_response = client.post(
        "/api/onboarding/complete",
        headers=headers,
        json={
            "first_name": "Shared",
            "last_name": "Learner",
            "age": 23,
            "region": "Dushanbe",
            "source_language": "Tajik",
            "target_language": "English",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "tj",
        },
    )
    assert onboarding_response.status_code == 200

    second_response = client.post(
        "/api/course/lessons/generate",
        headers=headers,
        json={"language_pair_id": onboarding_response.json()["id"], "unit_number": 1},
    )

    assert second_response.status_code == 200
    assert first_response.json()["id"] != second_response.json()["id"]
    assert first_response.json()["content"]["vocabulary"] == second_response.json()["content"]["vocabulary"]
    assert len(generated) == 1
    assert db_session.query(SharedCourseLessonContent).count() == 1


def test_pre_generator_saves_lesson_and_resumes_without_regenerating(db_session, monkeypatch):
    from app import gemini_service
    from app.pre_generate_course import pre_generate_course_catalog

    generated = []

    def generate(**kwargs):
        generated.append(kwargs)
        return {
            "title": "Shared lesson",
            "topic": "Greetings",
            "grammar_explanation": "A simple greeting.",
            "vocabulary": [],
            "examples": [],
            "exercises": [],
        }

    monkeypatch.setattr(gemini_service, "generate_lesson", generate)

    first_run = pre_generate_course_catalog(db_session, max_new_lessons=1)
    second_run = pre_generate_course_catalog(db_session, max_new_lessons=1)

    assert first_run == (1, 0)
    assert second_run == (1, 1)
    assert generated == [
        {
            "source_language": "Тоҷикӣ",
            "target_language": "Русский",
            "level": "A1",
            "lesson_type": "grammar",
            "unit_number": 1,
        },
        {
            "source_language": "Тоҷикӣ",
            "target_language": "Русский",
            "level": "A1",
            "lesson_type": "practice",
            "unit_number": 2,
        },
    ]


def test_failed_lesson_generation_is_not_saved_as_a_course_unit(client, registered_user, monkeypatch):
    monkeypatch.setattr(
        "app.routers.course.gemini_service.generate_lesson",
        lambda **_: {"grammar_explanation": "Lesson content is temporarily unavailable. Please try again shortly."},
    )

    response = client.post(
        "/api/course/lessons/generate",
        headers=registered_user["headers"],
        json={"language_pair_id": registered_user["pair"]["id"]},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "lesson_content_unavailable"
    curriculum = client.get(
        f"/api/course/pairs/{registered_user['pair']['id']}/curriculum",
        headers=registered_user["headers"],
    ).json()
    assert curriculum["units"][0]["lesson_id"] is None


def test_custom_lessons_use_each_submitted_topic_without_advancing_course(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]

    first = client.post(
        "/api/course/lessons/generate-custom",
        headers=headers,
        json={"language_pair_id": pair_id, "topic": "  ordering food  "},
    )
    second = client.post(
        "/api/course/lessons/generate-custom",
        headers=headers,
        json={"language_pair_id": pair_id, "topic": "asking for directions"},
    )

    assert first.status_code == second.status_code == 200
    first_lesson = first.json()
    second_lesson = second.json()
    assert first_lesson["topic"] == "ordering food"
    assert second_lesson["topic"] == "asking for directions"
    assert first_lesson["id"] != second_lesson["id"]
    assert first_lesson["content"]["custom_topic"] is True

    curriculum = client.get(f"/api/course/pairs/{pair_id}/curriculum", headers=headers).json()
    assert curriculum["units"][0]["lesson_id"] is None


def test_custom_lesson_rejects_blank_topic(client, registered_user):
    response = client.post(
        "/api/course/lessons/generate-custom",
        headers=registered_user["headers"],
        json={"language_pair_id": registered_user["pair"]["id"], "topic": "   "},
    )

    assert response.status_code == 422


def test_same_language_pair_is_rejected(client, registered_user):
    headers = registered_user["headers"]

    response = client.post(
        "/api/course/pairs",
        headers=headers,
        json={
            "source_language": "English",
            "target_language": "english",
            "current_level": "A1",
            "learning_goal": "practice",
            "daily_time_minutes": 15,
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Source and target languages must differ"

    onboarding_resp = client.post(
        "/api/onboarding/complete",
        headers=headers,
        json={
            "first_name": "Test",
            "last_name": "Learner",
            "age": 20,
            "region": "Dushanbe",
            "source_language": "Tajik",
            "target_language": "Tajik",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "tj",
        },
    )
    assert onboarding_resp.status_code == 400
    assert onboarding_resp.json()["detail"] == "Source and target languages must differ"


def test_curriculum_unlocks_next_lesson_only_after_80_percent(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    curriculum = client.get(f"/api/course/pairs/{pair_id}/curriculum", headers=headers).json()
    assert len(curriculum["units"]) == 50
    assert curriculum["units"][0]["status"] == "available"
    assert [unit["lesson_type"] for unit in curriculum["units"][:5]] == [
        "grammar", "practice", "speaking", "writing", "listening"
    ]
    assert curriculum["units"][1]["status"] == "locked"

    locked_response = client.post(
        "/api/course/lessons/generate",
        headers=headers,
        json={"language_pair_id": pair_id, "unit_number": 2, "lesson_type": "practice"},
    )
    assert locked_response.status_code == 409

    lesson = client.post(
        "/api/course/lessons/generate", headers=headers, json={"language_pair_id": pair_id, "unit_number": 1}
    ).json()
    first_score = client.post(
        "/api/course/lessons/complete", headers=headers, json={"lesson_id": lesson["id"], "score": 79}
    )
    assert first_score.status_code == 200
    curriculum = client.get(f"/api/course/pairs/{pair_id}/curriculum", headers=headers).json()
    assert curriculum["units"][0]["status"] == "available"
    assert curriculum["units"][1]["status"] == "locked"

    passed = client.post(
        "/api/course/lessons/complete", headers=headers, json={"lesson_id": lesson["id"], "score": 80}
    )
    assert passed.status_code == 200
    curriculum = client.get(f"/api/course/pairs/{pair_id}/curriculum", headers=headers).json()
    assert curriculum["units"][0]["status"] == "completed"
    assert curriculum["units"][1]["status"] == "available"
    next_lesson = client.post(
        "/api/course/lessons/generate", headers=headers, json={"language_pair_id": pair_id, "unit_number": 2}
    )
    assert next_lesson.status_code == 200
    assert next_lesson.json()["content"]["lesson_type"] == "practice"


def test_speaking_lesson_includes_four_turn_conversation(client, registered_user, monkeypatch):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    for unit_number, lesson_type in ((1, "grammar"), (2, "practice")):
        lesson = client.post(
            "/api/course/lessons/generate",
            headers=headers,
            json={"language_pair_id": pair_id, "unit_number": unit_number, "lesson_type": lesson_type},
        ).json()
        response = client.post(
            "/api/course/lessons/complete",
            headers=headers,
            json={"lesson_id": lesson["id"], "score": 100},
        )
        assert response.status_code == 200

    from app.routers import course as course_router

    generate_lesson = course_router.gemini_service.generate_lesson

    def generate_speaking_lesson(**kwargs):
        content = generate_lesson(**kwargs)
        if kwargs["lesson_type"] == "speaking":
            content["conversation"] = [
                {"partner_line": f"Partner line {turn}", "prompt": f"Reply {turn}", "model_answer": f"Answer {turn}", "keywords": [f"word{turn}"]}
                for turn in range(1, 5)
            ]
        return content

    monkeypatch.setattr(course_router.gemini_service, "generate_lesson", generate_speaking_lesson)
    response = client.post(
        "/api/course/lessons/generate",
        headers=headers,
        json={"language_pair_id": pair_id, "unit_number": 3, "lesson_type": "speaking"},
    )

    assert response.status_code == 200
    assert len(response.json()["content"]["conversation"]) == 4


def test_standalone_speaking_practice_has_independent_50_lesson_progression(
    client, registered_user, monkeypatch
):
    from app.routers import course as course_router

    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    generate_lesson = course_router.gemini_service.generate_lesson
    generated_units = []

    def generate_speaking_lesson(**kwargs):
        generated_units.append(kwargs)
        content = generate_lesson(**kwargs)
        content["conversation"] = [
            {
                "partner_line": f"Partner line {turn}",
                "prompt": f"Respond to turn {turn}",
                "model_answer": f"Answer with keyword{turn}",
                "keywords": [f"keyword{turn}"],
            }
            for turn in range(1, 5)
        ]
        return content

    monkeypatch.setattr(course_router.gemini_service, "generate_lesson", generate_speaking_lesson)
    initial_curriculum = client.get(f"/api/course/pairs/{pair_id}/curriculum", headers=headers).json()
    initial_progress = client.get(
        f"/api/course/pairs/{pair_id}/speaking-practice",
        headers=headers,
    )

    assert initial_progress.status_code == 200
    assert initial_progress.json()["unit_count"] == 50
    assert initial_progress.json()["units"][0]["status"] == "available"
    assert initial_progress.json()["units"][1]["status"] == "locked"
    assert initial_progress.json()["units"][10]["level"] == "A2"

    locked = client.post(
        "/api/course/speaking-practice/generate",
        headers=headers,
        json={"language_pair_id": pair_id, "unit_number": 2},
    )
    assert locked.status_code == 409

    lesson_response = client.post(
        "/api/course/speaking-practice/generate",
        headers=headers,
        json={"language_pair_id": pair_id, "unit_number": 1},
    )
    assert lesson_response.status_code == 200
    lesson = lesson_response.json()
    assert lesson["content"]["speaking_practice_track"] == "conversation-v1"
    assert lesson["content"]["speaking_practice_unit"] == 1
    assert "course_unit" not in lesson["content"]
    assert generated_units[0]["unit_number"] is None
    assert generated_units[0]["level"] == "A1"

    failed_pass = client.post(
        "/api/course/lessons/complete",
        headers=headers,
        json={"lesson_id": lesson["id"], "score": 79},
    )
    assert failed_pass.status_code == 200
    still_locked = client.get(
        f"/api/course/pairs/{pair_id}/speaking-practice",
        headers=headers,
    ).json()
    assert still_locked["units"][0]["status"] == "available"
    assert still_locked["units"][1]["status"] == "locked"

    passed = client.post(
        "/api/course/lessons/complete",
        headers=headers,
        json={"lesson_id": lesson["id"], "score": 80},
    )
    assert passed.status_code == 200
    unlocked = client.get(
        f"/api/course/pairs/{pair_id}/speaking-practice",
        headers=headers,
    ).json()
    final_curriculum = client.get(f"/api/course/pairs/{pair_id}/curriculum", headers=headers).json()

    assert unlocked["completed_count"] == 1
    assert unlocked["units"][0]["status"] == "completed"
    assert unlocked["units"][1]["status"] == "available"
    assert final_curriculum["units"] == initial_curriculum["units"]


def test_speaking_practice_content_is_shared_but_progress_is_per_learner(
    client, registered_user, create_user, monkeypatch, db_session
):
    from app import gemini_service
    from app.models import SharedSpeakingPracticeContent

    generated = []
    generate_lesson = gemini_service.generate_lesson

    def count_generation(**kwargs):
        generated.append(kwargs)
        content = generate_lesson(**kwargs)
        content["conversation"] = [
            {
                "partner_line": f"Partner line {turn}",
                "prompt": f"Respond to turn {turn}",
                "model_answer": f"Answer with keyword{turn}",
                "keywords": [f"keyword{turn}"],
            }
            for turn in range(1, 5)
        ]
        return content

    monkeypatch.setattr(gemini_service, "generate_lesson", count_generation)
    first_response = client.post(
        "/api/course/speaking-practice/generate",
        headers=registered_user["headers"],
        json={"language_pair_id": registered_user["pair"]["id"], "unit_number": 1},
    )
    assert first_response.status_code == 200

    device_id = "shared-speaking-device-0001"
    registration = create_user("shared-speaking@example.com", device_id)
    headers = {
        "Authorization": f"Bearer {registration.json()['access_token']}",
        "X-Device-Id": device_id,
    }
    onboarding_response = client.post(
        "/api/onboarding/complete",
        headers=headers,
        json={
            "first_name": "Speaking",
            "last_name": "Learner",
            "age": 23,
            "region": "Dushanbe",
            "source_language": "Tajik",
            "target_language": "English",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "tj",
        },
    )
    assert onboarding_response.status_code == 200
    second_response = client.post(
        "/api/course/speaking-practice/generate",
        headers=headers,
        json={"language_pair_id": onboarding_response.json()["id"], "unit_number": 1},
    )

    assert second_response.status_code == 200
    first_lesson = first_response.json()
    second_lesson = second_response.json()
    assert first_lesson["id"] != second_lesson["id"]
    assert first_lesson["content"] == second_lesson["content"]
    assert first_lesson["is_completed"] is False
    assert second_lesson["is_completed"] is False
    assert len(generated) == 1
    assert db_session.query(SharedSpeakingPracticeContent).count() == 1

    passed = client.post(
        "/api/course/lessons/complete",
        headers=registered_user["headers"],
        json={"lesson_id": first_lesson["id"], "score": 80},
    )
    assert passed.status_code == 200
    second_progress = client.get(
        f"/api/course/pairs/{onboarding_response.json()['id']}/speaking-practice",
        headers=headers,
    ).json()
    assert second_progress["completed_count"] == 0
    assert second_progress["units"][0]["status"] == "available"


def test_placement_test_updates_owned_pair_level(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    test_response = client.get(f"/api/course/placement-test/{pair_id}", headers=headers)
    assert test_response.status_code == 200
    assert len(test_response.json()["items"]) == 12

    result_response = client.post(
        f"/api/course/placement-test/{pair_id}", headers=headers, json={"level": "B1", "score": 75}
    )
    assert result_response.status_code == 200
    assert result_response.json()["current_level"] == "B1"
    assert client.get("/api/course/pairs", headers=headers).json()[0]["current_level"] == "B1"


def test_settings_can_update_language_pair_level(client, registered_user):
    pair_id = registered_user["pair"]["id"]
    response = client.patch(
        f"/api/course/pairs/{pair_id}",
        headers=registered_user["headers"],
        json={"current_level": "B2"},
    )
    assert response.status_code == 200
    assert response.json()["current_level"] == "B2"


def test_dashboard_and_review_queue_are_exposed(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]

    lesson_resp = client.post(
        "/api/course/lessons/generate",
        headers=headers,
        json={"language_pair_id": pair_id, "topic": "travel"},
    )
    assert lesson_resp.status_code == 200
    lesson_id = lesson_resp.json()["id"]

    client.post(
        "/api/course/lessons/complete",
        headers=headers,
        json={"lesson_id": lesson_id, "score": 85},
    )

    dashboard_resp = client.get("/api/profile/dashboard", headers=headers)
    assert dashboard_resp.status_code == 200
    data = dashboard_resp.json()
    assert data["xp"] >= 0
    assert data["lessons_completed"] >= 1
    assert data["streak_days"] >= 1
    assert data["weekly_summary"]["lessons_completed"] == 1
    assert data["weekly_summary"]["active_days"] >= 1
    assert data["skill_progress"]["lessons"] == 85

    review_resp = client.get("/api/course/review", headers=headers)
    assert review_resp.status_code == 200
    items = review_resp.json()
    assert isinstance(items, list)
    assert items[0]["word"]
    assert items[0]["status"] in {"due_today", "retry", "mastered"}

    pronunciation_resp = client.get("/api/profile/pronunciation", headers=headers)
    assert pronunciation_resp.status_code == 200
    payload = pronunciation_resp.json()
    assert "tip" in payload
    assert "word" in payload


def test_certificate_requires_all_lessons_and_level_exam(client, registered_user, seed_course_units):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]

    unavailable = client.get(f"/api/course/certificate/{pair_id}", headers=headers)
    assert unavailable.status_code == 409
    locked_exam = client.post(f"/api/course/pairs/{pair_id}/exam", headers=headers)
    assert locked_exam.status_code == 409

    seed_course_units(pair_id, "A1", score=90)
    no_extra_lesson = client.post(
        "/api/course/lessons/generate", headers=headers, json={"language_pair_id": pair_id}
    )
    assert no_extra_lesson.status_code == 409
    exam_response = client.post(f"/api/course/pairs/{pair_id}/exam", headers=headers)
    assert exam_response.status_code == 200
    exam = exam_response.json()
    assert len(exam["content"]["exercises"]) == 20

    completed_exam = client.post(
        "/api/course/lessons/complete", headers=headers, json={"lesson_id": exam["id"], "score": 80}
    )
    assert completed_exam.status_code == 200
    assert client.get("/api/course/pairs", headers=headers).json()[0]["current_level"] == "A2"

    certificate = client.get(f"/api/course/certificate/{pair_id}", headers=headers)
    assert certificate.status_code == 200
    assert certificate.json()["lessons_completed"] == 50
    assert certificate.json()["average_score"] == 90
    assert certificate.json()["level"] == "A1"


def test_notifications_are_listed_and_marked_read(client, registered_user):
    headers = registered_user["headers"]

    list_resp = client.get("/api/profile/notifications", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert items
    assert items[0]["title"]

    notification_id = items[0]["id"]
    mark_resp = client.post(f"/api/profile/notifications/{notification_id}/read", headers=headers)
    assert mark_resp.status_code == 200
    assert mark_resp.json()["is_read"] is True


def test_cannot_access_other_users_language_pair(client, registered_user):
    headers = registered_user["headers"]
    bad_resp = client.get("/api/course/pairs/999999/lessons", headers=headers)
    assert bad_resp.status_code == 404
