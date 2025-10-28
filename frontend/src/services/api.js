import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  // Remove default Content-Type to let axios handle it for FormData
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Request token:", token); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, let axios set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Allow axios to set multipart boundary
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json"; // Default for non-FormData
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Authentication error detected:", error.response.data);
      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Dispatch custom event for React to handle navigation
      window.dispatchEvent(new CustomEvent("authError", { detail: error.response.data }));
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/users/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
};

// Generic API methods
export const apiService = {
  get: (url) => api.get(url),
  post: (url, data, config = {}) => api.post(url, data, config), // Allow custom config
  put: (url, data, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;