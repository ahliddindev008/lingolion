from app.models import LanguagePair
from app.security import decode_access_token


def _onboard(client, headers, source, target):
    response = client.post(
        "/api/onboarding/complete",
        headers=headers,
        json={
            "first_name": "Pair",
            "last_name": "Learner",
            "age": 22,
            "region": "Dushanbe",
            "source_language": source,
            "target_language": target,
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "tj",
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def _set_pair_xp(db_session, pair_id, xp, streak_days=0):
    pair = db_session.query(LanguagePair).filter(LanguagePair.id == pair_id).first()
    assert pair is not None, f"pair {pair_id} not found"
    pair.xp = xp
    pair.streak_days = streak_days
    db_session.commit()


def _user_id(tokens):
    return int(decode_access_token(tokens["access_token"])["sub"])


def test_rating_can_be_scoped_to_a_language_pair(client, registered_user, create_user, db_session):
    my_pair = registered_user["pair"]

    second = create_user("pairmate@example.com", "pairmate-device-01")
    second_headers = {
        "Authorization": f"Bearer {second.json()['access_token']}",
        "X-Device-Id": "pairmate-device-01",
    }
    second_pair = _onboard(client, second_headers, "Tajik", "English")

    third = create_user("otherpair@example.com", "otherpair-device-01")
    third_headers = {
        "Authorization": f"Bearer {third.json()['access_token']}",
        "X-Device-Id": "otherpair-device-01",
    }
    third_pair = _onboard(client, third_headers, "English", "Tajik")

    _set_pair_xp(db_session, my_pair["id"], 10)
    _set_pair_xp(db_session, second_pair["id"], 90, streak_days=3)
    _set_pair_xp(db_session, third_pair["id"], 500)

    scoped = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}",
        headers=registered_user["headers"],
    )
    assert scoped.status_code == 200
    rows = scoped.json()

    my_id = _user_id(registered_user["tokens"])
    second_id = _user_id(second.json())
    third_id = _user_id(third.json())
    user_ids = [row["user_id"] for row in rows]

    # Only learners of the same language combination are ranked...
    assert third_id not in user_ids
    assert set(user_ids) == {my_id, second_id}
    # ...ordered by that pair's XP rather than the global score.
    assert user_ids[0] == second_id
    assert rows[0]["xp"] == 90
    assert rows[0]["streak_days"] == 3

    me = client.get(
        f"/api/rating/me?pair_id={my_pair['id']}",
        headers=registered_user["headers"],
    )
    assert me.status_code == 200
    assert me.json()["xp"] == 10


def test_rating_without_pair_id_stays_global(client, registered_user, create_user):
    third = create_user("globalmate@example.com", "globalmate-device-01")
    third_headers = {
        "Authorization": f"Bearer {third.json()['access_token']}",
        "X-Device-Id": "globalmate-device-01",
    }
    _onboard(client, third_headers, "Tajik", "English")
    third_id = _user_id(third.json())

    global_rows = client.get(
        "/api/rating/leaderboard", headers=registered_user["headers"]
    )
    assert global_rows.status_code == 200
    assert third_id in [row["user_id"] for row in global_rows.json()]

    # A pair_id owned by someone else falls back to the global score.
    third_pair = client.get("/api/rating/me", headers=third_headers).json()
    foreign = client.get(
        f"/api/rating/me?pair_id=999999", headers=registered_user["headers"]
    ).json()
    plain = client.get("/api/rating/me", headers=registered_user["headers"]).json()
    assert foreign == plain
    assert third_pair["user_id"] == third_id
