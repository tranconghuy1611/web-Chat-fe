import axiosClient from "./axiosClient";

// =====================
// LOGIN
// =====================
export const login = async (username, password) => {
    const res = await axiosClient.post("/users/login", {
        username,
        password,
    });
    return res.data;
};

// =====================
// REGISTER
// =====================
export const register = async (username, password, fullname, sdt) => {
    const res = await axiosClient.post("/users/register", {
        username,
        password,
        fullname,
        sdt,
    });
    return res.data;
};