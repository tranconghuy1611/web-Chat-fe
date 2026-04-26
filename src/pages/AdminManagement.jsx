import { useCallback, useEffect, useMemo, useState } from "react";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import GroupFormModal from "../components/admin/GroupFormModal";
import MemberFormModal from "../components/admin/MemberFormModal";
import {
  addGroupMember,
  createGroup,
  getAllGroups,
  getGroupMembers,
  removeGroupMember,
  updateGroup,
} from "../services/adminGroupApi";
import UsersPage from "../components/admin/UsersPage";
import CreateGroupModal from "../components/chat/CreateGroupModal";
function StatusPill({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isAdmin ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"
        }`}
    >
      {isAdmin ? "Quản trị" : "Thành viên"}
    </span>
  );
}

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState("create");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId) || null,
    [groups, selectedId]
  );

  const normalizeGroup = (group) => ({
    id: group.roomId || group.id || "",
    name: group.roomName || group.name || "Untitled group",
    desc: group.description || "",
  });

  const loadGroups = useCallback(async () => {
    try {
      setError("");
      const data = await getAllGroups();
      const normalized = (Array.isArray(data) ? data : []).map(normalizeGroup);
      setGroups(normalized);
      if (normalized.length > 0 && !normalized.some((g) => g.id === selectedId)) {
        setSelectedId(normalized[0].id);
      }
      if (normalized.length === 0) {
        setSelectedId("");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được danh sách nhóm");
    }
  }, [selectedId]);

  const loadMembers = useCallback(async (roomId) => {
    if (!roomId) return;
    try {
      setLoadingMembers(true);
      const data = await getGroupMembers(roomId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được thành viên nhóm");
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadMembers(selectedId);
  }, [selectedId, loadMembers]);

  const handleCreateOrUpdateGroup = async ({ name }) => {
    try {
      setSaving(true);
      if (groupModalMode === "edit" && selectedId) {
        await updateGroup(selectedId, { roomName: name });
      } else {
        const roomId = `room-${Date.now()}`;
        await createGroup({ roomId, roomName: name, users: [] });
      }
      setShowGroupModal(false);
      await loadGroups();
    } catch (err) {
      setError(err?.response?.data?.message || "Không lưu được thông tin nhóm");
    } finally {
      setSaving(false);
    }
  };
  const handleCreateGroupWithMembers = async (groupName, usernames) => {
    try {
      setSaving(true);

      const roomId = `room-${Date.now()}`;

      await createGroup({
        roomId,
        roomName: groupName,
        users: usernames, // 🔥 danh sách member
      });

      setShowCreateModal(false);
      await loadGroups();

    } catch (err) {
      setError(err?.response?.data?.message || "Không tạo được nhóm");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async ({ username }) => {
    if (!selectedId) return;
    try {
      setSaving(true);
      await addGroupMember(selectedId, { usernames: [username] });
      setShowMemberModal(false);
      await loadMembers(selectedId);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thêm được thành viên");
    } finally {
      setSaving(false);
    }
  };

  const kickMember = async (member) => {
    if (!selectedId) return;
    try {
      setSaving(true);
      await removeGroupMember(selectedId, member.username);
      await loadMembers(selectedId);
    } catch (err) {
      setError(err?.response?.data?.message || "Không xóa được thành viên");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="w-56 flex-shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-semibold text-slate-700">Nhóm</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo nhóm
          </button>
        </div>
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedId(g.id)}
            className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all ${g.id === selectedId
              ? "border-blue-200 bg-blue-50"
              : "border-slate-100 bg-white hover:border-slate-200"
              }`}
          >
            <div className="text-[13px] font-semibold text-slate-700">{g.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Nhóm chat</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-slate-800">{selected.name}</div>
              <div className="text-[12px] text-slate-400 mt-0.5">
                {selected.desc || "Quản lý thành viên trong nhóm"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setGroupModalMode("edit");
                  setShowGroupModal(true);
                }}
                className="text-[13px] px-3.5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Sửa nhóm
              </button>
              <button
                onClick={() => setShowMemberModal(true)}
                className="bg-blue-600 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm thành viên
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden flex-1">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5 font-medium">Thành viên</th>
                  <th className="text-left px-5 py-2.5 font-medium">Username</th>
                  <th className="text-left px-5 py-2.5 font-medium">Vai trò</th>
                  <th className="text-left px-5 py-2.5 font-medium">Ngày tham gia</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {loadingMembers ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 text-[13px]">
                      Đang tải thành viên...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 text-[13px]">
                      Chưa có thành viên nào
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr
                      key={m.id || m.username}
                      className="border-t border-slate-50 hover:bg-slate-50/60 group"
                    >
                      <td className="px-5 py-3 text-slate-700">{m.fullname || m.username}</td>
                      <td className="px-5 py-3 text-slate-400">@{m.username}</td>
                      <td className="px-5 py-3">
                        <StatusPill role={m.role} />
                      </td>
                      <td className="px-5 py-3 text-slate-400">--</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => kickMember(m)}
                          className="text-[11px] font-medium px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-100 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {saving && (
        <div className="fixed bottom-4 left-4 rounded-lg bg-indigo-100 border border-indigo-200 px-4 py-3 text-sm text-indigo-700">
          Đang lưu...
        </div>
      )}


      <MemberFormModal
        open={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSubmit={handleAddMember}
        loading={saving}
      />
      {showCreateModal && (
        <CreateGroupModal
          currentUser={{ username: "admin" }}
          onSubmit={handleCreateGroupWithMembers}   // ← thêm dòng này
          onCreated={() => loadGroups()}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default function AdminManagement() {
  const [activePage, setActivePage] = useState("");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SidebarAdmin active={activePage} onNav={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6">
          <h1 className="text-[15px] font-semibold text-slate-800">
            {activePage === "groups" ? "Quản lý nhóm" : "Quản lý người dùng"}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {activePage === "groups" && <GroupsPage />}
          {activePage === "users" && <UsersPage />}
        </main>
      </div>
    </div>
  );
}
