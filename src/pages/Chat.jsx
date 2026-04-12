import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";
import {
  connectWebSocket,
  sendPrivateMessage,
  isWSConnected,
} from "../services/ws";
import { searchUsers } from "../services/authApi";
import Sidebar from "../components/chat/Sidebar";

export default function Chat({ currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");

  const selectedUserRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ===================== FIX STALE selectedUser ===================== */
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  /* ===================== WS ===================== */
  useEffect(() => {
    if (!currentUser) return;

    connectWebSocket(currentUser.username, (msg) => {
      const currentSelected = selectedUserRef.current;

      setMessages((prev) => {
        const isRelated =
          (msg.sender === currentUser &&
            msg.receiver === currentSelected?.username) ||
          (msg.sender === currentSelected?.username &&
            msg.receiver === currentUser);

        if (!isRelated) return prev;

        // ✅ chống duplicate
        const isExist = prev.some(
          (m) =>
            m.sender === msg.sender &&
            m.receiver === msg.receiver &&
            m.content === msg.content
        );

        if (isExist) return prev;

        return [...prev, msg];
      });
    });
  }, [currentUser]);

  /* ===================== RESET CHAT ===================== */
  useEffect(() => {
    setMessages([]);
  }, [selectedUser]);

  /* ===================== SEARCH ===================== */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!keyword.trim()) {
        setUsers([]);
        return;
      }

      searchUsers(keyword)
        .then((res) => setUsers(res))
        .catch((err) => console.log(err));
    }, 300);

    return () => clearTimeout(delay);
  }, [keyword]);

  /* ===================== SEND ===================== */
  const handleSend = () => {
    if (!content.trim() || !selectedUser) return;

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

    // ❌ KHÔNG add local để tránh duplicate
    // setMessages((prev) => [...prev, msg]);

    setContent("");
  };

  /* ===================== UI ===================== */
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* MAIN */}
      <div className="flex flex-1">
        {/* ===== LEFT: USER LIST ===== */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 text-lg font-semibold">Chats</div>

          <div className="px-3 pb-2">
            <button className="w-full flex items-center gap-3 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl">
              <Users size={16} />
              <span className="text-sm">Tạo nhóm</span>
            </button>
          </div>

          <div className="px-3 pb-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {users.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">
                Không có kết quả
              </p>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-100 ${
                    selectedUser?.id === u.id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white">
                    {u.username?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">
                      {u.fullname || u.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      Nhắn tin ngay...
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===== RIGHT: CHAT ===== */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chọn user để chat
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b bg-white">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white">
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold">
                    {selectedUser.fullname || selectedUser.username}
                  </p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  if (!msg || !msg.content) return null;

                  const isMe =
                    msg.sender?.toLowerCase() ===
                    currentUser?.toLowerCase();

                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow
                          ${
                            isMe
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200"
                          }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Aa"
                    className="flex-1 bg-transparent outline-none text-sm"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSend()
                    }
                  />

                  <button
                    onClick={handleSend}
                    className="text-indigo-500"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}