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
  HabitTask,
  HabitTaskInput,
  MissedHabitItem,
  ProviderStatsData,
  ContentItem,
  ContentFormData,
  BlogPost,
  ReactionTimePayload,
  MemoryGamePayload,
  StroopGamePayload,
  LongestNumberPayload,
  NumpuzGameStats,
  NumpuzHistoryItem,
  NumpuzPayload,
  AdditionsGamePayload,
  AdditionsGameStats,
  GameDashboardStats,
  Review,
  ReviewInput,
  PatientDashboardStats,
  WeeklyMoodDataPoint,
  MoodEntry,
  MoodEntryInput,
  Activity

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
// --- PATIENT DASHBOARD DATA API FUNCTIONS (NEW) ---
// =================================================================

/**
 * Fetches aggregated statistics for the quick stat cards.
 * @returns PatientDashboardStats object.
 * We will define an endpoint like /api/auth/patient-dashboard-stats/ on the backend.
 */
export const fetchPatientDashboardStats = async (): Promise<PatientDashboardStats> => {
  // Uses axiosInstance because this is likely an Auth-related endpoint: /api/auth/
  const response = await axiosInstance.get<PatientDashboardStats>('patient/dashboard-stats/');
  return response.data;
};

/**
 * Fetches the last 7 days of mood, energy, and anxiety for the line chart.
 * @returns Array of WeeklyMoodDataPoint.
 * We will define an endpoint like /api/moodtracker/weekly-stats/ on the backend.
 */
export const fetchWeeklyMoodData = async (): Promise<WeeklyMoodDataPoint[]> => {
  const response = await api.get<WeeklyMoodDataPoint[]>('moodtracker/weekly-stats/');
  return response.data;
};


// =================================================================
// --- MOOD TRACKER API FUNCTIONS (NEW/COMPLETED) ---
// =================================================================

/**
 * Fetches all mood entries for the patient.
 * The endpoint is GET /api/moodtracker/entries/
 */
export const getMoodEntriesAPI = async (): Promise<MoodEntry[]> => {
  // CRITICAL FIX: Ensure the URL prefix is 'moodtracker/entries/'
  const response = await api.get<MoodEntry[]>('moodtracker/entries/');
  return response.data;
};

/**
 * Creates a new mood entry.
 * The endpoint is POST /api/moodtracker/entries/
 */
export const createMoodEntryAPI = async (data: MoodEntryInput): Promise<MoodEntry> => {
  // CRITICAL FIX: Ensure the URL prefix is 'moodtracker/entries/'
  const response = await api.post<MoodEntry>('moodtracker/entries/', data);
  return response.data;
};

/**
 * Fetches the list of all available activities.
 * The endpoint is GET /api/moodtracker/activities/
 */
export const getMoodActivitiesAPI = async (): Promise<Activity[]> => {
  // CRITICAL FIX: Ensure the URL prefix is 'moodtracker/activities/'
  const response = await api.get<Activity[]>('moodtracker/activities/');
  return response.data;
};

/**
 * Fetches the list of all available tags.
 * The endpoint is GET /api/moodtracker/tags/
 */
export const getMoodTagsAPI = async (): Promise<Tag[]> => {
  // CRITICAL FIX: Ensure the URL prefix is 'moodtracker/tags/'
  const response = await api.get<Tag[]>('moodtracker/tags/');
  return response.data;
};
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

export const deletePrescriptionAPI = async (prescriptionId: number): Promise<void> => {
  try {
    // Uses 'api' instance (baseURL /api/)
    await api.delete(`prescriptions/${prescriptionId}/`);
  } catch (error) {
    console.error(`Error deleting prescription ${prescriptionId}:`, error);
    throw error;
  }
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


// =================================================================
// --- CONTENT LIBRARY API FUNCTIONS ---
// =================================================================

/**
 * (Provider) Fetches the provider's own content library.
 */
export const getContentItems = async (): Promise<ContentItem[]> => {
  try {
    const response = await api.get<ContentItem[]>('content/');
    return response.data;
  } catch (error) {
    console.error("Error fetching content items:", error);
    throw error;
  }
};

/**
 * (Provider) Uploads a new content item.
 * We must use FormData for file uploads.
 */
export const createContentItem = async (data: ContentFormData): Promise<ContentItem> => {
  // Use your existing createFormData helper, or build one
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('type', data.type);
  formData.append('file', data.file, data.file.name);
  formData.append('tags_input', data.tags); // Send tags as comma-separated string

  try {
    const response = await api.post<ContentItem>('content/', formData, {
      // Set the content type for file uploads
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating content item:", error);
    throw error;
  }
};

/**
 * (Provider) Deletes a content item by its ID.
 */
export const deleteContentItem = async (id: number): Promise<void> => {
  try {
    await api.delete(`content/${id}/`);
  } catch (error) {
    console.error(`Error deleting content item ${id}:`, error);
    throw error;
  }
};

/**
 * (Provider) Shares a content item with a list of patients.
 */
export const shareContentItem = async ({ id, patientIds }: { id: number; patientIds: number[] }): Promise<ContentItem> => {
  try {
    // This calls the custom 'share' action on the backend view
    const response = await api.patch<ContentItem>(
      `content/${id}/share/`,
      { patient_ids: patientIds } // Send the list of IDs
    );
    return response.data;
  } catch (error) {
    console.error(`Error sharing content item ${id}:`, error);
    throw error;
  }
};

/**
 * (Patient) Fetches content items that have been shared with the logged-in patient.
 */
export const getSharedContentForPatient = async (): Promise<ContentItem[]> => {
  try {
    const response = await api.get<ContentItem[]>('content/shared-with-me/');
    return response.data;
  } catch (error) {
    console.error("Error fetching shared content:", error);
    throw error;
  }
};


// =================================================================
// --- BLOG ADMIN API FUNCTIONS ---
// =================================================================

// Reuse the existing endpoint but allow passing a specific status
export const getAdminBlogsAPI = async (statusFilter: string = 'all'): Promise<BlogPost[]> => {
  const response = await api.get<BlogPost[]>('blogs/', {
    params: { status: statusFilter }
  });
  return response.data;
};

// Update status (Approve/Reject)
export const updateBlogStatusAPI = async (id: string, status: 'published' | 'rejected'): Promise<BlogPost> => {
  const response = await api.patch<BlogPost>(`blogs/${id}/`, { status });
  return response.data;
};

// Delete Blog
export const deleteBlogAPI = async (id: string): Promise<void> => {
  await api.delete(`blogs/${id}/`);
};


// =================================================================
// --- GAMES API FUNCTIONS ---
// =================================================================

/**
 * Saves the reaction time game results and matrix data to the Django API.
 * The endpoint is POST /api/games/reaction-time/
 */
export const saveReactionTimeResult = async (data: ReactionTimePayload) => {
  try {
    // Uses the 'api' instance which has the authentication interceptors
    const response = await api.post('/games/reaction-time/', data);
    return response.data;
  } catch (error) {
    console.error('Error saving reaction time result:', error);
    throw error;
  }
};


/**
 * Saves the memory game results and matrix data to the Django API.
 * The endpoint is POST /api/games/memory-game/
 */
export const saveMemoryGameResult = async (data: MemoryGamePayload) => {
  try {
    // Uses the 'api' instance which has the authentication interceptors
    const response = await api.post('/games/memory-game/', data);
    return response.data;
  } catch (error) {
    console.error('Error saving memory game result:', error);
    throw error;
  }
};


/**
 * Saves the Stroop game results and matrix data to the Django API.
 * The endpoint is POST /api/games/stroop-game/
 */
export const saveStroopGameResult = async (data: StroopGamePayload) => {
  try {
    // Uses the 'api' instance which has the authentication interceptors
    const response = await api.post('/games/stroop-game/', data);
    return response.data;
  } catch (error) {
    console.error('Error saving Stroop game result:', error);
    throw error;
  }
};

export const saveLongestNumberResult = async (data: LongestNumberPayload) => {
  try {
    // Uses the 'api' instance which has the authentication interceptors
    const response = await api.post('/games/longest-number/', data);
    return response.data;
  } catch (error) {
    console.error('Error saving longest number result:', error);
    throw error;
  }
};

export interface LongestNumberHistoryItem {
    score: number;
    time: number;
    created_at: string;
}
export interface LongestNumberGameStats {
    highest_score: number;
    average_score: number;
    total_plays: number;
    total_time_ms: number;
    history: LongestNumberHistoryItem[]; // Use the defined interface here
}

export const fetchLongestNumberStats = async (): Promise<LongestNumberGameStats> => {
  try {
    // We will create this stats endpoint in mentalGames/views.py and mentalGames/urls.py next.
    const response = await api.get<LongestNumberGameStats>('/games/longest-number-stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching longest number stats:', error);
    // Return a default/mock structure on failure to prevent app crash
    return {
        highest_score: 0,
        average_score: 0,
        total_plays: 0,
        total_time_ms: 0,
        history: []
    };
  }
};


export const saveNumpuzResult = async (data: NumpuzPayload) => {
  try {
    const response = await api.post('/games/numpuz-game/', data);
    return response.data;
  } catch (error) {
    console.error('Error saving numpuz game result:', error);

  }

};

export const saveAdditionsResult = async (data: AdditionsGamePayload) => {
  try {
    const response = await api.post('/games/additions-game/', data);
    return response.data;
  } catch (error) {
    console.error('Error saving additions game result:', error);
    throw error;
  }
};

export const fetchAdditionsStats = async (): Promise<AdditionsGameStats> => {
  try {
    const response = await api.get<AdditionsGameStats>('/games/additions-stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching additions game stats:', error);
    return {
        highest_correct: 0,
        avg_correct: 0,
        total_plays: 0,
        history: []
    };
  }
};

// =================================================================
// --- ADMIN CONTENT API ---
// =================================================================

// Admins reuse the GET /content/ endpoint.
// The backend now returns ALL items if the user is an admin.
export const getAllContentItemsAPI = async (): Promise<ContentItem[]> => {
  try {
    const response = await api.get<ContentItem[]>('content/');
    return response.data;
  } catch (error) {
    console.error("Error fetching all content items:", error);
    throw error;
  }
};


export const deleteContentItemAPI = deleteContentItem;


export const fetchNumpuzStats = async (): Promise<NumpuzGameStats> => {
  try {
    const response = await api.get<NumpuzGameStats>('/games/numpuz-stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching numpuz game stats:', error);
    // Return a default/mock structure on failure to prevent app crash
    return {
        best_time_s: 0,
        min_moves: 0,
        total_plays: 0,
        history: []
    };
  }
};


export const fetchDashboardGameStats = async (): Promise<GameDashboardStats> => {
  try {
    const response = await api.get<GameDashboardStats>('/games/dashboard-stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard game stats:', error);
    // Return a structured default object on failure to prevent app crash
    return {
        total_games_played: 0,
        average_success_rate: 0,
        total_time_spent_h: 0,
        summary: {
            reaction_time: { best_time_ms: null, total_plays: 0 },
            memory_game: { max_sequence_length: null, total_plays: 0 },
            stroop_game: { best_correct_percentage: null, avg_interference_ms: null, total_plays: 0 },
            longest_number: { max_number_length: null, total_plays: 0 },
            numpuz_game: { best_time_s: null, min_moves: null, total_plays: 0 },
            additions_game: { highest_correct: null, total_plays: 0 },
            emotion_recognition: { total_plays: 0, best_metric: null, last_played_at: null },
            visual_attention_tracker: { total_plays: 0, best_metric: null, last_played_at: null },
            pattern_recognition: { total_plays: 0, best_metric: null, last_played_at: null },
            mood_reflection_game: { total_plays: 0, best_metric: null, last_played_at: null },
        }
    };
  }
};


// =================================================================
// --- HABITS API FUNCTIONS (MODIFIED FOR TASK STRUCTURE) ---
// =================================================================

export const getHabitsAPI = async (): Promise<Habit[]> => {
    // Fetches the user's habits list, now includes nested tasks
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

// --- NEW TASK-BASED API FUNCTIONS ---

export const createHabitTaskAPI = async (
    habitId: string | number,
    taskData: HabitTaskInput
): Promise<HabitTask> => {
    // Creates a new sub-task for a specific habit
    const response = await api.post<HabitTask>(
        `habits/${habitId}/tasks/`,
        taskData
    );
    return response.data;
};

export const getMissedHabitsAPI = async (): Promise<MissedHabitItem[]> => {
    // Fetches incomplete tasks from the previous period (Daily/Weekly/Monthly)
    // FIX: Changed hyphen to underscore to match views.py url_path
    const response = await api.get<MissedHabitItem[]>('habits/missed_habits/');
    return response.data;
};


export const toggleHabitTaskCompletionAPI = async (
    taskId: string | number,
    completed: boolean // True to complete, False to uncomplete
): Promise<{ status: string, habit: Habit }> => {
    // FIX: Ensure trailing slash is included for custom actions
    const response = await api.post<{ status: string, habit: Habit }>(
        `habits/tasks/${taskId}/toggle/`, // <-- The regex in views.py requires a specific format
        { completed }
    );
    return response.data;
};


// Deprecated: The old single-habit completion toggle is no longer used
/*
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
};*/
// --- Rating System APIS ---
// =================================================================

export const createReviewAPI = async (data: ReviewInput): Promise<Review> => {
    try {
        const response = await api.post<Review>('reviews/', data);
        return response.data;
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
};

