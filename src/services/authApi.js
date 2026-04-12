import axios from "axios";

const API = "http://localhost:8080/api/users";

export const login = async (username, password) => {
  const res = await axios.post(`${API}/login`, {
    username,
    password,
  });
  return res.data;
};

export const register = async (username, password, fullname, sdt) => {
  const res = await axios.post(`${API}/register`, {
    username,
    password,
    fullname,
    sdt,
  });
  return res.data;
};

export const getAllUsers = async () => {
  const res = await axios.get(`${API}`);
  return res.data; 
};
export const searchUsers = async (query) => {
  const res = await axios.get(`${API}/search`, {
     params: { keyword: query }
  });
  return res.data; 
};