// src/api.ts

import axios from 'axios';
import {
    JournalEntry,
    JournalFormData,
    Tag,
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


// =================================================================
// --- JOURNAL API FUNCTIONS ---
// =================================================================

// Fetch all journal entries with optional filtering
export const getJournalEntriesAPI = async (params?: { q?: string; tags?: string }): Promise<JournalEntry[]> => {
  try {
    const response = await api.get<JournalEntry[]>('journal/entries/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

// Create a new journal entry
export const createJournalEntryAPI = async (data: JournalFormData): Promise<JournalEntry> => {
    try {
        const response = await api.post<JournalEntry>('journal/entries/', data);
        return response.data;
    } catch (error) {
        console.error("Error creating journal entry:", error);
        throw error;
    }
};

// Update an existing journal entry
export const updateJournalEntryAPI = async (id: number, data: JournalFormData): Promise<JournalEntry> => {
    try {
        const response = await api.patch<JournalEntry>(`journal/entries/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating journal entry ${id}:`, error);
        throw error;
    }
};

// Delete a journal entry
export const deleteJournalEntryAPI = async (id: number): Promise<void> => {
    try {
        await api.delete(`journal/entries/${id}/`);
    } catch (error) {
        console.error(`Error deleting journal entry ${id}:`, error);
        throw error;
    }
};

// Fetch all unique tags used by the user
export const getJournalTagsAPI = async (): Promise<Tag[]> => {
    try {
        const response = await api.get<Tag[]>('journal/tags/');
        return response.data;
    } catch (error) {
        console.error("Error fetching journal tags:", error);
        throw error;
    }
};

// Function to trigger journal download
export const downloadJournalsAPI = async (): Promise<void> => {
    try {
        const response = await api.get('journal/entries/download/', {
            responseType: 'blob', // Important to handle the file download
        });

        // ✅ FIX: Type assertion for blob data
        const blobData = response.data as Blob;

        const url = window.URL.createObjectURL(new Blob([blobData]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'soulcare_journal.md');
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up
        window.URL.revokeObjectURL(url); // ✅ Also add cleanup for the URL
    } catch (error) {
        console.error("Error downloading journals:", error);
        throw error;
    }
};
