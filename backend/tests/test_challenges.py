def test_today_challenges_are_created_with_zero_progress(client, registered_user):
    headers = registered_user["headers"]
    resp = client.get("/api/challenges/today", headers=headers)
    assert resp.status_code == 200
    challenges = resp.json()
    assert len(challenges) == 3
    assert {c["code"] for c in challenges} == {"complete_lesson", "score_game", "send_messages"}
    assert all(c["progress"] == 0 and not c["completed"] for c in challenges)


def test_challenges_are_stable_across_calls(client, registered_user):
    headers = registered_user["headers"]
    first = client.get("/api/challenges/today", headers=headers).json()
    second = client.get("/api/challenges/today", headers=headers).json()
    assert {c["code"] for c in first} == {c["code"] for c in second}
