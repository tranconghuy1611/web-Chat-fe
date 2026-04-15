import axios from "axios";

const API_BASE = "http://localhost:8080/api/users";   // ← Đổi thành /api/users

// =====================
// LOGIN
// =====================
export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE}/login`, {
    username,
    password,
  });
  return res.data;
};

// =====================
// REGISTER
// =====================
export const register = async (username, password, fullname, sdt) => {
  const res = await axios.post(`${API_BASE}/register`, {
    username,
    password,
    fullname,
    sdt,          // ← Thêm sdt
  });
  return res.data;
};