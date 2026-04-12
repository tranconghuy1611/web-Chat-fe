import Avatar from "../common/Avatar";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { searchUsers } from "../../services/authApi";

export default function ConversationList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim() === "") {
        setUsers([]);
        return;
      }

      searchUsers(keyword)
        .then(res => setUsers(res))
        .catch(err => console.log(err));
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      
      {/* Header */}
      <div className="p-4 text-lg font-semibold text-gray-800">
        Chats
      </div>

      {/* Create Group */}
      <div className="px-3 pb-2">
        <button className="w-full flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-xl transition">
          <Users size={16} />
          <span className="text-sm font-medium">Tạo nhóm</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search..."
          className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:bg-gray-200 transition text-black"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2">
        {users.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-4">
            Không có kết quả
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelectUser(u)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-gray-100"
            >
              <Avatar name={u.username} />

              <div className="flex-1">
                <p className="font-medium text-gray-800">
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
  );
}