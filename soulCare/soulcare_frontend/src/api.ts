// src/api.ts

import axios from 'axios';
import {
    PatientOption,
    PrescriptionInput,
    PrescriptionData
} from '@/types';

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

// 2. Apply to the 'authApi' instance as well
axiosInstance.interceptors.request.use(addAuthToken, handleRequestError);

export const getDoctorPatients = async (): Promise<PatientOption[]> => {
  try {
    // Correct URL relative to axiosInstance baseURL
    const response = await axiosInstance.get<PatientOption[]>('doctors/my-patients/');
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    throw error; // Re-throw for react-query to handle
  }
};

export const createPrescriptionAPI = async (prescriptionData: PrescriptionInput): Promise<PrescriptionData> => {
  try {
    // Correct URL relative to api baseURL
    const response = await api.post<PrescriptionData>('prescriptions/', prescriptionData);
    return response.data;
  } catch (error) {
    console.error("Error creating prescription:", error);
    throw error; // Re-throw for react-query
  }
};

// Fetch prescriptions (for patient or doctor) (uses api)
export const getPrescriptionsAPI = async (): Promise<PrescriptionData[]> => {
  try {
    // Correct URL relative to api baseURL
    const response = await api.get<PrescriptionData[]>('prescriptions/');
    return response.data;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw error; // Re-throw for react-query
  }
};
