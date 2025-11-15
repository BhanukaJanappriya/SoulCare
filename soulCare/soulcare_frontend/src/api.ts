// src/api.ts

import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import {
  JournalEntry,
  JournalFormData,
  Tag,
  PatientOption,
  PrescriptionInput,
  PrescriptionData,
  PatientDetailData,
  Appointment,
  Conversation,
  ChatMessage,
  Habit,
  HabitInput,
  HabitToggleInput,
  HabitToggleResponse
} from '@/types';

const TOKEN_KEY = 'access';

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api/';

// --- Auth Instance ---
export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}auth/`,
});

// --- General API Instance ---
export const api = axios.create({
  baseURL: API_BASE_URL,
});

const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // Always use the same key to get the token.
  const token = localStorage.getItem(TOKEN_KEY);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};


// This function handles any errors during the request setup.
const handleRequestError = (error: AxiosError) => {
  console.error('Request Interceptor Error:', error);
  return Promise.reject(error);
};


// Apply interceptors
api.interceptors.request.use(addAuthToken, handleRequestError);

const handleResponseError = (error: AxiosError) => {
  // Check if the error is a 401 Unauthorized response.
  if (error.response?.status === 401) {
    console.warn('Authentication token is invalid or expired. Redirecting to login.');
    // Remove the invalid token.
    localStorage.removeItem(TOKEN_KEY);
    // Redirect the user to the login page to re-authenticate.
    // This prevents the app from getting stuck in a broken state.
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }
  return Promise.reject(error);
};

api.interceptors.request.use(
  (config) => {
    // 1. Retrieve the access token from localStorage.
    //    (Your login logic should save the token here).
    const token = localStorage.getItem('access');

    // 2. If the token exists, add it to the request headers.
    if (token) {
      // The 'Authorization' header is the standard way to send tokens.
      // The format 'Bearer <token>' is required by Django REST Framework SimpleJWT.
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Return the modified config object so the request can proceed.
    return config;
  },
  (error) => {
    // Handle any errors that might occur during the setup.
    return Promise.reject(error);
  }
);

export default api;


// --- Response Interceptor (Handle 401) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// =================================================================
// --- DOCTOR / PATIENT API FUNCTIONS ---
// =================================================================

export const getDoctorPatients = async (): Promise<PatientOption[]> => {
  const response = await axiosInstance.get<PatientOption[]>('doctors/my-patients/');
  return response.data;
};

export const createPrescriptionAPI = async (prescriptionData: PrescriptionInput): Promise<PrescriptionData> => {
  const response = await api.post<PrescriptionData>('prescriptions/', prescriptionData);
  return response.data;
};

export const getPrescriptionsAPI = async (): Promise<PrescriptionData[]> => {
  const response = await api.get<PrescriptionData[]>('prescriptions/');
  return response.data;
};

export const getPatientDetailsAPI = async (patientId: string | number): Promise<PatientDetailData> => {
  const response = await axiosInstance.get<PatientDetailData>(`patients/${patientId}/`);
  return response.data;
};

// =================================================================
// --- FORM DATA CREATOR ---
// =================================================================
export const createFormData = <T extends Record<string, unknown>>(data: T): FormData => {
  const formData = new FormData();
  for (const key in data) {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
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

export const getJournalEntriesAPI = async (params?: {
  q?: string;
  tags?: string;
  filter?: 'weekly' | 'monthly';
}): Promise<JournalEntry[]> => {
  const response = await api.get<JournalEntry[]>('journal/entries/', { params });
  return response.data;
};

export const createJournalEntryAPI = async (data: JournalFormData): Promise<JournalEntry> => {
  const response = await api.post<JournalEntry>('journal/entries/', data);
  return response.data;
};

export const updateJournalEntryAPI = async (id: number, data: JournalFormData): Promise<JournalEntry> => {
  const response = await api.patch<JournalEntry>(`journal/entries/${id}/`, data);
  return response.data;
};

export const deleteJournalEntryAPI = async (id: number): Promise<void> => {
  await api.delete(`journal/entries/${id}/`);
};

export const getJournalTagsAPI = async (): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('journal/tags/');
  return response.data;
};

// =================================================================
// --- DOWNLOAD & SHARE JOURNALS ---
// =================================================================

export const downloadJournalsAPI = async (): Promise<void> => {
  const response = await api.get('journal/entries/download/', { responseType: 'blob' });
  const blobData = response.data as Blob;
  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'soulcare_journal.md');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

interface ShareResponse {
  detail?: string;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export const shareJournalEntryAPI = async (id: number): Promise<ShareResponse> => {
  const response = await api.post<ShareResponse>(`journal/entries/${id}/share/`);
  return response.data;
};

export const getPatientAppointments = async (patientId: string | number): Promise<Appointment[]> => {
  try {
    // Uses 'api' instance and adds a query parameter
    const response = await api.get<Appointment[]>(`appointments/`, {
      params: { patient_id: patientId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointments for patient ID ${patientId}:`, error);
    throw error;
  }
};


export const getPatientPrescriptions = async (patientId: string | number): Promise<PrescriptionData[]> => {
  try {
    // Uses 'api' instance and adds a query parameter
    const response = await api.get<PrescriptionData[]>(`prescriptions/`, {
      params: { patient_id: patientId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching prescriptions for patient ID ${patientId}:`, error);
    throw error;
  }
};


// Function to fetch the user's contact list (based on appointments)
export const getContactList = async (): Promise<Conversation[]> => {
  try {
    // This uses the 'api' instance, as the URL is /api/chat/
    const response = await api.get<Conversation[]>('chat/contacts/');
    return response.data;
  } catch (error) {
    console.error("Error fetching contact list:", error);
    throw error;
  }
};

// Function to fetch the message history for a single conversation
export const getMessageHistory = async (conversationId: number): Promise<ChatMessage[]> => {
  try {
    const response = await api.get<ChatMessage[]>(`chat/conversations/${conversationId}/messages/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    throw error;
  }
};

// =================================================================
// --- HABITS API FUNCTIONS ---
// =================================================================

export const getHabitsAPI = async (): Promise<Habit[]> => {
    // Fetches the user's habits list
    const response = await api.get<Habit[]>('habits/');
    return response.data;
};

export const createHabitAPI = async (habitData: HabitInput): Promise<Habit> => {
    // Creates a new habit
    const response = await api.post<Habit>('habits/', habitData);
    return response.data;
};

export const deleteHabitAPI = async (habitId: string | number): Promise<void> => {
    // Deletes a habit by ID
    await api.delete(`habits/${habitId}/`);
};

export const toggleHabitCompletionAPI = async (
    habitId: string | number,
    completed: boolean
): Promise<HabitToggleResponse> => {
    // Toggles the completion status and updates streak/current
    const response = await api.post<HabitToggleResponse>(
        `habits/${habitId}/toggle_completion/`,
        { completed } as HabitToggleInput
    );
    return response.data;
};
