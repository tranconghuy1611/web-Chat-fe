import axios from "axios";

const USER_API = "http://localhost:8080/api/users";

// =====================
// GET ALL USERS
// =====================
export const getAllUsers = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${USER_API}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

// =====================
// SEARCH USERS
// =====================
export const searchUsers = async (query) => {
    const token = localStorage.getItem("token");
    console.log("🔍 searchUsers called with query:", token);
    if (!token) {
        console.error("❌ Không tìm thấy token trong localStorage");
        throw new Error("No token");
    }

    console.log(`📤 Gửi request search: keyword=${query}, token=${token.substring(0, 20)}...`);

    const res = await axios.get(`${USER_API}/search`, {
        params: { keyword: query },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};
export const getMe = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No token");
    }

    const res = await axios.get("http://localhost:8080/api/users/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};