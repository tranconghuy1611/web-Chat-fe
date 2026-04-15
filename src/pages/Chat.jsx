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
import { getMe } from "../services/userApi";
import { getMyRooms, getRoomMessages } from "../services/roomApi";

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

  const getMessageKey = (m) =>
    m.id ||
    `${m.sender}|${m.receiver || ""}|${m.roomId || ""}|${m.content}|${
      m.createdAt || ""
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

    const unsubscribe = connectWebSocket((msg) => {
      setMessages((prev) => appendUniqueMessage(prev, msg));

      // Dang xem dung phong: khong tang unread
      if (
        msg.roomId &&
        selectedRoomRef.current?.roomId === msg.roomId
      ) {
        return;
      }

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
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/users/search",
          {
            params: { keyword: q },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(res.data);
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

  // ================= HANDLE SELECT =================
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const matchedPrivateRoom = rooms.find((room) =>
      roomContainsUsername(room, user.username)
    );
    setSelectedRoom(matchedPrivateRoom || null);

    setUnreadSenders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(user.username);
      return newSet;
    });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedUser(null);
  };

  // ================= SEND MESSAGE =================
  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || !currentUser) return;

    // PRIVATE
    if (selectedUser) {
      if (!selectedRoom?.roomId) {
        console.warn("Private room not found for selected user");
        return;
      }
      const success = sendPrivateMessage({
        receiver: selectedUser.username,
        roomId: selectedRoom.roomId,
        content: trimmed,
      });

      if (success) {
        setMessages((prev) =>
          appendUniqueMessage(prev, {
            sender: currentUser.username,
            receiver: selectedUser.username,
            roomId: selectedRoom.roomId,
            content: trimmed,
            createdAt: new Date().toISOString(),
          })
        );
      }
    }

    // ROOM
    else if (selectedRoom) {
      const success = sendRoomMessage(selectedRoom.roomId, trimmed);
      if (success) {
        setMessages((prev) =>
          appendUniqueMessage(prev, {
          sender: currentUser.username,
          roomId: selectedRoom.roomId,
          content: trimmed,
          createdAt: new Date().toISOString(),
          })
        );
      }
    }

    setContent("");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1">
        {/* LEFT PANEL */}
        <div className="w-80 border-r bg-white flex flex-col">
              <div className="p-4 font-bold border-b">
            {keyword.trim().length < 2 ? "Phòng của bạn" : "Users"}
          </div>

          <input
            className="mx-3 my-3 px-4 py-2 bg-gray-100 rounded-lg"
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <div className="flex-1 overflow-auto">
            {keyword.trim().length < 2
              ? rooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => handleSelectRoom(room)}
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${
                      selectedRoom?.roomId === room.roomId
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="font-medium">
                      {room.roomName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {room.roomId}
                    </div>
                  </div>
                ))
              : users.map((u) => (
                  <div
                    key={u.username}
                    onClick={() => handleSelectUser(u)}
                    className={`p-4 cursor-pointer hover:bg-gray-100 flex justify-between ${
                      selectedUser?.username === u.username
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div>
                      <div>{u.username}</div>
                      <div className="text-sm text-gray-500">
                        {u.fullname}
                      </div>
                    </div>
                    {unreadSenders.has(u.username) && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col">
          {!selectedUser && !selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Chọn user hoặc room
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="p-4 border-b bg-white">
                <div className="font-semibold">
                  {selectedUser
                    ? selectedUser.username
                    : selectedRoom.roomName}
                </div>
                {!selectedUser && selectedRoom && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Chat nhóm · {selectedRoom.roomId}
                  </div>
                )}
                {selectedUser && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Chat riêng
                  </div>
                )}
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-4 overflow-auto space-y-3 bg-gray-50">
                {messages
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
                  .map((msg) => {
                    const isMe =
                      msg.sender === currentUser?.username;

                    return (
                      <div
                        key={getMessageKey(msg)}
                        className={`flex ${
                          isMe
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-xl ${
                            isMe
                              ? "bg-indigo-600 text-white"
                              : "bg-white border"
                          }`}
                        >
                          <div>{msg.content}</div>

                          {selectedRoom && !isMe && (
                            <div className="text-xs text-gray-400 mt-1">
                              {msg.sender}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* INPUT */}
              <div className="p-4 border-t bg-white flex gap-2">
                <input
                  className="flex-1 border rounded-xl px-4 py-2"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSend()
                  }
                />
                <button
                  onClick={handleSend}
                  className="bg-indigo-600 text-white px-6 rounded-xl"
                >
                  Gửi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}