import Avatar from "../common/Avatar";

export default function ChatHeader({ user }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <Avatar name={user?.username || "Huy"} />
        <div>
          <p className="font-semibold text-gray-800">{user?.fullname || user?.username || "Huy"}</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Online
          </p>
        </div>
      </div>
    </div>
  );
}