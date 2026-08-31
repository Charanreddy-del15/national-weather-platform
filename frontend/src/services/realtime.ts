/**
 * WebSocket Real-Time Stream Manager.
 */

type Listener = (data: any) => void;

class RealtimeStreamManager {
  private socket: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private isConnected: boolean = false;

  public connect() {
    if (this.socket) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('[Realtime] WebSocket Stream Connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((fn) => fn(data));
        } catch (e) {
          console.error('[Realtime] Failed to parse message', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.socket = null;
        // Auto reconnect attempt after 5s
        setTimeout(() => this.connect(), 5000);
      };

      this.socket.onerror = (err) => {
        console.warn('[Realtime] WebSocket warning/error:', err);
      };
    } catch (err) {
      console.warn('[Realtime] Could not initiate WebSocket connection:', err);
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus() {
    return this.isConnected;
  }
}

export const realtimeManager = new RealtimeStreamManager();
