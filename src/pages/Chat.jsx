import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/chat/Sidebar";
import {
  connectWebSocket,
  disconnectWebSocket,
  sendPrivateMessage,
  sendRoomMessage,
  subscribeRoom,
  unsubscribeAll,
} from "../services/ws";
import { getMe, searchUsers } from "../services/userApi";
import { getMyRooms, getRoomMessages, createRoom } from "../services/roomApi";
import { formatTime, formatDateLabel } from "../until/time.js";

export default function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");
  const [unreadSenders, setUnreadSenders] = useState(new Set());

  const selectedUserRef = useRef(null);
  const selectedRoomRef = useRef(null);
  const currentUserRef = useRef(null);
  let lastDate = null;


  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const getMessageKey = (m) =>
    m.id ||
    `${m.sender}|${m.receiver || ""}|${m.roomId || ""}|${m.content}|${m.createdAt || ""
    }`;

  const appendUniqueMessage = (prev, msg) => {
    const key = getMessageKey(msg);
    if (prev.some((m) => getMessageKey(m) === key)) return prev;
    return [...prev, msg];
  };

  const roomContainsUsername = (room, username) => {
    if (!room || !username) return false;
    const names = [
      ...(room.usernames || []),
      ...(room.members || []).map((m) => m?.username || m),
      ...(room.participants || []).map((p) => p?.username || p),
    ]
      .filter(Boolean)
      .map((n) => String(n).toLowerCase());

    if (names.length > 0) return names.includes(username.toLowerCase());

    return String(room.roomName || "")
      .toLowerCase()
      .includes(username.toLowerCase());
  };

  // ================= LOAD USER =================
  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await getMe();
        setCurrentUser(me);
      } catch (err) {
        console.error("Get me failed", err);
      }
    };
    loadMe();
  }, []);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // ================= WEBSOCKET =================
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = connectWebSocket(async (msg) => {
      setMessages((prev) => appendUniqueMessage(prev, msg));

      // Dang xem dung phong: khong tang unread
      if (msg.roomId && msg.receiver && !selectedRoomRef.current?.roomId) {
        const data = await getMyRooms();
        setRooms(data);

        const peer =
          msg.sender === currentUserRef.current?.username
            ? msg.receiver
            : msg.sender;

        if (peer === selectedUserRef.current?.username) {
          const newRoom = data.find((r) => r.roomId === msg.roomId);
          if (newRoom) {
            setSelectedRoom(newRoom);           // ✅ gắn room
            subscribeRoom(newRoom.roomId);      // ✅ subscribe realtime luôn
            selectedRoomRef.current = newRoom;  // ✅ cập nhật ref ngay, không chờ re-render
          }
        }
      }
      // if (
      //   msg.roomId &&
      //   selectedRoomRef.current?.roomId === msg.roomId
      // ) {
      //   return;
      // }

      // Tin nhom (receiver null): khong gan badge len danh sach user
      if (!msg.receiver) return;

      const me = currentUserRef.current?.username;
      const peer =
        msg.sender === me ? msg.receiver : msg.sender;
      if (peer && peer !== selectedUserRef.current?.username) {
        setUnreadSenders((prev) => new Set([...prev, peer]));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAll();
      // disconnectWebSocket();
    };
  }, [currentUser]);

  // ================= SEARCH USER =================
  useEffect(() => {
    const q = keyword.trim();

    if (q.length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(q); // ✅ bỏ token
        setUsers(data); // ✅ không .data nữa
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword]);

  // ================= LOAD ROOMS =================
  useEffect(() => {
    if (!currentUser) return;

    const loadRooms = async () => {
      try {
        const data = await getMyRooms();
        setRooms(data);
      } catch (err) {
        console.error("Load rooms failed", err);
      }
    };

    loadRooms();
  }, [currentUser]);

  // ================= LOAD ROOM MESSAGES =================
  useEffect(() => {
    if (!selectedRoom) return;

    const loadRoomMessages = async () => {
      try {
        const data = await getRoomMessages(selectedRoom.roomId);
        setMessages(data);
      } catch (err) {
        console.error("Load room messages failed", err);
      }
    };

    loadRoomMessages();
  }, [selectedRoom]);

  // Subscribe room realtime khi đổi conversation
  useEffect(() => {
    unsubscribeAll();
    if (!selectedRoom?.roomId) return;
    subscribeRoom(selectedRoom.roomId);

    return () => {
      unsubscribeAll();
    };
  }, [selectedRoom?.roomId]);
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedUser(null);

    // ✅ fix realtime ngay lập tức
    selectedRoomRef.current = room;
    subscribeRoom(room.roomId);
  };
  // ================= HANDLE SELECT =================
  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    let matchedPrivateRoom = rooms.find((room) =>
      roomContainsUsername(room, user.username)
    );

    // ❌ Nếu chưa có room → tạo
    if (!matchedPrivateRoom) {
      try {
        const newRoom = await createRoom({
          roomName: `${currentUser.username}-${user.username}`,
          users: [currentUser.username, user.username],
        });

        matchedPrivateRoom = {
          roomId: newRoom.roomId,
          roomName: newRoom.roomName,
          usernames: [currentUser.username, user.username],
        };

        setRooms((prev) => [...prev, matchedPrivateRoom]);
      } catch (err) {
        console.error("Create room failed", err);
        return;
      }
    }

    // ✅ set room
    setSelectedRoom(matchedPrivateRoom);

    // ✅ tránh delay React
    selectedRoomRef.current = matchedPrivateRoom;

    // ✅ realtime ngay
    subscribeRoom(matchedPrivateRoom.roomId);

    // clear unread
    setUnreadSenders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(user.username);
      return newSet;
    });
  };

  // ================= SEND MESSAGE =================
  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || !currentUser) return;
    if (selectedUser && !selectedRoom) {
      console.warn("Room chưa sẵn sàng");
      return;
    }
    // PRIVATE
    if (selectedUser) {
      sendPrivateMessage({
        receiver: selectedUser.username,
        roomId: selectedRoom?.roomId, // ✅ truyền null nếu chưa có room
        content: trimmed,
      });
    }

    // ROOM
    else if (selectedRoom) {
      sendRoomMessage(selectedRoom.roomId, trimmed);
    }

    setContent("");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-72 border-r bg-white flex flex-col">

          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              {keyword.trim().length < 2 ? "Tin nhắn" : "Người dùng"}
            </h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-gray-400 text-gray-800"
                placeholder="Tìm kiếm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto divide-y divide-gray-50">
            {keyword.trim().length < 2
              ? rooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => handleSelectRoom(room)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRoom?.roomId === room.roomId ? "bg-indigo-50" : ""
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium shrink-0">
                    {room.roomName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{room.roomName}</p>
                    <p className="text-xs text-gray-400 truncate">#{room.roomId}</p>
                  </div>
                </div>
              ))
              : users.map((u) => (
                <div
                  key={u.username}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.username === u.username ? "bg-indigo-50" : ""
                    }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium shrink-0">
                      {u.username?.slice(0, 2).toUpperCase()}
                    </div>
                    {unreadSenders.has(u.username) && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.username}</p>
                    <p className="text-xs text-gray-400 truncate">{u.fullname}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedUser && !selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm">Chọn cuộc trò chuyện để bắt đầu</p>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex items-center gap-3 px-5 py-3 border-b bg-white">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium shrink-0">
                  {(selectedUser ? selectedUser.username : selectedRoom.roomName)?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {selectedUser ? selectedUser.username : selectedRoom.roomName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedUser ? "Chat riêng" : `Chat nhóm · ${selectedRoom.roomId}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8a16 16 0 0 0 6 6l.27-.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-auto px-5 py-4 space-y-3 bg-gray-50">
                {sortedMessages
                  .filter((m) => {
                    if (selectedUser) {
                      return (
                        (m.sender === currentUser?.username &&
                          m.receiver === selectedUser.username) ||
                        (m.sender === selectedUser.username &&
                          m.receiver === currentUser?.username)
                      );
                    }
                    if (selectedRoom) {
                      return m.roomId === selectedRoom.roomId;
                    }
                    return false;
                  })
                  .map((msg, index, arr) => {
                    const isMe = msg.sender === currentUser?.username;

                    // 🧠 check ngày trước đó
                    const currentDate = new Date(msg.createdAt).toDateString();
                    const prevDate =
                      index > 0
                        ? new Date(arr[index - 1].createdAt).toDateString()
                        : null;

                    const showDateDivider = currentDate !== prevDate;

                    return (
                      <div key={getMessageKey(msg)}>
                        {/* ✅ Divider ngày */}
                        {showDateDivider && (
                          <div className="text-center my-3">
                            <span className="text-xs px-3 py-1 bg-gray-200 rounded-full text-gray-600">
                              {formatDateLabel(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* 💬 Message */}
                        <div
                          className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : ""
                            }`}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium shrink-0">
                              {msg.sender?.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div
                            className={`max-w-[65%] px-4 py-2.5 text-sm leading-relaxed ${isMe
                                ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
                                : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                              }`}
                          >
                            {selectedRoom && !isMe && (
                              <p className="text-xs font-medium mb-1 opacity-60">
                                {msg.sender}
                              </p>
                            )}

                            {msg.content}

                            {/* 🕒 giờ */}
                            <p
                              className={`text-[10px] mt-1 ${isMe
                                  ? "text-white/70 text-right"
                                  : "text-gray-400 text-left"
                                }`}
                            >
                              {msg.createdAt && formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* INPUT */}
              <div className="px-4 py-3 border-t bg-white flex items-center gap-2">
                <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" x2="9.01" y1="9" y2="9" />
                    <line x1="15" x2="15.01" y1="9" y2="9" />
                  </svg>
                </button>
                <input
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition text-gray-800 placeholder:text-gray-400"
                  placeholder="Nhập tin nhắn..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center transition shrink-0"
                >
                  <svg className="w-4 h-4 translate-x-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}