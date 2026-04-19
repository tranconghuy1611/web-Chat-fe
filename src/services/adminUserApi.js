import axiosClient from "./axiosClient";

// GET ALL USERS
export const getAllUsers = async () => {
  const res = await axiosClient.get("/users"); // admin API
  return res.data;
};

// UPDATE ROLE
export const updateUserRole = async (id, role) => {
  const res = await axiosClient.put(`/users/${id}/role`, null, {
    params: { role },
  });
  return res.data;
};

