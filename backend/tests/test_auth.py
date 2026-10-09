def test_password_registration_and_login(client):
    email = "password-user@example.com"
    registered = client.post(
        "/api/auth/register",
        json={"email": email, "password": "StrongPass123"},
    )
    assert registered.status_code == 200, registered.text

    login = client.post(
        "/api/auth/login/password",
        json={"email": email, "password": "StrongPass123"},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]

    wrong_password = client.post(
        "/api/auth/login/password",
        json={"email": email, "password": "WrongPass123"},
    )
    assert wrong_password.status_code == 401


def test_password_reset_on_known_device_revokes_existing_refresh_tokens(client):
    email = "reset-password@example.com"
    device_headers = {"X-Device-Id": "reset-password-device-001", "X-Device-Name": "My browser"}
    tokens = client.post(
        "/api/auth/register",
        json={"email": email, "password": "StrongPass123"},
        headers=device_headers,
    ).json()

    reset = client.post(
        "/api/auth/password/reset-device",
        json={"email": email, "password": "NewStrongPass123"},
        headers=device_headers,
    )
    assert reset.status_code == 200, reset.text
    assert client.post(
        "/api/auth/login/password",
        json={"email": "reset-password@example.com", "password": "NewStrongPass123"},
    ).status_code == 200
    assert client.post(
        "/api/auth/login/password",
        json={"email": "reset-password@example.com", "password": "OldPassword123"},
    ).status_code == 401
    assert client.post(
        "/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    ).status_code == 401


def test_update_profile_settings(client, registered_user):
    response = client.put(
        "/api/profile/me",
        headers=registered_user["headers"],
        json={
            "first_name": "Amina",
            "last_name": "Rahimova",
            "age": 24,
            "region": "Khujand",
            "interface_language": "zh-CN",
        },
    )

    assert response.status_code == 200
    assert response.json()["first_name"] == "Amina"
    assert response.json()["last_name"] == "Rahimova"
    assert response.json()["age"] == 24
    assert response.json()["region"] == "Khujand"
    assert response.json()["interface_language"] == "zh-CN"


def test_delete_account_removes_user_and_revokes_access(client, registered_user):
    response = client.request(
        "DELETE",
        "/api/profile/me",
        headers=registered_user["headers"],
        json={"password": "StrongPass123"},
    )
    assert response.status_code == 204

    profile_response = client.get("/api/profile/me", headers=registered_user["headers"])
    assert profile_response.status_code == 401


def test_delete_account_wrong_password_fails(client, registered_user):
    response = client.request(
        "DELETE",
        "/api/profile/me",
        headers=registered_user["headers"],
        json={"password": "WrongPassword123"},
    )
    assert response.status_code == 403

    profile_response = client.get("/api/profile/me", headers=registered_user["headers"])
    assert profile_response.status_code == 200


def test_refresh_token_rotates_and_old_one_fails(client, create_user):
    resp = create_user("carol@example.com")
    tokens = resp.json()

    refresh_resp = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert new_tokens["refresh_token"] != tokens["refresh_token"]

    # the original (now-rotated) refresh token must no longer work
    reuse_resp = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert reuse_resp.status_code == 401


def test_logout_revokes_refresh_token(client, create_user):
    resp = create_user("dave@example.com")
    tokens = resp.json()

    logout_resp = client.post("/api/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert logout_resp.status_code == 204

    refresh_resp = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refresh_resp.status_code == 401


def test_sessions_are_per_device_and_can_be_revoked_remotely(client, create_user):
    email = "sessions@example.com"
    create_user(email)

    def login(device_id, device_name):
        response = client.post(
            "/api/auth/login/password",
            json={"email": email, "password": "StrongPass123"},
            headers={"X-Device-Id": device_id, "X-Device-Name": device_name},
        )
        assert response.status_code == 200, response.text
        return response.json()

    phone_tokens = login("phone-device-0001", "Phone")
    laptop_tokens = login("laptop-device-001", "Laptop")
    phone_headers = {
        "Authorization": f"Bearer {phone_tokens['access_token']}",
        "X-Device-Id": "phone-device-0001",
    }

    sessions_response = client.get("/api/auth/sessions", headers=phone_headers)
    assert sessions_response.status_code == 200
    sessions = sessions_response.json()
    assert len(sessions) == 2
    assert {session["device_name"] for session in sessions} == {"Phone", "Laptop"}
    laptop_session = next(session for session in sessions if session["device_id"] == "laptop-device-001")
    assert laptop_session["is_current"] is False

    revoke_response = client.delete(f"/api/auth/sessions/{laptop_session['id']}", headers=phone_headers)
    assert revoke_response.status_code == 204
    assert client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {laptop_tokens['access_token']}"},
    ).status_code == 401
    assert client.post(
        "/api/auth/refresh",
        json={"refresh_token": laptop_tokens["refresh_token"]},
        headers={"X-Device-Id": "laptop-device-001"},
    ).status_code == 401


def test_same_device_login_replaces_its_refresh_session(client, create_user):
    email = "same-device@example.com"
    create_user(email)
    device_headers = {"X-Device-Id": "same-device-id-0001", "X-Device-Name": "My browser"}

    def login():
        return client.post(
            "/api/auth/login/password",
            json={"email": email, "password": "StrongPass123"},
            headers=device_headers,
        ).json()

    old_tokens = login()
    current_tokens = login()
    headers = {**device_headers, "Authorization": f"Bearer {current_tokens['access_token']}"}

    sessions = client.get("/api/auth/sessions", headers=headers).json()
    assert len(sessions) == 1
    assert sessions[0]["is_current"] is True
    assert client.post(
        "/api/auth/refresh",
        json={"refresh_token": old_tokens["refresh_token"]},
        headers=device_headers,
    ).status_code == 401


def test_email_code_endpoints_are_removed(client, registered_user):
    assert client.post(
        "/api/auth/register/request-code", json={"email": "unused@example.com"}
    ).status_code == 404
    assert client.post(
        "/api/auth/register/verify-code",
        json={"email": "unused@example.com", "code": "000000", "password": "StrongPass123"},
    ).status_code == 404
    assert client.post(
        "/api/auth/password/request-reset", json={"email": "unused@example.com"}
    ).status_code == 404
    assert client.post(
        "/api/auth/password/reset",
        json={"email": "unused@example.com", "code": "000000", "password": "StrongPass123"},
    ).status_code == 404
    assert client.post(
        "/api/profile/delete-account/request-code", headers=registered_user["headers"]
    ).status_code == 404
    assert client.request(
        "DELETE",
        "/api/profile/me",
        json={"code": "000000"},
        headers=registered_user["headers"],
    ).status_code == 422


def test_google_signin_routes_are_removed(client):
    assert client.get("/api/auth/google/client-id").status_code == 404
    assert client.post("/api/auth/google", json={"credential": "unused"}).status_code == 404
    assert client.post(
        "/api/auth/login/request-code",
        json={"email": "unused@example.com"},
    ).status_code == 404
    assert client.post(
        "/api/auth/login/verify-code",
        json={"email": "unused@example.com", "code": "000000"},
    ).status_code == 404