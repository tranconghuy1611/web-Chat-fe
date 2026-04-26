import axios from "axios";

const axiosClient = axios.create({
    // baseURL: "http://192.168.1.12:8080/api",
        baseURL: "http://129.212.239.252:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔥 Gắn token tự động
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosClient;