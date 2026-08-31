import { useEffect, useState } from 'react';
import { WeatherEvent } from '../types';

export function useWeatherWebSocket(onNewEvent?: (event: WeatherEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WeatherEvent | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:5000/ws/events');

        ws.onopen = () => {
          setIsConnected(true);
          console.log('[WebSocket] Live weather event stream connected.');
        };

        ws.onmessage = (eventMessage) => {
          try {
            const parsed = JSON.parse(eventMessage.data);
            if (parsed.type === 'NEW_WEATHER_EVENT' && parsed.data) {
              setLastEvent(parsed.data);
              if (onNewEvent) {
                onNewEvent(parsed.data);
              }
            }
          } catch (e) {
            console.error('[WebSocket] Message parsing error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Auto reconnect after 5s
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = (err) => {
          console.error('[WebSocket] Connection error:', err);
          ws?.close();
        };
      } catch (e) {
        console.error('[WebSocket] Setup exception:', e);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  return { isConnected, lastEvent };
}
