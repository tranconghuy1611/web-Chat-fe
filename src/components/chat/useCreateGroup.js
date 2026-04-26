import { useState } from "react";
import { createGroup, addGroupMember    } from "../../services/adminGroupApi";

export default function useCreateGroup(currentUser, onCreated) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreate = async (groupName, memberUsernames) => {
        if (!groupName.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const allMembers = [
                currentUser.username,
                ...memberUsernames.filter((u) => u !== currentUser.username),
            ];

            // ✅ Chỉ cần createGroup, backend tự add member từ danh sách users
            const newGroup = await createGroup({
                roomName: groupName.trim(),
                users: allMembers,
            });

            onCreated?.(newGroup);
        } catch (err) {
            setError("Tạo nhóm thất bại");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { handleCreate, loading, error };
}