// src/api.ts

import axios from 'axios';

// Define the base URL for the general API (e.g., /api/blogs, /api/appointments)
const API_BASE_URL = 'http://localhost:8000/api/';

// --- Auth-Specific Instance (Used by AuthContext) ---
export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}auth/`, // Points to 'http://localhost:8000/api/auth/'
});

// --- General-Purpose Instance (Used for all CUD operations - Blog, Appts, etc.) ---
export const api = axios.create({
  baseURL: API_BASE_URL, // Points to 'http://localhost:8000/api/'
});

// --- Request Interceptor Logic (Attaches JWT Token) ---
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

// Apply the interceptor to BOTH instances to ensure all authenticated calls work
api.interceptors.request.use(addAuthToken, handleRequestError);
axiosInstance.interceptors.request.use(addAuthToken, handleRequestError);
