import { useState } from "react";
import { X, Plus, UserPlus, Loader2 } from "lucide-react";
import { searchUsers } from "../../services/userApi";
import useCreateGroup from "./useCreateGroup";

export default function CreateGroupModal({ currentUser, onCreated, onClose, onSubmit }) {
    const [groupName, setGroupName] = useState("");
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [members, setMembers] = useState([]);
    const [searching, setSearching] = useState(false);

    const { handleCreate, loading: hookLoading, error: hookError } = useCreateGroup(currentUser, (newGroup) => {
        onCreated?.(newGroup);
        onClose?.();
    });
    const [externalLoading, setExternalLoading] = useState(false);
    const [externalError, setExternalError] = useState("");

    const loading = externalLoading || hookLoading;
    const error = externalError || hookError;

    const handleSearch = async (q) => {
        setKeyword(q);
        if (q.trim().length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const data = await searchUsers(q.trim());
            setSearchResults(
                data.filter(
                    (u) =>
                        u.username !== currentUser?.username &&
                        !members.find((m) => m.username === u.username)
                )
            );
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const addMember = (user) => {
        setMembers((prev) => [...prev, user]);
        setSearchResults([]);
        setKeyword("");
    };

    const removeMember = (username) => {
        setMembers((prev) => prev.filter((m) => m.username !== username));
    };

    const handleSubmit = async () => {
        if (onSubmit) {
            // Dùng logic từ cha (AdminManagement)
            setExternalLoading(true);
            setExternalError("");
            try {
                await onSubmit(groupName, members.map((m) => m.username));
                onClose?.();
            } catch (err) {
                setExternalError(err?.message || "Không tạo được nhóm");
            } finally {
                setExternalLoading(false);
            }
        } else {
            // Fallback: dùng hook (cho màn hình chat)
            handleCreate(groupName, members.map((m) => m.username));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h2 className="font-semibold text-gray-800">Tạo nhóm mới</h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Group name */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Tên nhóm</label>
                        <input
                            className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition placeholder:text-gray-400"
                            placeholder="Nhập tên nhóm..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    {/* Search member */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Thêm thành viên</label>
                        <div className="relative">
                            <input
                                className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition placeholder:text-gray-400"
                                placeholder="Tìm người dùng..."
                                value={keyword}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searching && (
                                <Loader2 size={14} className="absolute right-3 top-3 text-gray-400 animate-spin" />
                            )}

                            {/* Dropdown kết quả */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-10 overflow-hidden">
                                    {searchResults.map((u) => (
                                        <button
                                            key={u.username}
                                            onClick={() => addMember(u)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium shrink-0">
                                                {u.username?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{u.username}</p>
                                                {u.fullname && <p className="text-xs text-gray-400">{u.fullname}</p>}
                                            </div>
                                            <Plus size={14} className="ml-auto text-indigo-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Members đã chọn */}
                    {members.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                Thành viên ({members.length})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {members.map((m) => (
                                    <div
                                        key={m.username}
                                        className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full"
                                    >
                                        <span>{m.username}</span>
                                        <button
                                            onClick={() => removeMember(m.username)}
                                            className="hover:text-red-500 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !groupName.trim()}
                        className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                        Tạo nhóm
                    </button>
                </div>
            </div>
        </div>
    );
}