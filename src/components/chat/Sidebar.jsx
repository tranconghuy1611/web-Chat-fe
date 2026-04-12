import { MessageCircle, Users, Settings, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Sidebar({ active = "chat", setActive }) {
    const menu = [
        { key: "chat", label: "Chat", icon: MessageCircle },
        { key: "friends", label: "Friends", icon: Users },
        { key: "settings", label: "Settings", icon: Settings },
    ];
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };
    return (
        <div className="h-screen w-64 bg-[#f5f6f8] p-4 flex flex-col justify-between rounded-r-2xl border-r">

            {/* Top */}
            <div>
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Messages</p>
                        <p className="text-xs text-gray-400">Chat Dialogue</p>
                    </div>
                </div>

                {/* Menu */}
                <div className="flex flex-col gap-2">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const isActive = active === item.key;

                        return (
                            <button
                                key={item.key}
                                onClick={() => setActive?.(item.key)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                  ${isActive
                                        ? "bg-white shadow text-indigo-600 font-semibold"
                                        : "text-gray-500 hover:bg-gray-200"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col gap-2">
                <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-200 rounded-xl">
                    <HelpCircle size={18} />
                    Help
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-200 rounded-xl"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
}