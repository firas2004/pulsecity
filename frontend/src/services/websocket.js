// WebSocket URL:
// In K8s: use window.location (same host/port as frontend) -> Nginx proxies /ws/ -> backend-v2:8002
// In development: use VITE_WS_URL env var
const getWsBaseUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  // Build ws:// URL from current page host so it works through any port-forward or NodePort
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

let reconnectTimeout = null;

export const connectWebSocket = (cityId, onMessage) => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found. WebSocket connection skipped.');
    return () => {};
  }

  const WS_URL = getWsBaseUrl();
  const url = `${WS_URL}/ws/${cityId}?token=${token}`;
  console.log(`[WS] Connecting to: ${url}`);

  let ws;
  try {
    ws = new WebSocket(url);
  } catch (error) {
    console.error('[WS] Connection error during initialization:', error);
    reconnectTimeout = setTimeout(() => connectWebSocket(cityId, onMessage), 3000);
    return () => {};
  }

  ws.onopen = () => {
    console.log(`[WS] Connected successfully for city: ${cityId}`);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error('[WS] Failed to parse message data:', err);
    }
  };

  ws.onerror = (error) => {
    console.error(`[WS] Error on connection for city ${cityId}:`, error);
  };

  ws.onclose = (event) => {
    console.log(`[WS] Closed connection for city ${cityId}. Code: ${event.code}. Reconnecting in 3s...`);
    reconnectTimeout = setTimeout(() => {
      connectWebSocket(cityId, onMessage);
    }, 3000);
  };

  // Return a cleanup function to close connection without triggering automatic reconnect
  return () => {
    console.log(`[WS] Cleanup called for city: ${cityId}`);
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws) {
      ws.onclose = null; // Unregister listener so it doesn't trigger reconnect
      ws.onerror = null;
      ws.close();
    }
  };
};
