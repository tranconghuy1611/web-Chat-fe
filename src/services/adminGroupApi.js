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
// roomApi.js - tạo private
export const createPrivateRoom = async (targetUsername) => {
    const res = await axiosClient.post("/rooms/private", { targetUsername });
    return res.data;
};

// groupApi.js - tạo nhóm
export const createGroup = async (payload) => {
    const res = await axiosClient.post("/rooms/group", payload);
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