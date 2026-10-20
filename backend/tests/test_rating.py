from datetime import datetime, timedelta

from app.models import GameScore, LanguagePair, User
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
    # Leaderboard rows expose each learner's email for in-app search.
    assert rows[0]["email"] == "pairmate@example.com"

    me = client.get(
        f"/api/rating/me?pair_id={my_pair['id']}",
        headers=registered_user["headers"],
    )
    assert me.status_code == 200
    assert me.json()["xp"] == 10
    assert me.json()["email"] == "learner@example.com"


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


def _add_game_score(db_session, user_id, pair_id, xp_earned, created_at):
    db_session.add(
        GameScore(
            user_id=user_id,
            game_type="vocabulary",
            topic_id="animals",
            language_pair_id=pair_id,
            score=xp_earned,
            xp_earned=xp_earned,
            created_at=created_at,
        )
    )
    db_session.commit()


def test_rating_period_filter_ranks_recent_xp(client, registered_user, create_user, db_session):
    """Today's leaderboard ranks by XP earned today, not lifetime XP."""
    my_pair = registered_user["pair"]

    second = create_user("today@example.com", "today-device-0001")
    second_headers = {
        "Authorization": f"Bearer {second.json()['access_token']}",
        "X-Device-Id": "today-device-0001",
    }
    second_pair = _onboard(client, second_headers, "Tajik", "English")

    my_id = _user_id(registered_user["tokens"])
    second_id = _user_id(second.json())

    # The registered learner leads on lifetime XP...
    _set_pair_xp(db_session, my_pair["id"], 5000)
    # ...but the second learner is the only one active today.
    _add_game_score(db_session, second_id, second_pair["id"], 120, datetime.now())

    today = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&period=today",
        headers=registered_user["headers"],
    )
    assert today.status_code == 200
    rows = today.json()
    assert rows[0]["user_id"] == second_id
    assert rows[0]["xp"] == 120
    my_row = next(row for row in rows if row["user_id"] == my_id)
    assert my_row["xp"] == 0

    # The all-time leaderboard still ranks the lifetime leader first.
    all_time = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}",
        headers=registered_user["headers"],
    ).json()
    assert all_time[0]["user_id"] == my_id
    assert all_time[0]["xp"] == 5000


def test_rating_period_filter_me_reflects_period(client, registered_user, create_user, db_session):
    my_pair = registered_user["pair"]
    my_id = _user_id(registered_user["tokens"])

    _set_pair_xp(db_session, my_pair["id"], 999)
    _add_game_score(db_session, my_id, my_pair["id"], 40, datetime.now())

    me_today = client.get(
        f"/api/rating/me?pair_id={my_pair['id']}&period=today",
        headers=registered_user["headers"],
    ).json()
    assert me_today["xp"] == 40

    me_all = client.get(
        f"/api/rating/me?pair_id={my_pair['id']}",
        headers=registered_user["headers"],
    ).json()
    assert me_all["xp"] == 999


def test_rating_period_filter_excludes_older_activity(client, registered_user, create_user, db_session):
    my_pair = registered_user["pair"]
    second = create_user("older@example.com", "older-device-0001")
    second_headers = {
        "Authorization": f"Bearer {second.json()['access_token']}",
        "X-Device-Id": "older-device-0001",
    }
    second_pair = _onboard(client, second_headers, "Tajik", "English")
    second_id = _user_id(second.json())

    # Activity from 40 days ago is outside the weekly and monthly windows.
    _add_game_score(
        db_session, second_id, second_pair["id"], 300, datetime.now() - timedelta(days=40)
    )

    today = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&period=today",
        headers=registered_user["headers"],
    ).json()
    second_today = next((row for row in today if row["user_id"] == second_id), None)
    assert second_today is None or second_today["xp"] == 0

    month = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&period=month",
        headers=registered_user["headers"],
    ).json()
    second_month = next((row for row in month if row["user_id"] == second_id), None)
    assert second_month is None or second_month["xp"] == 0



def test_rating_level_filter(client, registered_user, create_user, db_session):
    my_pair = registered_user["pair"]

    second = create_user("levelmate@example.com", "levelmate-device-0001")
    second_headers = {
        "Authorization": f"Bearer {second.json()['access_token']}",
        "X-Device-Id": "levelmate-device-0001",
    }
    second_pair = _onboard(client, second_headers, "Tajik", "English")
    second_id = _user_id(second.json())

    _set_pair_xp(db_session, my_pair["id"], 100)
    _set_pair_xp(db_session, second_pair["id"], 200)
    # The second learner studies at B1 while the registered learner is at A1.
    pair = db_session.query(LanguagePair).filter(LanguagePair.id == second_pair["id"]).first()
    pair.current_level = "B1"
    db_session.commit()

    a1_rows = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&level=A1",
        headers=registered_user["headers"],
    ).json()
    assert second_id not in [row["user_id"] for row in a1_rows]

    b1_rows = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&level=B1",
        headers=registered_user["headers"],
    ).json()
    assert [row["user_id"] for row in b1_rows] == [second_id]


def test_rating_region_filter(client, registered_user, create_user, db_session):
    my_pair = registered_user["pair"]

    second = create_user("regionmate@example.com", "regionmate-device-0001")
    second_headers = {
        "Authorization": f"Bearer {second.json()['access_token']}",
        "X-Device-Id": "regionmate-device-0001",
    }
    second_pair = _onboard(client, second_headers, "Tajik", "English")
    second_id = _user_id(second.json())

    _set_pair_xp(db_session, my_pair["id"], 100)
    _set_pair_xp(db_session, second_pair["id"], 200)

    # The registered learner is in Dushanbe; move the second learner to Khujand.
    user = db_session.query(User).filter(User.id == second_id).first()
    user.region = "Khujand"
    db_session.commit()

    dushanbe = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&region=Dushanbe",
        headers=registered_user["headers"],
    ).json()
    assert second_id not in [row["user_id"] for row in dushanbe]

    khujand = client.get(
        f"/api/rating/leaderboard?pair_id={my_pair['id']}&region=Khujand",
        headers=registered_user["headers"],
    ).json()
    assert [row["user_id"] for row in khujand] == [second_id]


def test_rating_filters_endpoint_lists_options(client, registered_user):
    response = client.get("/api/rating/filters", headers=registered_user["headers"])
    assert response.status_code == 200
    payload = response.json()
    assert payload["levels"] == ["A1", "A2", "B1", "B2", "C1", "C2"]
    assert payload["periods"] == ["all", "today", "week", "month"]

