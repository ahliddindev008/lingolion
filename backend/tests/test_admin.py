def test_non_admin_cannot_access_admin_data(client, registered_user):
    headers = registered_user["headers"]

    status_response = client.get("/api/admin/status", headers=headers)
    overview_response = client.get("/api/admin/overview", headers=headers)
    users_response = client.get("/api/admin/users", headers=headers)

    assert status_response.status_code == 200
    assert status_response.json() == {"is_admin": False}
    assert overview_response.status_code == 403
    assert users_response.status_code == 403


def test_admin_can_search_users_and_toggle_accounts(client, registered_user, monkeypatch, create_user):
    monkeypatch.setattr("app.routers.admin.settings.ADMIN_EMAILS", "learner@example.com")
    create_user("target@example.com")

    headers = registered_user["headers"]
    status_response = client.get("/api/admin/status", headers=headers)
    overview_response = client.get("/api/admin/overview", headers=headers)
    users_response = client.get("/api/admin/users?search=target", headers=headers)

    assert status_response.json() == {"is_admin": True}
    assert overview_response.status_code == 200
    assert overview_response.json()["total_users"] == 2
    assert users_response.status_code == 200
    assert users_response.json()["total"] == 1
    target_user = users_response.json()["items"][0]
    admin_user = client.get(
        "/api/admin/users?search=learner%40example.com",
        headers=headers,
    ).json()["items"][0]
    assert admin_user["is_admin"] is True
    admin_details = client.get(f"/api/admin/users/{admin_user['id']}", headers=headers)
    assert admin_details.json()["is_admin"] is True

    deactivate_response = client.patch(
        f"/api/admin/users/{target_user['id']}/status",
        headers=headers,
        json={"is_active": False},
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["is_active"] is False

    reactivate_response = client.patch(
        f"/api/admin/users/{target_user['id']}/status",
        headers=headers,
        json={"is_active": True},
    )
    assert reactivate_response.status_code == 200
    assert reactivate_response.json()["is_active"] is True

    admin_id = client.get("/api/auth/me", headers=headers).json()["id"]
    self_deactivate_response = client.patch(
        f"/api/admin/users/{admin_id}/status",
        headers=headers,
        json={"is_active": False},
    )
    assert self_deactivate_response.status_code == 409


def test_admin_can_delete_non_admin_users(client, registered_user, monkeypatch, create_user):
    monkeypatch.setattr("app.routers.admin.settings.ADMIN_EMAILS", "learner@example.com")
    target = create_user("delete-me@example.com")

    headers = registered_user["headers"]
    user = client.get("/api/admin/users?search=delete-me", headers=headers).json()["items"][0]
    delete_response = client.delete(f"/api/admin/users/{user['id']}", headers=headers)

    assert delete_response.status_code == 204
    assert client.get("/api/admin/users?search=delete-me", headers=headers).json()["total"] == 0
    assert client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {target.json()['access_token']}"}
    ).status_code == 401


def test_admin_can_filter_inspect_and_update_user_rewards(client, registered_user, monkeypatch, create_user):
    monkeypatch.setattr("app.routers.admin.settings.ADMIN_EMAILS", "learner@example.com")
    target = create_user("rewards@example.com")
    target_headers = {"Authorization": f"Bearer {target.json()['access_token']}"}
    onboarding = client.post(
        "/api/onboarding/complete",
        headers=target_headers,
        json={
            "first_name": "Rewards",
            "last_name": "User",
            "age": 20,
            "region": "Dushanbe",
            "source_language": "Français",
            "target_language": "English",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "de",
        },
    )
    assert onboarding.status_code == 200, onboarding.text
    client.put(
        "/api/profile/me",
        headers={"Authorization": f"Bearer {target.json()['access_token']}"},
        json={"interface_language": "ru"},
    )

    headers = registered_user["headers"]
    users_response = client.get(
        "/api/admin/users?status=active&language=Français&sort=xp&page_size=50", headers=headers
    )
    assert users_response.status_code == 200
    assert users_response.json()["total"] == 1
    assert users_response.json()["items"][0]["is_admin"] is False
    user = users_response.json()["items"][0]

    english_users = client.get("/api/admin/users?language=English", headers=headers)
    assert english_users.status_code == 200
    assert english_users.json()["total"] == 2

    out_of_range = client.get(
        "/api/admin/users?status=active&language=Français&sort=xp&page=99&page_size=50",
        headers=headers,
    )
    assert out_of_range.status_code == 200
    assert out_of_range.json()["page"] == 1
    assert out_of_range.json()["page_count"] == 1
    assert len(out_of_range.json()["items"]) == 1

    details = client.get(f"/api/admin/users/{user['id']}", headers=headers)
    assert details.status_code == 200
    assert details.json()["email"] == "rewards@example.com"
    assert details.json()["games_played"] == 0

    rewards = client.patch(
        f"/api/admin/users/{user['id']}/rewards",
        headers=headers,
        json={"xp": 125, "coins": 30},
    )
    assert rewards.status_code == 200
    assert rewards.json() == {"id": user["id"], "xp": 125, "coins": 30}

    overview = client.get("/api/admin/overview", headers=headers)
    assert overview.status_code == 200
    assert overview.json()["total_xp"] == 125
    assert overview.json()["onboarded_users"] == 2
    assert overview.json()["pending_onboarding"] == 0
    available_languages = overview.json()["available_languages"]
    assert {
        "Тоҷикӣ",
        "Русский",
        "English",
        "Deutsch",
        "Français",
        "Español",
        "Italiano",
        "Türkçe",
        "العربية",
        "فارسی",
        "中文",
        "日本語",
        "Tajik",
    }.issubset(available_languages)
    assert available_languages == sorted(available_languages, key=str.casefold)