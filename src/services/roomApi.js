import axios from "axios";

const ROOM_API = "http://localhost:8080/api/rooms";

// =====================
// CREATE ROOM
// =====================
export const createRoom = async (roomData) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No token");
    }

    const res = await axios.post(`${ROOM_API}`, roomData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

// =====================
// GET MY ROOMS (/me)
// =====================
export const getMyRooms = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No token");
    }

    const res = await axios.get(`${ROOM_API}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

// =====================
// GET ROOMS BY USER
// =====================
export const getRoomsByUser = async (username) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No token");
    }

    const res = await axios.get(`${ROOM_API}/${username}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
// =====================
// GET ROOM MESSAGES
// =====================
export const getRoomMessages = async (roomId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No token");
    }

    const res = await axios.get(
        `http://localhost:8080/api/messages/rooms/${roomId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data;
};