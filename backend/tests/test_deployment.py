from contextlib import nullcontext
from unittest.mock import Mock

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app import main


def test_frontend_is_served_from_api_origin(client: TestClient):
    response = client.get("/")

    assert response.status_code == 200
    assert b'id="mainView"' in response.content

    asset_response = client.get("/js/api.js")
    assert asset_response.status_code == 200
    assert b"API_ORIGIN" in asset_response.content


def test_readiness_reports_database_connection(client: TestClient, monkeypatch):
    connection = Mock()
    monkeypatch.setattr(main.engine, "connect", lambda: nullcontext(connection))

    response = client.get("/api/ready")

    assert response.status_code == 200
    assert response.json()["database"] == "ok"
    connection.execute.assert_called_once()
    assert str(connection.execute.call_args.args[0]) == "SELECT 1"


def test_readiness_fails_when_database_is_unavailable(client: TestClient, monkeypatch):
    def fail_connect():
        raise OperationalError("SELECT 1", {}, RuntimeError("database unavailable"))

    monkeypatch.setattr(main.engine, "connect", fail_connect)

    response = client.get("/api/ready")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database unavailable"}
