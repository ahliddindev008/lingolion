from app.security import decode_access_token


def test_ai_tutor_prompt_uses_dialogue_context_and_roleplay(monkeypatch):
    from app import gemini_service

    monkeypatch.undo()
    prompts = []

    def capture_prompt(prompt, fallback):
        prompts.append(prompt)
        return fallback

    monkeypatch.setattr(gemini_service, "generate_structured", capture_prompt)
    gemini_service.analyze_message(
        source_language="Tajik",
        target_language="English",
        level="A1",
        user_message="I would like tea",
        conversation_history=[
            {"role": "learner", "content": "Hello"},
            {"role": "assistant", "content": "Welcome! What would you like?"},
        ],
        practice_scenario="cafe",
    )

    assert len(prompts) == 1
    assert '"role": "learner"' in prompts[0]
    assert "Welcome! What would you like?" in prompts[0]
    assert "ordering food and drinks at a cafe" in prompts[0]


def test_ai_chat_carries_conversation_context_and_scenario(client, registered_user, monkeypatch):
    from app import gemini_service

    calls = []

    def capture_analysis(
        source_language,
        target_language,
        level,
        user_message,
        conversation_history=None,
        practice_scenario="free_talk",
    ):
        calls.append({
            "user_message": user_message,
            "conversation_history": conversation_history,
            "practice_scenario": practice_scenario,
        })
        return {
            "reply": f"Reply to {user_message}",
            "has_errors": False,
            "corrected_text": "",
            "correction_notes": "",
        }

    monkeypatch.setattr(gemini_service, "analyze_message", capture_analysis)
    user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    room = f"ai_tutor_{user_id}_{registered_user['pair']['id']}"

    first_response = client.post(
        "/api/communication/send",
        headers=registered_user["headers"],
        json={
            "room": room,
            "content": "Hello",
            "language_pair_id": registered_user["pair"]["id"],
            "practice_scenario": "cafe",
        },
    )
    second_response = client.post(
        "/api/communication/send",
        headers=registered_user["headers"],
        json={
            "room": room,
            "content": "I would like tea",
            "language_pair_id": registered_user["pair"]["id"],
            "practice_scenario": "travel",
        },
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert calls[0]["practice_scenario"] == "cafe"
    assert calls[1]["practice_scenario"] == "travel"
    assert calls[1]["conversation_history"] == [
        {"role": "learner", "content": "Hello"},
        {"role": "assistant", "content": "Reply to Hello"},
    ]


def test_upload_and_download_chat_attachment(client, registered_user, monkeypatch, tmp_path):
    monkeypatch.setattr("app.routers.communication.CHAT_UPLOAD_DIR", tmp_path, raising=False)
    user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    room = f"ai_tutor_{user_id}_{registered_user['pair']['id']}"

    upload_response = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("practice.txt", b"Today I practiced English.", "text/plain")},
    )

    assert upload_response.status_code == 200
    message = upload_response.json()
    marker_parts = message["content"].split("|", 1)
    assert marker_parts[0].startswith("attachment:")
    attachment_id = marker_parts[0].split(":", 1)[1]

    download_response = client.get(
        f"/api/communication/rooms/{room}/attachments/{attachment_id}",
        headers=registered_user["headers"],
    )
    assert download_response.status_code == 200
    assert download_response.content == b"Today I practiced English."
    assert download_response.headers["content-type"] == "application/octet-stream"
    assert "attachment" in download_response.headers["content-disposition"]

    forbidden_response = client.get(
        f"/api/communication/rooms/ai_tutor_999_{user_id}/attachments/{attachment_id}",
        headers=registered_user["headers"],
    )
    assert forbidden_response.status_code == 403


def test_same_direction_partner_pair_is_shown_in_communication_match_list(client, registered_user, create_user):
    second = create_user("same-language@example.com")
    second_headers = {"Authorization": f"Bearer {second.json()['access_token']}"}
    second_onboarding = client.post(
        "/api/onboarding/complete",
        headers=second_headers,
        json={
            "first_name": "Same",
            "last_name": "Partner",
            "age": 23,
            "region": "Dushanbe",
            "source_language": "Tajik",
            "target_language": "English",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 20,
            "interface_language": "tj",
        },
    )
    assert second_onboarding.status_code == 200

    response = client.get("/api/communication/partners", headers=registered_user["headers"])

    assert response.status_code == 200
    partner_ids = {partner["user_id"] for partner in response.json()}
    second_user_id = int(decode_access_token(second.json()["access_token"])["sub"])
    assert second_user_id in partner_ids


def test_partner_message_creates_unread_communication_notification(client, registered_user, tmp_path, monkeypatch, create_user):
    monkeypatch.setattr("app.routers.communication.CHAT_UPLOAD_DIR", tmp_path, raising=False)
    registration = create_user("chat-recipient@example.com")
    sender_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    recipient_id = int(decode_access_token(registration.json()["access_token"])["sub"])
    room = f"partner_{min(sender_id, recipient_id)}_{max(sender_id, recipient_id)}"

    upload = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("note.txt", b"Hello from Lingolion", "text/plain")},
    )
    assert upload.status_code == 200

    notifications = client.get(
        "/api/profile/notifications",
        headers={"Authorization": f"Bearer {registration.json()['access_token']}"},
    )
    message_notice = next(item for item in notifications.json() if item["kind"] == "message")
    assert message_notice["is_read"] is False
    assert message_notice["title"] == "Test Learner"
    assert "note.txt" in message_notice["message"]


def test_user_can_unsend_own_message_but_not_partner_message(client, registered_user, create_user):
    registration = create_user("unsend-partner@example.com")
    partner_token = registration.json()["access_token"]
    partner_headers = {"Authorization": f"Bearer {partner_token}"}
    sender_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    partner_id = int(decode_access_token(partner_token)["sub"])
    room = f"partner_{min(sender_id, partner_id)}_{max(sender_id, partner_id)}"

    own_message = client.post(
        "/api/communication/send",
        headers=registered_user["headers"],
        json={"room": room, "content": "Please cancel this"},
    ).json()
    partner_message = client.post(
        "/api/communication/send",
        headers=partner_headers,
        json={"room": room, "content": "Keep this message"},
    ).json()

    forbidden = client.delete(
        f"/api/communication/rooms/{room}/messages/{partner_message['id']}",
        headers=registered_user["headers"],
    )
    assert forbidden.status_code == 403

    with client.websocket_connect(
        f"/api/communication/ws/{room}?token={registered_user['tokens']['access_token']}"
    ) as sender_socket:
        with client.websocket_connect(f"/api/communication/ws/{room}?token={partner_token}") as partner_socket:
            deleted = client.delete(
                f"/api/communication/rooms/{room}/messages/{own_message['id']}",
                headers=registered_user["headers"],
            )
            deletion_event = partner_socket.receive_json()

    assert deleted.status_code == 200
    assert deleted.json() == {"status": "deleted", "message_id": own_message["id"]}
    assert deletion_event == {"type": "message_deleted", "message_id": own_message["id"]}
    assert [message["id"] for message in client.get(
        f"/api/communication/rooms/{room}/messages",
        headers=partner_headers,
    ).json()] == [partner_message["id"]]


def test_clear_conversation_is_private_to_each_user(client, registered_user, create_user):
    registration = create_user("clear-chat-partner@example.com")
    partner_token = registration.json()["access_token"]
    partner_headers = {"Authorization": f"Bearer {partner_token}"}
    sender_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    partner_id = int(decode_access_token(partner_token)["sub"])
    room = f"partner_{min(sender_id, partner_id)}_{max(sender_id, partner_id)}"

    sent = client.post(
        "/api/communication/send",
        headers=registered_user["headers"],
        json={"room": room, "content": "Private history"},
    )
    assert sent.status_code == 200

    cleared = client.delete(
        f"/api/communication/rooms/{room}/messages",
        headers=registered_user["headers"],
    )
    assert cleared.status_code == 200
    assert client.get(
        f"/api/communication/rooms/{room}/messages",
        headers=registered_user["headers"],
    ).json() == []
    assert len(client.get(
        f"/api/communication/rooms/{room}/messages",
        headers=partner_headers,
    ).json()) == 1

    later = client.post(
        "/api/communication/send",
        headers=registered_user["headers"],
        json={"room": room, "content": "New message"},
    )
    assert later.status_code == 200
    visible_to_sender = client.get(
        f"/api/communication/rooms/{room}/messages",
        headers=registered_user["headers"],
    ).json()
    assert [message["content"] for message in visible_to_sender] == ["New message"]


def test_unsending_attachment_removes_its_file(client, registered_user, tmp_path, monkeypatch):
    monkeypatch.setattr("app.routers.communication.CHAT_UPLOAD_DIR", tmp_path, raising=False)
    user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    room = f"ai_tutor_{user_id}_{registered_user['pair']['id']}"
    upload = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("remove.txt", b"Remove this attachment", "text/plain")},
    )
    assert upload.status_code == 200
    message = upload.json()
    attachment_id = message["content"].split(":", 1)[1].split("|", 1)[0]
    attachment_path = next(tmp_path.glob(f"{attachment_id}.*"))

    deleted = client.delete(
        f"/api/communication/rooms/{room}/messages/{message['id']}",
        headers=registered_user["headers"],
    )

    assert deleted.status_code == 200
    assert not attachment_path.exists()


def test_unsending_message_removes_its_partner_notification(client, registered_user, tmp_path, monkeypatch, create_user):
    monkeypatch.setattr("app.routers.communication.CHAT_UPLOAD_DIR", tmp_path, raising=False)
    registration = create_user("notification-delete-partner@example.com")
    partner_headers = {"Authorization": f"Bearer {registration.json()['access_token']}"}
    sender_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    partner_id = int(decode_access_token(registration.json()["access_token"])["sub"])
    room = f"partner_{min(sender_id, partner_id)}_{max(sender_id, partner_id)}"
    upload = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("note.txt", b"Please remove this", "text/plain")},
    )
    assert upload.status_code == 200
    message_id = upload.json()["id"]

    before_delete = client.get("/api/profile/notifications", headers=partner_headers)
    assert any(notification["kind"] == "message" for notification in before_delete.json())

    deleted = client.delete(
        f"/api/communication/rooms/{room}/messages/{message_id}",
        headers=registered_user["headers"],
    )
    assert deleted.status_code == 200

    after_delete = client.get("/api/profile/notifications", headers=partner_headers)
    assert not any(notification["kind"] == "message" for notification in after_delete.json())


def test_partner_websocket_relays_voice_call_offer(client, registered_user, create_user):
    registration = create_user("partner@example.com")
    partner_token = registration.json()["access_token"]
    partner_headers = {"Authorization": f"Bearer {partner_token}"}
    onboarding = client.post(
        "/api/onboarding/complete",
        headers=partner_headers,
        json={
            "first_name": "Practice",
            "last_name": "Partner",
            "age": 21,
            "region": "Dushanbe",
            "source_language": "English",
            "target_language": "Tajik",
            "current_level": "A1",
            "learning_goal": "travel",
            "daily_time_minutes": 15,
            "interface_language": "tj",
        },
    )
    assert onboarding.status_code == 200

    first_user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    second_user_id = int(decode_access_token(partner_token)["sub"])
    room = f"partner_{min(first_user_id, second_user_id)}_{max(first_user_id, second_user_id)}"
    signal = {
        "type": "call_signal",
        "action": "offer",
        "call_id": "test-call",
        "description": {"type": "offer", "sdp": "test-sdp"},
    }

    with client.websocket_connect(
        f"/api/communication/ws/{room}?token={registered_user['tokens']['access_token']}"
    ) as caller:
        with client.websocket_connect(f"/api/communication/ws/{room}?token={partner_token}") as receiver:
            caller.send_json(signal)
            relayed = receiver.receive_json()

    assert relayed == {
        "type": "call_signal",
        "sender_id": first_user_id,
        "action": "offer",
        "call_id": "test-call",
        "description": {"type": "offer", "sdp": "test-sdp"},
    }


def test_upload_rejects_attachments_over_10_mb(client, registered_user):
    user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    room = f"ai_tutor_{user_id}_{registered_user['pair']['id']}"

    response = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("large.txt", b"x" * (10 * 1024 * 1024 + 1), "text/plain")},
    )

    assert response.status_code == 413


def test_image_attachment_is_served_inline(client, registered_user, monkeypatch, tmp_path):
    monkeypatch.setattr("app.routers.communication.CHAT_UPLOAD_DIR", tmp_path, raising=False)
    user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    room = f"ai_tutor_{user_id}_{registered_user['pair']['id']}"

    upload_response = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("practice.png", b"\x89PNG\r\n\x1a\nimage-data", "image/png")},
    )
    attachment_id = upload_response.json()["content"].split("|", 1)[0].split(":", 1)[1]

    image_response = client.get(
        f"/api/communication/rooms/{room}/attachments/{attachment_id}",
        headers=registered_user["headers"],
    )

    assert image_response.status_code == 200
    assert image_response.headers["content-type"] == "image/png"
    assert "inline" in image_response.headers["content-disposition"]


def test_voice_message_attachment_is_served_inline(client, registered_user, monkeypatch, tmp_path):
    monkeypatch.setattr("app.routers.communication.CHAT_UPLOAD_DIR", tmp_path, raising=False)
    user_id = int(decode_access_token(registered_user["tokens"]["access_token"])["sub"])
    room = f"partner_{user_id}_{user_id + 1}"
    audio_data = b"\x1aE\xdf\xa3voice-message"

    upload_response = client.post(
        f"/api/communication/rooms/{room}/attachments",
        headers=registered_user["headers"],
        files={"file": ("voice-message.webm", audio_data, "audio/webm")},
    )
    assert upload_response.status_code == 200
    attachment_id = upload_response.json()["content"].split(":", 1)[1].split("|", 1)[0]

    audio_response = client.get(
        f"/api/communication/rooms/{room}/attachments/{attachment_id}",
        headers=registered_user["headers"],
    )

    assert audio_response.status_code == 200
    assert audio_response.content == audio_data
    assert audio_response.headers["content-type"] == "audio/webm"
    assert "inline" in audio_response.headers["content-disposition"]


def test_lan_frontend_origin_is_allowed_in_development(client):
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://192.168.1.42:5500",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://192.168.1.42:5500"