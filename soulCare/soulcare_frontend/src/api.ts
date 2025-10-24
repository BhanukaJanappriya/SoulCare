// src/api.ts

import axios from 'axios';
import {
    PatientOption,
    PrescriptionInput,
    PrescriptionData,
    PatientDetailData
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

export const getPatientDetailsAPI = async (patientId: string | number): Promise<PatientDetailData> => {
    try {
        // Use axiosInstance because the URL is under /auth/
        const response = await axiosInstance.get<PatientDetailData>(`patients/${patientId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching patient details for ID ${patientId}:`, error);
        throw error; // Re-throw for react-query
    }
};

export const createFormData = <T extends Record<string, unknown>>(data: T): FormData => {
    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        if (value !== undefined && value !== null) {
            if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                // handle object flattening if needed
            } else {
                formData.append(key, String(value));
            }
        }
    }
    return formData;
};
