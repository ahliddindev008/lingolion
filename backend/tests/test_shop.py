import pytest


def test_shop_catalog_is_listed_with_owned_state(client, registered_user):
    headers = registered_user["headers"]
    resp = client.get("/api/shop/catalog", headers=headers)
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) >= 10
    codes = {item["code"] for item in items}
    assert {"sticker_wave", "shield_streak", "gift_flower", "lion_cap"} <= codes
    # Fresh user owns nothing
    assert all(item["owned"] is False for item in items)


def _grant_coins(db_session, user_id, amount):
    from app.models import User

    user = db_session.query(User).filter(User.id == user_id).first()
    user.coins = amount
    db_session.commit()


def test_shop_buy_sticker_deducts_coins(client, registered_user, db_session):
    headers = registered_user["headers"]
    # Registered users start with 0 coins; grant some for the test.
    # We need the user id: read from the profile endpoint.
    profile = client.get("/api/profile/me", headers=headers).json()
    _grant_coins(db_session, profile["id"], 200)

    before = client.get("/api/shop/inventory", headers=headers).json()
    assert before["coins"] == 200
    assert before["owned_codes"] == []

    buy = client.post("/api/shop/buy", headers=headers, json={"item_code": "sticker_wave"})
    assert buy.status_code == 200
    body = buy.json()
    assert body["owned"] is True
    assert body["quantity"] == 1

    after = client.get("/api/shop/inventory", headers=headers).json()
    assert after["coins"] == 200 - 15
    assert "sticker_wave" in after["owned_codes"]


def test_shop_buy_requires_enough_coins(client, registered_user):
    headers = registered_user["headers"]
    resp = client.post("/api/shop/buy", headers=headers, json={"item_code": "lion_crown"})
    assert resp.status_code == 402


def test_shop_rejects_unknown_item(client, registered_user):
    headers = registered_user["headers"]
    resp = client.post("/api/shop/buy", headers=headers, json={"item_code": "nope"})
    assert resp.status_code == 404


def test_shop_lion_outfit_is_unique_and_equipable(client, registered_user, db_session):
    headers = registered_user["headers"]
    profile = client.get("/api/profile/me", headers=headers).json()
    _grant_coins(db_session, profile["id"], 500)

    first = client.post("/api/shop/buy", headers=headers, json={"item_code": "lion_cap"})
    assert first.status_code == 200
    again = client.post("/api/shop/buy", headers=headers, json={"item_code": "lion_cap"})
    assert again.status_code == 409

    equip = client.post("/api/shop/equip", headers=headers, json={"item_code": "lion_cap"})
    assert equip.status_code == 200
    assert equip.json()["is_equipped"] is True

    inventory = client.get("/api/shop/inventory", headers=headers).json()
    assert "lion_cap" in inventory["equipped_codes"]


def test_shop_gift_sends_notification_to_partner(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    profile = client.get("/api/profile/me", headers=headers).json()
    _grant_coins(db_session, profile["id"], 200)

    # Create a mirrored partner (English -> Tajik).
    device = "gift-partner-device-0001"
    tokens = create_user("partner@example.com", device).json()
    partner_headers = {"Authorization": f"Bearer {tokens['access_token']}", "X-Device-Id": device}
    onboard = client.post(
        "/api/onboarding/complete",
        headers=partner_headers,
        json={
            "first_name": "Part",
            "last_name": "Ner",
            "age": 21,
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
    partner_id = client.get("/api/profile/me", headers=partner_headers).json()["id"]

    gift = client.post(
        "/api/shop/gift",
        headers=headers,
        json={"item_code": "gift_flower", "recipient_id": partner_id},
    )
    assert gift.status_code == 200
    assert gift.json()["coins"] == 200 - 35

    notifications = client.get("/api/profile/notifications", headers=partner_headers).json()
    assert any(n["kind"] == "gift" for n in notifications)


def test_shop_gift_rejects_non_partner(client, registered_user, create_user, db_session):
    headers = registered_user["headers"]
    profile = client.get("/api/profile/me", headers=headers).json()
    _grant_coins(db_session, profile["id"], 200)

    device = "gift-stranger-device-0001"
    tokens = create_user("stranger@example.com", device).json()
    stranger_headers = {"Authorization": f"Bearer {tokens['access_token']}", "X-Device-Id": device}
    # Stranger completes onboarding with the SAME direction (not mirrored) → not a partner.
    onboard = client.post(
        "/api/onboarding/complete",
        headers=stranger_headers,
        json={
            "first_name": "Str",
            "last_name": "Anger",
            "age": 22,
            "region": "Dushanbe",
            "source_language": "Tajik",
            "target_language": "English",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "en",
        },
    )
    assert onboard.status_code == 200, onboard.text
    stranger_id = client.get("/api/profile/me", headers=stranger_headers).json()["id"]

    gift = client.post(
        "/api/shop/gift",
        headers=headers,
        json={"item_code": "gift_flower", "recipient_id": stranger_id},
    )
    assert gift.status_code == 403
