// src/services/api.js
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Request interceptor — adds token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Sending token:", token ? "YES" : "NO");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios handle FormData boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Auth error → clearing token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("authError"));
    }
    return Promise.reject(error);
  }
);

// Auth methods
export const authAPI = {
  login: (email, password) =>
    api.post("/users/login", { email, password }).then((r) => r.data),
  register: (data) =>
    api.post("/users/register", data).then((r) => r.data),
  logout: () => api.post("/users/logout").then((r) => r.data),
  getProfile: () => api.get("/users/profile").then((r) => r.data),
  getUsers: () => api.get("/users").then((r) => r.data),
};

// Export api directly
export default api;