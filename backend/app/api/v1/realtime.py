"""
Realtime Router — WebSocket endpoint for broadcasting live weather events.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio

router = APIRouter(tags=["Real-Time Operations"])


class ConnectionManager:
    """Manages active WebSocket dashboard connections."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                pass


manager = ConnectionManager()


@router.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial handshake message
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to National Weather Intelligence Live Event Stream"
        })
        while True:
            # Maintain connection alive
            data = await websocket.receive_text()
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
