def test_translate_text_uses_google_translator(monkeypatch):
    from app import translation_service

    captured = {}
    calls = 0

    class FakeGoogleTranslator:
        def __init__(self, source, target):
            captured["source"] = source
            captured["target"] = target

        def translate(self, text):
            nonlocal calls
            calls += 1
            captured["text"] = text
            return "Bonjour"

    monkeypatch.setattr(translation_service, "GoogleTranslator", FakeGoogleTranslator)
    translation_service.translate_text.cache_clear()

    translated = translation_service.translate_text("Hello", "en", "fr")
    cached_translation = translation_service.translate_text("Hello", "en", "fr")

    assert translated == "Bonjour"
    assert cached_translation == "Bonjour"
    assert calls == 1
    assert captured == {"source": "en", "target": "fr", "text": "Hello"}
    translation_service.translate_text.cache_clear()


def test_translate_text_falls_back_to_mymemory_after_google_rate_limit(monkeypatch):
    from app import translation_service

    captured = {}

    class RateLimitedGoogleTranslator:
        def __init__(self, source, target):
            captured["google_source"] = source
            captured["google_target"] = target

        def translate(self, text):
            raise translation_service.TooManyRequests("rate limited")

    class FakeMyMemoryTranslator:
        def __init__(self, source, target):
            captured["fallback_source"] = source
            captured["fallback_target"] = target

        def get_supported_languages(self, as_dict=False):
            return {"english": "en-GB", "tajik": "tg-TJ"}

        def translate(self, text):
            captured["text"] = text
            return "Тарҷума"

    monkeypatch.setattr(translation_service, "GoogleTranslator", RateLimitedGoogleTranslator)
    monkeypatch.setattr(translation_service, "MyMemoryTranslator", FakeMyMemoryTranslator)
    translation_service.translate_text.cache_clear()
    translation_service._mymemory_languages.cache_clear()

    translated = translation_service.translate_text("Hello", "en", "tg")

    assert translated == "Тарҷума"
    assert captured == {
        "google_source": "en",
        "google_target": "tg",
        "fallback_source": "english",
        "fallback_target": "tajik",
        "text": "Hello",
    }
    translation_service.translate_text.cache_clear()
    translation_service._mymemory_languages.cache_clear()


def test_translate_endpoint_returns_translation(client, registered_user, monkeypatch):
    from app.routers import translation

    captured = {}

    def fake_translate(text, source_language, target_language):
        captured.update(text=text, source=source_language, target=target_language)
        return "Салом"

    monkeypatch.setattr(translation, "translate_text", fake_translate)

    response = client.post(
        "/api/translation/text",
        headers=registered_user["headers"],
        json={"text": "  Hello  ", "source_language": "en", "target_language": "tg"},
    )

    assert response.status_code == 200
    assert response.json() == {"translated_text": "Салом"}
    assert captured == {"text": "Hello", "source": "en", "target": "tg"}


def test_translate_endpoint_handles_provider_failure(client, registered_user, monkeypatch):
    from app.routers import translation
    from app.translation_service import TranslationServiceError

    def fail_translation(text, source_language, target_language):
        raise TranslationServiceError

    monkeypatch.setattr(translation, "translate_text", fail_translation)

    response = client.post(
        "/api/translation/text",
        headers=registered_user["headers"],
        json={"text": "Hello", "source_language": "en", "target_language": "tg"},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "google_translate_unavailable"


def test_translate_endpoint_handles_google_rate_limit(client, registered_user, monkeypatch):
    from app.routers import translation
    from app.translation_service import TranslationRateLimitError

    def rate_limited_translation(text, source_language, target_language):
        raise TranslationRateLimitError

    monkeypatch.setattr(translation, "translate_text", rate_limited_translation)

    response = client.post(
        "/api/translation/text",
        headers=registered_user["headers"],
        json={"text": "Hello", "source_language": "en", "target_language": "tg"},
    )

    assert response.status_code == 429
    assert response.json()["detail"] == "google_translate_rate_limited"


def test_speech_endpoint_transcribes_wav(client, registered_user, monkeypatch):
    from app.routers import translation

    captured = {}

    def fake_recognize_speech(audio_data, language):
        captured.update(audio=audio_data, language=language)
        return "Hello there"

    monkeypatch.setattr(translation, "recognize_speech", fake_recognize_speech)
    wav_data = b"RIFF" + b"\x00\x00\x00\x00" + b"WAVE" + b"mock-audio"

    response = client.post(
        "/api/translation/speech?language=en-US",
        headers=registered_user["headers"],
        files={"file": ("speech.wav", wav_data, "audio/wav")},
    )

    assert response.status_code == 200
    assert response.json() == {"text": "Hello there"}
    assert captured == {"audio": wav_data, "language": "en-US"}


def test_speech_endpoint_rejects_non_wav_upload(client, registered_user):
    response = client.post(
        "/api/translation/speech?language=en-US",
        headers=registered_user["headers"],
        files={"file": ("speech.webm", b"webm-data", "audio/webm")},
    )

    assert response.status_code == 415
    assert response.json()["detail"] == "unsupported_speech_audio"