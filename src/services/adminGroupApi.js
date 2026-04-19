import axiosClient from "./axiosClient";

// =====================
// GET ALL GROUPS
// =====================
export const getAllGroups = async () => {
    const res = await axiosClient.get("/rooms");
    return res.data;
};

// =====================
// CREATE GROUP
// =====================
export const createGroup = async (payload) => {
    const res = await axiosClient.post("/rooms", payload);
    return res.data;
};

// =====================
// UPDATE GROUP
// =====================
export const updateGroup = async (groupId, payload) => {
    const res = await axiosClient.put(`/rooms/${groupId}`, payload);
    return res.data;
};

// =====================
// GET MEMBERS
// =====================
export const getGroupMembers = async (groupId) => {
    const res = await axiosClient.get(`/rooms/${groupId}/members`);
    return res.data;
};

// =====================
// ADD MEMBER
// =====================
export const addGroupMember = async (groupId, payload) => {
    const res = await axiosClient.post(`/rooms/${groupId}/members`, payload);
    return res.data;
};

// =====================
// REMOVE MEMBER
// =====================
export const removeGroupMember = async (groupId, username) => {
    const res = await axiosClient.delete(`/rooms/${groupId}/members/${username}`);
    return res.data;
};