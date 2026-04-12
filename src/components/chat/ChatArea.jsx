import { useEffect, useState } from "react";
import { connectWebSocket } from "../../services/ws";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatArea({ selectedUser, currentUser }) {
  const [messages, setMessages] = useState([]);

 useEffect(() => {
  if (!currentUser) return;

  connectWebSocket(currentUser, (msg) => {
    setMessages((prev) => {
      if (
        (msg.sender === currentUser && msg.receiver === selectedUser?.username) ||
        (msg.sender === selectedUser?.username && msg.receiver === currentUser)
      ) {
        return [...prev, msg];
      }
      return prev;
    });
  });
}, [currentUser]); // ❗ bỏ selectedUser

  useEffect(() => {
    setMessages([]);
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chọn user để chat
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <ChatHeader user={selectedUser} />

      <MessageList
        messages={messages}
        currentUser={currentUser}
      />

      <MessageInput
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSend={(msg) => {
          setMessages(prev => [...prev, msg]);
        }}
      />
    </div>
  );
}