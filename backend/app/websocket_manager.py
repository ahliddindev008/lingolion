import logging
from datetime import date, timedelta

from fastapi import WebSocket


logger = logging.getLogger("lingolion.ws")


def bump_streak(user) -> None:
    """Update a user's (or language pair's) daily streak based on last_active_date."""
    today = date.today()
    last = getattr(user, "last_active_date", None)
    if last == today:
        return
    if last == today - timedelta(days=1):
        user.streak_days = (user.streak_days or 0) + 1
    else:
        user.streak_days = 1
    user.last_active_date = today


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(room, []).append(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        if room in self.active_connections:
            if websocket in self.active_connections[room]:
                self.active_connections[room].remove(websocket)
            if not self.active_connections[room]:
                del self.active_connections[room]

    async def broadcast(self, room: str, message: dict):
        for connection in self.active_connections.get(room, []):
            try:
                await connection.send_json(message)
            except Exception:
                logger.exception("Failed to send websocket message")


manager = ConnectionManager()
