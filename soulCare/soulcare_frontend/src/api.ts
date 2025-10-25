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
  PatientDetailData
} from '@/types';

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

// --- Request Interceptor (Attach JWT Token) ---
const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const handleRequestError = (error: AxiosError) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
};

// Apply interceptors
api.interceptors.request.use(addAuthToken, handleRequestError);
axiosInstance.interceptors.request.use(addAuthToken, handleRequestError);

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
