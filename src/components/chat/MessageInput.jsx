  import { useState } from "react";
  import {
    sendPrivateMessage,
    isWSConnected,
  } from "../../services/ws";

  export default function MessageInput({ currentUser, selectedUser, onSend  }) {
    const [content, setContent] = useState("");
    
    const handleSend = () => {
    if (!content.trim()) return;

    if (!isWSConnected()) {
      alert("WebSocket chưa kết nối!");
      return;
    }

    const msg = {
      sender: currentUser,
      receiver: selectedUser.username,
      content,
    };

    sendPrivateMessage(msg);

    onSend(msg); // ✅ đúng

    setContent("");
  };

    return (
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aa"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button onClick={handleSend} className="text-indigo-500">
            Gửi
          </button>
        </div>
      </div>
    );
  }