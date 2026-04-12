
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;


export const connectWebSocket = (username, onMessage) => {
  if (stompClient?.active) return;

  stompClient = new Client({
    brokerURL: `ws://localhost:8080/ws?username=${username}`, // ✅ dùng ws://
    reconnectDelay: 5000,

    onConnect: () => {
      isConnected = true;
      console.log("✅ WS Connected");

      stompClient.subscribe("/user/queue/messages", (msg) => {
        console.log("🔥 RECEIVED:", msg.body);
        onMessage(JSON.parse(msg.body));
      });
    },
    onDisconnect: () => {
      isConnected = false;
      console.log("🔌 WS Disconnected");
    },

    onStompError: (frame) => {
      console.error("❌ WS Error:", frame);
    },
  });

  stompClient.activate();
};

export const isWSConnected = () => isConnected;

export const sendPrivateMessage = ({ sender, receiver, content }) => {
  if (!stompClient) {
    console.error("❌ WS chưa init");
    return;
  }

  if (!stompClient.connected) {
    console.error("❌ WS chưa connect xong");
    return;
  }

  console.log("📤 Gửi:", { sender, receiver, content });

  stompClient.publish({
    destination: "/app/chat.private",
    body: JSON.stringify({ sender, receiver, content }),
  });
};