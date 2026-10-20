import json

from app import gemini_service


def test_gemini_uses_a_supported_lesson_generation_model(monkeypatch):
    captured = {}

    class Response:
        text = '{"title":"Test lesson"}'

    class Model:
        def __init__(self, model_name):
            captured["model"] = model_name

        def generate_content(self, prompt):
            captured["prompt"] = prompt
            return Response()

    monkeypatch.setattr(gemini_service.genai, "GenerativeModel", Model)

    result = gemini_service._call_gemini("create a lesson")

    assert result == '{"title":"Test lesson"}'
    assert captured == {
        "model": "gemini-3.6-flash",
        "prompt": "create a lesson",
    }


def test_quota_error_uses_deepseek_fallback(monkeypatch):
    monkeypatch.setattr("app.config.settings.DEEPSEEK_API_KEY", "test-deepseek-key")
    monkeypatch.setattr(
        gemini_service,
        "_call_gemini",
        lambda _: (_ for _ in ()).throw(RuntimeError("429 RESOURCE_EXHAUSTED: quota exceeded")),
    )
    monkeypatch.setattr(
        gemini_service,
        "_call_deepseek",
        lambda _: '{"reply":"Hello","has_errors":false}',
    )

    result = gemini_service.generate_structured("prompt", {"reply": "fallback"})

    assert result == {"reply": "Hello", "has_errors": False}


def test_non_quota_gemini_error_does_not_use_deepseek(monkeypatch):
    monkeypatch.setattr("app.config.settings.DEEPSEEK_API_KEY", "test-deepseek-key")
    monkeypatch.setattr(
        gemini_service,
        "_call_gemini",
        lambda _: (_ for _ in ()).throw(RuntimeError("invalid request")),
    )
    monkeypatch.setattr(
        gemini_service,
        "_call_deepseek",
        lambda _: (_ for _ in ()).throw(AssertionError("DeepSeek should only run for quota errors")),
    )

    result = gemini_service.generate_structured("prompt", {"reply": "fallback"})

    assert result == {"reply": "fallback"}


def test_deepseek_request_uses_chat_completions_json_mode(monkeypatch):
    monkeypatch.setattr("app.config.settings.DEEPSEEK_API_KEY", "test-deepseek-key")
    captured = {}

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return None

        def read(self):
            return json.dumps({"choices": [{"message": {"content": '{"items":[]}'}}]}).encode()

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["authorization"] = request.get_header("Authorization")
        captured["body"] = json.loads(request.data)
        captured["timeout"] = timeout
        return Response()

    monkeypatch.setattr(gemini_service, "urlopen", fake_urlopen)

    assert gemini_service._call_deepseek("make json") == '{"items":[]}'
    assert captured == {
        "url": "https://api.deepseek.com/chat/completions",
        "authorization": "Bearer test-deepseek-key",
        "body": {
            "model": "deepseek-flash",
            "messages": [{"role": "user", "content": "make json"}],
            "response_format": {"type": "json_object"},
        },
        "timeout": 90,
    }
