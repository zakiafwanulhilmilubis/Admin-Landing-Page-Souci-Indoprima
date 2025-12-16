import axios from "axios";
import Cookies from "js-cookie";

// Helper function untuk mendapatkan base URL
// SELALU gunakan localhost di development mode
export const getBaseURL = () => {
  // Force localhost di development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  
  // Production: gunakan env variable jika ada
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api$/, ""); // Remove trailing /api
  }
  
  return "http://localhost:3000";
};

// Get API base URL (dengan /api suffix)
export const getAPIBaseURL = () => {
  return `${getBaseURL()}/api`;
};

const api = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log untuk debugging di development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  console.log("🔗 API Base URL:", api.defaults.baseURL);
  console.log("✅ Development mode: Using localhost:3000");
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error untuk debugging
    if (process.env.NODE_ENV === "development") {
      const fullURL = error?.config?.baseURL && error?.config?.url 
        ? `${error.config.baseURL}${error.config.url}` 
        : "Unknown";
      console.error("API Error:", {
        message: error?.message || "Unknown error",
        code: error?.code || "UNKNOWN",
        status: error?.response?.status || null,
        url: error?.config?.url || "Unknown",
        baseURL: error?.config?.baseURL || "Unknown",
        fullURL: fullURL,
      });
    }

    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove("admin_token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

// News API
export const newsAPI = {
  getAll: (params) => api.get("/news", { params }),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) =>
    api.post("/news", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/news/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/news/${id}`),
};

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Applications API
export const applicationsAPI = {
  getAll: (params) => api.get("/applications", { params }),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}`, { status }),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Contact API
export const contactAPI = {
  getAll: (params) => api.get("/contact", { params }),
  getById: (id) => api.get(`/contact/${id}`),
  markAsRead: (id) => api.patch(`/contact/${id}`, { status: "read" }),
  updateStatus: (id, status) => api.patch(`/contact/${id}`, { status }),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Testimonials API
export const testimonialsAPI = {
  getAll: (params) => api.get("/testimonials", { params }),
  getById: (id) => api.get(`/testimonials/${id}`),
  create: (data) =>
    api.post("/testimonials", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/testimonials/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/testimonials/${id}`),
  updateStatus: (id, status) => api.patch(`/testimonials/${id}`, { status }),
};

// Statistics API
export const statisticsAPI = {
  getDashboard: () => api.get("/statistics/dashboard"),
  getOverview: () => api.get("/statistics/overview"),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
};

export default api;
