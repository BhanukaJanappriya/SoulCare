import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

// --- Auth-Specific Instance ---
// Used for /api/auth/ endpoints (login, user details, etc.)
// We use a named export here.
export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}auth/`,
});

// --- General-Purpose Instance ---
// Used for all other endpoints (appointments, prescriptions, etc.)
// We will also use a named export for this one.
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add the interceptor to the general instance to handle auth tokens automatically
const addAuthToken = (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

const handleRequestError = (error) => {
    return Promise.reject(error);
};

// --- THIS IS THE FIX ---
// Apply the interceptor to BOTH instances

// 1. Apply to the general 'api' instance
api.interceptors.request.use(addAuthToken, handleRequestError);

// 2. Apply to the 'authApi' instance as well
axiosInstance.interceptors.request.use(addAuthToken, handleRequestError);