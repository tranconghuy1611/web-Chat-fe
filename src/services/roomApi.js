import axiosClient from "./axiosClient";

// =====================
// CREATE ROOM
// =====================
export const createPrivateRoom = async (targetUsername) => {
    const res = await axiosClient.post("/rooms/private", { targetUsername });
    return res.data;
};

// =====================
// GET MY ROOMS (/me)
// =====================
export const getMyRooms = async () => {
    const res = await axiosClient.get("/rooms/me");
    return res.data;
};

// =====================
// GET ROOMS BY USER
// =====================
export const getRoomsByUser = async (username) => {
    const res = await axiosClient.get(`/rooms/${username}`);
    return res.data;
};

// =====================
// GET ROOM MESSAGES
// =====================
export const getRoomMessages = async (roomId) => {
    const res = await axiosClient.get(`/messages/rooms/${roomId}`);
    return res.data;
};