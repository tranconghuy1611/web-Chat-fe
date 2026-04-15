import { Client } from "@stomp/stompjs";

let stompClient = null;
let connectedUsername = null;
const listeners = new Set();
const pendingMessages = [];
let currentSubscriptions = [];
const desiredRoomIds = new Set();

const notifyListeners = (message) => {
  listeners.forEach((listener) => listener(message));
};

const flushPendingMessages = () => {
  if (!stompClient?.connected) return;

  while (pendingMessages.length > 0) {
    stompClient.publish(pendingMessages.shift());
  }
};

const upsertRoomSubscription = (roomId) => {
  if (!roomId || !stompClient?.connected) return null;

  const existing = currentSubscriptions.find((s) => s.roomId === roomId);
  if (existing) return existing.subscription;

  const subscription = stompClient.subscribe(`/topic/room/${roomId}`, (msg) => {
    try {
      const parsed = JSON.parse(msg.body);
      notifyListeners(parsed);
    } catch (e) {
      console.error("Parse room message failed:", e);
    }
  });

  currentSubscriptions.push({ roomId, subscription });
  return subscription;
};

const resubscribeDesiredRooms = () => {
  desiredRoomIds.forEach((roomId) => upsertRoomSubscription(roomId));
};

// ================= CONNECT =================
export const connectWebSocket = (onMessage) => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token || !username) {
    console.error("Missing token/username for websocket connection");
    return () => {};
  }

  if (onMessage) listeners.add(onMessage);

  if (stompClient?.active && connectedUsername === username) {
    return () => listeners.delete(onMessage);
  }

  if (stompClient && connectedUsername !== username) {
    stompClient.deactivate();
    stompClient = null;
    currentSubscriptions = [];
  }

  stompClient = new Client({
    brokerURL: `ws://localhost:8080/ws?username=${encodeURIComponent(
      username
    )}&access_token=${encodeURIComponent(token)}`,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("✅ WS Connected");
      connectedUsername = username;
      resubscribeDesiredRooms();
      flushPendingMessages();
    },

    onStompError: (frame) => {
      console.error("STOMP Error:", frame.headers?.message);
    },

    onWebSocketClose: () => {
      currentSubscriptions = [];
      console.warn("WebSocket closed");
    },
  });

  stompClient.activate();

  return () => listeners.delete(onMessage);
};

// ================= SUBSCRIBE ROOM =================
export const subscribeRoom = (roomId) => {
  if (!roomId) return null;
  desiredRoomIds.add(roomId);
  return upsertRoomSubscription(roomId);
};

export const unsubscribeAll = () => {
  currentSubscriptions.forEach((s) => s.subscription.unsubscribe());
  currentSubscriptions = [];
  desiredRoomIds.clear();
};

// ================= SEND =================
// Khớp backend: ChatController @MessageMapping("/chat.private") → STOMP /app/chat.private
export const sendPrivateMessage = ({ receiver, roomId, content }) => {
  const frame = {
    destination: "/app/chat.private",
    body: JSON.stringify({ receiver, roomId, content }),
  };

  if (!stompClient?.connected) {
    pendingMessages.push(frame);
    return true;
  }

  stompClient.publish(frame);
  return true;
};

// Khớp backend: ChatController @MessageMapping("/chat.room") → STOMP /app/chat.room
// Server broadcast: /topic/room/{roomId} (đã subscribe trong subscribeRoom)
export const sendRoomMessage = (roomId, content) => {
  const frame = {
    destination: "/app/chat.room",
    body: JSON.stringify({ roomId, content }),
  };

  if (!stompClient?.connected) {
    pendingMessages.push(frame);
    return true;
  }

  stompClient.publish(frame);
  return true;
};

// ================= DISCONNECT =================
export const disconnectWebSocket = async () => {
  if (stompClient) {
    await stompClient.deactivate();
    stompClient = null;
  }
  listeners.clear();
  pendingMessages.length = 0;
  unsubscribeAll();
  connectedUsername = null;
};