"""Profile photos are uploaded from the learner's own gallery and surfaced
everywhere their identity is shown: profile, rating and chat partner lists."""

PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=="


def test_profile_photo_can_be_set_and_shown_in_rating(client, registered_user):
    headers = registered_user["headers"]

    update = client.put("/api/profile/me", headers=headers, json={"avatar_url": PHOTO})
    assert update.status_code == 200, update.text
    assert update.json()["avatar_url"] == PHOTO

    me = client.get("/api/profile/me", headers=headers).json()
    assert me["avatar_url"] == PHOTO

    # The rating shows the learner's gallery photo.
    board = client.get("/api/rating/leaderboard", headers=headers).json()
    entry = next(item for item in board if item["user_id"] == me["id"])
    assert entry["avatar_url"] == PHOTO

    mine = client.get("/api/rating/me", headers=headers).json()
    assert mine["avatar_url"] == PHOTO


def test_profile_photo_can_be_removed(client, registered_user):
    headers = registered_user["headers"]

    assert client.put("/api/profile/me", headers=headers, json={"avatar_url": PHOTO}).status_code == 200
    removed = client.put("/api/profile/me", headers=headers, json={"avatar_url": None})
    assert removed.status_code == 200, removed.text
    assert removed.json()["avatar_url"] is None


def test_profile_photo_rejects_plain_urls(client, registered_user):
    headers = registered_user["headers"]
    resp = client.put("/api/profile/me", headers=headers, json={"avatar_url": "https://evil.example/pic.png"})
    assert resp.status_code == 422


def test_partner_chat_list_shows_partner_photo(client, registered_user, create_user):
    """Chat lists render the partner's gallery photo (avatar_url on partners)."""
    headers = registered_user["headers"]

    device = "photo-partner-device-0001"
    tokens = create_user("photo-partner@example.com", device).json()
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

    update = client.put("/api/profile/me", headers=partner_headers, json={"avatar_url": PHOTO})
    assert update.status_code == 200, update.text

    partners = client.get("/api/communication/partners", headers=headers).json()
    partner = next(item for item in partners if item["email"] == "photo-partner@example.com")
    assert partner["avatar_url"] == PHOTO