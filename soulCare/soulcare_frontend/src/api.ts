// src/api.ts

import axios from 'axios';
// FIX 1: Use the correct public types from axios
import type { AxiosRequestConfig, AxiosError } from 'axios';
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
  HabitToggleResponse,
  ProviderStatsData
} from '@/types';

// FIX 2: Use the correct key that AuthContext saves
const TOKEN_KEY = 'accessToken';

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

// --- Interceptor Functions ---

// This function adds the token to a request
const addAuthToken = (config) => {
  const token = localStorage.getItem(TOKEN_KEY); // Reads 'accessToken'

  // Ensure config.headers exists
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// This function handles request errors (like network down)
const handleRequestError = (error: AxiosError) => {
  console.error('Request Interceptor Error:', error);
  return Promise.reject(error);
};

// This function handles response errors (like 401 Unauthorized)
const handleResponseError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    console.warn('Authentication token is invalid or expired. Redirecting to login.');
    localStorage.removeItem(TOKEN_KEY);

    // Redirect to login, but avoid a loop if we are already on the login page
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }
  return Promise.reject(error);
};

// --- Apply Interceptors ---

// FIX 3: Apply the interceptors to BOTH 'api' AND 'axiosInstance'
// This will fix all your 401 errors.

// Apply to 'api' (for prescriptions, appointments, chat, etc.)
api.interceptors.request.use(addAuthToken, handleRequestError);
api.interceptors.response.use((response) => response, handleResponseError);

// Apply to 'axiosInstance' (for auth/user, auth/doctors/my-patients, etc.)
axiosInstance.interceptors.request.use(addAuthToken, handleRequestError);
axiosInstance.interceptors.response.use((response) => response, handleResponseError);

// (Your old, duplicate interceptors have been removed)
export default api;


// =================================================================
// --- DOCTOR / PATIENT API FUNCTIONS ---
// (No changes needed here)
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
// (No changes needed here)
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
// (No changes needed here)
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
// (No changes needed here)
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
    const response = await api.get<PrescriptionData[]>(`prescriptions/`, {
      params: { patient_id: patientId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching prescriptions for patient ID ${patientId}:`, error);
    throw error;
  }
};


// =================================================================
// --- CHAT API FUNCTIONS ---
// (No changes needed here)
// =================================================================

export const getContactList = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get<Conversation[]>('chat/contacts/');
    return response.data;
  } catch (error) {
    console.error("Error fetching contact list:", error);
    throw error;
  }
};

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
export const deleteMessageAPI = async (messageId: number): Promise<void> => {
  try {
    // Uses 'api' instance to call DELETE /api/chat/messages/<id>/
    await api.delete(`chat/messages/${messageId}/`);
  } catch (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    throw error;
  }
};

//DOCTOR COUNSELOR STAT BOARD FUNCTIONS

export const getProviderDashboardStats = async (): Promise<ProviderStatsData> => {
  try {
    // Uses axiosInstance because the URL is /api/auth/
    const response = await axiosInstance.get<ProviderStatsData>('provider/dashboard-stats/');
    return response.data;
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    throw error;
  }
};


export const getAppointments = async (params?: { date?: string }): Promise<Appointment[]> => {
  try {
    // Uses 'api' instance (baseURL /api/)
    const response = await api.get<Appointment[]>('appointments/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};
