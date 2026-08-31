import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export class RealtimeWebSocketService {
  private static wss: WebSocketServer;

  public static init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws/events' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] Client connected to live weather stream.');
      ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to WeatherVani Realtime Stream' }));

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected.');
      });
    });

    console.log('[WebSocket] Realtime WebSocket Server initialized on path /ws/events');
  }

  public static broadcastEvent(event: any) {
    if (!this.wss) return;
    const payload = JSON.stringify({ type: 'NEW_WEATHER_EVENT', data: event });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  public static broadcastAlert(alert: any) {
    if (!this.wss) return;
    const payload = JSON.stringify({ type: 'SYSTEM_ALERT', data: alert });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}
