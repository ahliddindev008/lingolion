"""Duels: online games with friends where both players wager coins."""
import pytest


def _grant_coins(db_session, user_id, amount):
    from app.models import User

    user = db_session.query(User).filter(User.id == user_id).first()
    user.coins = amount
    db_session.commit()


def _create_mirrored_partner(client, create_user, device="duel-partner-device-01"):
    """English→Tajik partner (mirrors the registered Tajik→English user)."""
    tokens = create_user(f"duel-partner-{device[-3:]}@example.com", device).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}", "X-Device-Id": device}
    onboard = client.post(
        "/api/onboarding/complete",
        headers=headers,
        json={
            "first_name": "Duel",
            "last_name": "Partner",
            "age": 25,
            "region": "Dushanbe",
            "source_language": "English",
            "target_language": "Tajik",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "en",
        },
    )
    assert onboard.status_code == 200, onboard.text
    partner_id = client.get("/api/profile/me", headers=headers).json()["id"]
    return partner_id, headers


def _duel_payload(pair_id, opponent_id, stake=25):
    return {
        "language_pair_id": pair_id,
        "opponent_id": opponent_id,
        "game_type": "translation",
        "topic_id": "greetings",
        "stake": stake,
        "source_language": "tj",
        "target_language": "en",
    }


def test_duel_create_escrows_stake_and_notifies(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    _grant_coins(db_session, client.get("/api/profile/me", headers=headers).json()["id"], 100)

    partner_id, partner_headers = _create_mirrored_partner(client, create_user)

    resp = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id, stake=25))
    assert resp.status_code == 201, resp.text
    duel = resp.json()
    assert duel["status"] == "pending"
    assert duel["stake"] == 25
    assert duel["pot"] == 50
    assert duel["role"] == "challenger"

    # The challenger's stake is escrowed immediately.
    assert client.get("/api/profile/me", headers=headers).json()["coins"] == 75

    # The opponent sees a pending incoming challenge.
    opponent_view = client.get("/api/duels", headers=partner_headers).json()
    assert any(d["id"] == duel["id"] and d["can_accept"] for d in opponent_view)

    notifications = client.get("/api/profile/notifications", headers=partner_headers).json()
    assert any(n["kind"] == "duel" for n in notifications)


def test_duel_winner_takes_pot(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    challenger_id = client.get("/api/profile/me", headers=headers).json()["id"]
    _grant_coins(db_session, challenger_id, 100)

    partner_id, partner_headers = _create_mirrored_partner(client, create_user)
    _grant_coins(db_session, partner_id, 100)

    duel = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id)).json()
    accept = client.post(f"/api/duels/{duel['id']}/accept", headers=partner_headers)
    assert accept.status_code == 200, accept.text
    assert accept.json()["status"] == "active"
    # Both stakes are now in the pot.
    assert client.get("/api/profile/me", headers=headers).json()["coins"] == 75
    assert client.get("/api/profile/me", headers=partner_headers).json()["coins"] == 75

    first = client.post(f"/api/duels/{duel['id']}/submit", headers=headers, json={"score": 90})
    assert first.status_code == 200, first.text
    assert first.json()["status"] == "active"  # waiting for the opponent

    second = client.post(f"/api/duels/{duel['id']}/submit", headers=partner_headers, json={"score": 60})
    assert second.status_code == 200, second.text
    result = second.json()
    assert result["status"] == "finished"
    assert result["winner_id"] == challenger_id

    # Winner gets the whole pot (2 × stake) on top of the escrowed round:
    # 100 − 25 escrowed + 50 pot = 125; the loser keeps 100 − 25 = 75.
    assert client.get("/api/profile/me", headers=headers).json()["coins"] == 125
    assert client.get("/api/profile/me", headers=partner_headers).json()["coins"] == 75


def test_duel_draw_refunds_both(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    challenger_id = client.get("/api/profile/me", headers=headers).json()["id"]
    _grant_coins(db_session, challenger_id, 100)

    partner_id, partner_headers = _create_mirrored_partner(client, create_user)
    _grant_coins(db_session, partner_id, 100)

    duel = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id)).json()
    client.post(f"/api/duels/{duel['id']}/accept", headers=partner_headers)
    client.post(f"/api/duels/{duel['id']}/submit", headers=headers, json={"score": 70})
    result = client.post(f"/api/duels/{duel['id']}/submit", headers=partner_headers, json={"score": 70}).json()

    assert result["status"] == "finished"
    assert result["winner_id"] is None
    # Draw → both get their stake back.
    assert client.get("/api/profile/me", headers=headers).json()["coins"] == 100
    assert client.get("/api/profile/me", headers=partner_headers).json()["coins"] == 100


def test_duel_decline_refunds_challenger(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    _grant_coins(db_session, client.get("/api/profile/me", headers=headers).json()["id"], 100)

    partner_id, partner_headers = _create_mirrored_partner(client, create_user)
    duel = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id)).json()

    decline = client.post(f"/api/duels/{duel['id']}/decline", headers=partner_headers)
    assert decline.status_code == 200, decline.text
    assert decline.json()["status"] == "declined"
    assert client.get("/api/profile/me", headers=headers).json()["coins"] == 100


def test_duel_cancel_refunds_challenger(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    _grant_coins(db_session, client.get("/api/profile/me", headers=headers).json()["id"], 100)

    partner_id, _ = _create_mirrored_partner(client, create_user)
    duel = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id)).json()

    cancel = client.post(f"/api/duels/{duel['id']}/cancel", headers=headers)
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "cancelled"
    assert client.get("/api/profile/me", headers=headers).json()["coins"] == 100


def test_duel_requires_enough_coins(client, registered_user, create_user):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    partner_id, _ = _create_mirrored_partner(client, create_user)

    resp = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id, stake=100))
    assert resp.status_code == 402


def test_duel_rejects_non_partner(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    _grant_coins(db_session, client.get("/api/profile/me", headers=headers).json()["id"], 100)

    # A user with an unrelated language pair (French→German) is not a partner.
    tokens = create_user("duel-stranger@example.com", "duel-stranger-device-01").json()
    stranger_headers = {"Authorization": f"Bearer {tokens['access_token']}", "X-Device-Id": "duel-stranger-device-01"}
    onboard = client.post(
        "/api/onboarding/complete",
        headers=stranger_headers,
        json={
            "first_name": "Str",
            "last_name": "Anger",
            "age": 30,
            "region": "Dushanbe",
            "source_language": "French",
            "target_language": "German",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "en",
        },
    )
    assert onboard.status_code == 200, onboard.text
    stranger_id = client.get("/api/profile/me", headers=stranger_headers).json()["id"]

    resp = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, stranger_id))
    assert resp.status_code == 403


def test_duel_submit_twice_rejected(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    challenger_id = client.get("/api/profile/me", headers=headers).json()["id"]
    _grant_coins(db_session, challenger_id, 100)

    partner_id, partner_headers = _create_mirrored_partner(client, create_user)
    _grant_coins(db_session, partner_id, 100)

    duel = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id)).json()
    client.post(f"/api/duels/{duel['id']}/accept", headers=partner_headers)

    first = client.post(f"/api/duels/{duel['id']}/submit", headers=headers, json={"score": 80})
    assert first.status_code == 200
    again = client.post(f"/api/duels/{duel['id']}/submit", headers=headers, json={"score": 99})
    assert again.status_code == 409


def test_duel_accept_requires_enough_coins(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    pair_id = registered_user["pair"]["id"]
    challenger_id = client.get("/api/profile/me", headers=headers).json()["id"]
    _grant_coins(db_session, challenger_id, 100)

    partner_id, partner_headers = _create_mirrored_partner(client, create_user)
    # Partner starts with 0 coins → cannot accept a 25-coin duel.
    duel = client.post("/api/duels", headers=headers, json=_duel_payload(pair_id, partner_id)).json()
    accept = client.post(f"/api/duels/{duel['id']}/accept", headers=partner_headers)
    assert accept.status_code == 402