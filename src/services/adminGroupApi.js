import axios from "axios";

const GROUP_API = "http://localhost:8080/api/rooms";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  return { Authorization: `Bearer ${token}` };
};

export const getAllGroups = async () => {
  const res = await axios.get(GROUP_API, { headers: getAuthHeaders() });
  return res.data;
};

export const createGroup = async (payload) => {
  const res = await axios.post(GROUP_API, payload, { headers: getAuthHeaders() });
  return res.data;
};

export const updateGroup = async (groupId, payload) => {
  const res = await axios.put(`${GROUP_API}/${groupId}`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getGroupMembers = async (groupId) => {
  const res = await axios.get(`${GROUP_API}/${groupId}/members`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const addGroupMember = async (groupId, payload) => {
  const res = await axios.post(`${GROUP_API}/${groupId}/members`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const removeGroupMember = async (groupId, username) => {
  const res = await axios.delete(`${GROUP_API}/${groupId}/members/${username}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
