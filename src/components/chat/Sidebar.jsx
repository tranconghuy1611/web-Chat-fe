import { MessageCircle, Users, Settings, HelpCircle, LogOut, Shield, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ active = "chat", setActive }) {
    const navigate = useNavigate();
    const role = (localStorage.getItem("role") || "").toLowerCase();
    const isAdmin = role === "admin";
    const username = localStorage.getItem("username") || "User";
    const [mobileOpen, setMobileOpen] = useState(false);

    const menu = [
        { key: "chat", label: "Chat", icon: MessageCircle },
        { key: "friends", label: "Friends", icon: Users },
        { key: "settings", label: "Settings", icon: Settings },
    ];

    if (isAdmin) {
        menu.push({ key: "admin", label: "Admin", icon: Shield });
    }

    const handleMenuClick = (key) => {
        setActive?.(key);
        if (key === "chat") navigate("/chat");
        if (key === "admin") navigate("/admin");
        setMobileOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <>
            {/* ===== MOBILE TOGGLE BUTTON ===== */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 bg-white rounded-xl shadow flex items-center justify-center text-gray-600"
            >
                <Menu size={18} />
            </button>

            {/* ===== OVERLAY (mobile) ===== */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ===== SIDEBAR ===== */}
            <div className={`
                h-screen bg-[#f5f6f8] p-4 flex flex-col justify-between border-r rounded-r-2xl
                fixed md:relative z-50 transition-transform duration-300
                w-64
                ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* Top */}
                <div>
                    {/* Logo + close button mobile */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                            A
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">Messages</p>
                            <p className="text-xs text-gray-400">Chat Dialogue</p>
                        </div>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-400"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Menu */}
                    <div className="flex flex-col gap-1">
                        {menu.map((item) => {
                            const Icon = item.icon;
                            const isActive = active === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => handleMenuClick(item.key)}
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
                <div className="flex flex-col gap-1">
                    <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-200 rounded-xl transition-all">
                        <HelpCircle size={18} />
                        Help
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                    <div className="border-t my-2" />

                    {/* User Info */}
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-700 truncate">{username}</p>
                            <p className="text-xs text-gray-400 capitalize">{role || "user"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}