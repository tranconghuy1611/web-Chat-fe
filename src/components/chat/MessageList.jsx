export default function MessageList({ messages, currentUser }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
      {messages.map((msg, i) => {
        if (!msg || !msg.content) return null; // ✅ bỏ message lỗi

        const isMe =
          msg.sender?.toLowerCase() === currentUser?.toLowerCase();

        return (
          <div
            key={i}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-sm
                ${isMe
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-black"
                }`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}