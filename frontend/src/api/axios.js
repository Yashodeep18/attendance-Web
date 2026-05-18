import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.example || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("attendance_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Fixed the optional chaining operator here:
        if (error.response ?.status === 401) {
            localStorage.removeItem("attendance_token");
        }
        return Promise.reject(error);
    }
);

export default api;