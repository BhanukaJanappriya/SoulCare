import axios from 'axios';
import {
    PatientOption,
    PrescriptionInput,
    PrescriptionData
} from '@/types';

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
