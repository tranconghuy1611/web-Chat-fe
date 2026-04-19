import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../../services/adminUserApi";

function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
      isAdmin
        ? "bg-violet-100 text-violet-700"
        : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-violet-500" : "bg-slate-400"}`} />
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (user, role) => {
    try {
      setUpdatingId(user.id);
      await updateUserRole(user.id, role);
      await loadUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-800">Quản lý người dùng</h1>
        <p className="text-sm text-gray-400 mt-0.5">{users.length} tài khoản</p>
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Họ tên
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span className="text-sm">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-16 text-sm text-gray-400">
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Username + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} />
                      <span className="text-sm font-medium text-gray-700">
                        @{u.username}
                      </span>
                    </div>
                  </td>

                  {/* Fullname */}
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {u.fullname || <span className="text-gray-300 italic">—</span>}
                  </td>

                  {/* Role badge */}
                  <td className="px-5 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === u.id && (
                        <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      )}
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 cursor-pointer hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}