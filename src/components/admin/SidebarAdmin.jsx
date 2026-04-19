import { useNavigate } from "react-router-dom";
const NAV_ITEMS = [
  { id: "groups", label: "Quản lý nhóm" },
  { id: "users", label: "Quản lý người dùng" }
];

export default function SidebarAdmin({ active, onNav }) {
   const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa dữ liệu login
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("fullname");
    localStorage.removeItem("role");

    // Chuyển về login
    navigate("/");
  }
  return (
    <aside className="w-60 min-w-[240px] bg-[#0d1b2a] flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 18 18" className="w-4.5 h-4.5" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".45" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".45" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
          </svg>
        </div>
        <div>
          <div className="text-white font-medium text-[15px] leading-tight tracking-tight">
            Nexus Admin
          </div>
          <div className="text-white/35 text-[11px] mt-0.5">Group Management</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-2 mb-1.5">
          Quản lý
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-150 text-left ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              }`}
            >
              <span className="flex-1 text-[13px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-white/[0.07] pt-3">
        <div className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-white text-[13px] font-medium truncate">Admin</div>
            <div className="text-white/35 text-[11px]">Group Manager</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 text-[12px] font-medium px-3 py-2 rounded-lg border border-red-400 text-red-400 hover:bg-red-500 hover:text-white transition"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
