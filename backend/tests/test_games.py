import pytest


def test_submit_game_score_awards_xp_and_advances_daily_challenge(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]

    submit_resp = client.post(
        "/api/games/submit",
        headers=headers,
        json={"game_type": "vocab_match", "score": 90, "language_pair_id": pair_id},
    )
    assert submit_resp.status_code == 200
    body = submit_resp.json()
    assert body["xp_earned"] > 0
    assert body["total_xp"] >= body["xp_earned"]

    challenges_resp = client.get("/api/challenges/today", headers=headers)
    assert challenges_resp.status_code == 200
    score_game_challenge = next(c for c in challenges_resp.json() if c["code"] == "score_game")
    assert score_game_challenge["completed"] is True


def test_game_topics_unlock_sequentially_after_eighty_percent(client, registered_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    progress_url = f"/api/games/progress?game_type=vocab_match&language_pair_id={pair_id}"

    progress = client.get(progress_url, headers=headers)
    assert progress.status_code == 200
    assert progress.json()["unlocked_topics"] == ["greetings"]
    assert progress.json()["unlock_score"] == 80

    locked_attempt = client.post(
        "/api/games/submit",
        headers=headers,
        json={
            "game_type": "vocab_match",
            "score": 100,
            "language_pair_id": pair_id,
            "topic_id": "cafe",
        },
    )
    assert locked_attempt.status_code == 409

    low_score = client.post(
        "/api/games/submit",
        headers=headers,
        json={
            "game_type": "vocab_match",
            "score": 79,
            "language_pair_id": pair_id,
            "topic_id": "greetings",
        },
    )
    assert low_score.status_code == 200
    assert low_score.json()["topic_unlocked"] is False
    assert client.get(progress_url, headers=headers).json()["unlocked_topics"] == ["greetings"]

    passing_score = client.post(
        "/api/games/submit",
        headers=headers,
        json={
            "game_type": "vocab_match",
            "score": 80,
            "language_pair_id": pair_id,
            "topic_id": "greetings",
        },
    )
    assert passing_score.status_code == 200
    assert passing_score.json()["topic_unlocked"] is True
    assert client.get(progress_url, headers=headers).json()["unlocked_topics"] == ["greetings", "cafe"]

    cafe_score = client.post(
        "/api/games/submit",
        headers=headers,
        json={
            "game_type": "vocab_match",
            "score": 80,
            "language_pair_id": pair_id,
            "topic_id": "cafe",
        },
    )
    assert cafe_score.status_code == 200
    assert cafe_score.json()["topic_unlocked"] is True
    assert client.get(progress_url, headers=headers).json()["unlocked_topics"] == [
        "greetings",
        "cafe",
        "travel",
    ]

    another_game_progress = client.get(
        f"/api/games/progress?game_type=translation&language_pair_id={pair_id}",
        headers=headers,
    )
    assert another_game_progress.status_code == 200
    assert another_game_progress.json()["unlocked_topics"] == ["greetings"]


def test_game_topic_progress_is_limited_to_percent_scores_and_owned_pairs(client, registered_user):
    pair_id = registered_user["pair"]["id"]
    headers = registered_user["headers"]
    too_high = client.post(
        "/api/games/submit",
        headers=headers,
        json={
            "game_type": "vocab_match",
            "score": 101,
            "language_pair_id": pair_id,
            "topic_id": "greetings",
        },
    )
    assert too_high.status_code == 422

    missing_pair = client.post(
        "/api/games/submit",
        headers=headers,
        json={"game_type": "vocab_match", "score": 80, "topic_id": "greetings"},
    )
    assert missing_pair.status_code == 422

    unknown_pair = client.get(
        "/api/games/progress?game_type=vocab_match&language_pair_id=999999",
        headers=headers,
    )
    assert unknown_pair.status_code == 404


@pytest.mark.parametrize(
    "game_type",
    ["vocabulary_learning", "vocab_match", "translation", "speed_challenge", "multiple_choice", "word_scramble", "listening", "speaking", "writing", "reading"],
)
def test_game_score_types_award_xp(client, registered_user, game_type):
    response = client.post(
        "/api/games/submit",
        headers=registered_user["headers"],
        json={"game_type": game_type, "score": 80, "language_pair_id": registered_user["pair"]["id"]},
    )

    assert response.status_code == 200
    assert response.json()["xp_earned"] > 0


def test_generated_game_content_route_is_removed(client, registered_user):
    response = client.post(
        "/api/games/content",
        headers=registered_user["headers"],
        json={"language_pair_id": registered_user["pair"]["id"], "game_type": "vocab_match"},
    )

    assert response.status_code == 404
