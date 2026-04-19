import axiosClient from "./axiosClient";

// =====================
// GET ALL USERS
// =====================
export const getAllUsers = async () => {
    const res = await axiosClient.get("/users");
    return res.data;
};

// =====================
// SEARCH USERS
// =====================
export const searchUsers = async (query) => {
    const res = await axiosClient.get("/users/search", {
        params: { keyword: query },
    });
    return res.data;
};

// =====================
// GET CURRENT USER
// =====================
export const getMe = async () => {
    const res = await axiosClient.get("/users/me");
    return res.data;
};