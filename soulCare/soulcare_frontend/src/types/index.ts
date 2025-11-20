import api from "@/api";

export type UserRole = 'user'|'doctor' | 'counselor'|'admin';

export interface Provider {
  id: number;
  username: string;
  role: 'doctor' | 'counselor';
  profile: DoctorProfile | CounselorProfile;
}

export interface Appointment {
  id: number;
  patient: Provider;
  provider: Provider;
  date: string;
  time: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
}


// User roles
export interface DoctorProfile {
  full_name: string;
  nic: string;
  contact_number: string;
  specialization: string;
  availability: string;
  license_number: string;
  rating?: number;
  profile_picture?: string | null;
  bio?: string | null;
}

export interface CounselorProfile {
  full_name: string;
  nic: string;
  contact_number: string;
  expertise: string;
  license_number: string;
  rating?: number;
  profile_picture?: string | null;
  bio?: string | null;
}

export interface PatientProfile {
  full_name: string;
  nic: string;
  contact_number: string;
  address: string;
  dob: string; // Dates come as strings from JSON
  health_issues: string | null;
  profile_picture?: string | null;
}


export interface AdminUserListItem {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  full_name: string;
  date_joined: string;
}


export interface User {
  id: number; // Corrected to number
  username: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  // The nested profile object
  profile: DoctorProfile | CounselorProfile | PatientProfile | null;
}

export interface BasicUserInfo {
    id: number;
    username: string;
    email: string;
    full_name?: string | null;
    nic?: string | null;
    contact_number?: string | null;
    role: UserRole;
}

export interface PatientOption {
  id: number;
  username: string;
  email: string;
  full_name?: string | null; // Can be null from backend
  nic?: string | null;
  contact_number?: string | null;

  // Mock/Placeholder fields (will be fetched separately on detail page)
  age?: number;
  lastVisit?: string | null;
  condition?: string | null;
  status?: 'active' | 'inactive' | string;
  riskLevel?: 'low' | 'medium' | 'high' | string;
}

export interface PatientDetailData {
    id: number;
    username: string;
    email: string;
    date_joined: string; // ISO string
    is_active: boolean;
    role: UserRole; // Should always be 'user' based on backend query
    patientprofile: PatientProfile | null; // Profile might be missing

    // Optional: Add if you include recent_appointments/prescriptions in serializer
    recent_appointments?: Appointment[];
    recent_prescriptions?: PrescriptionData[];

}
export interface MedicationData {
    id?: number; // Might have ID when fetching
    name: string;
    dosage: string;
    frequency: string;
    instructions?: string;
}

export interface PrescriptionData {
    id: number;
    patient: BasicUserInfo; // Expecting nested object when fetching
    doctor: BasicUserInfo;  // Expecting nested object when fetching
    diagnosis: string;
    date_issued: string; // ISO date string
    notes?: string;
    medications: MedicationData[];
}

export interface PrescriptionInput {
    patient_id: number; // Patient User ID
    diagnosis: string;
    notes?: string;
    medications: Omit<MedicationData, 'id'>[];
}

export interface PrescriptionFormData {
    patient: string; // Patient ID as string (from Select component)
    diagnosis: string;
    notes?: string;
    medications: Omit<MedicationData, 'id'>[];
}

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  excerpt: string;
  author_name?: string;
  author_role?: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItem {
  id: number;
  owner: BasicUserInfo;
  title: string;
  description: string;
  type: "video" | "audio" | "document" | "image";
  file: string; // This will be the direct URL to the file
  tags: string[];
  shared_with: BasicUserInfo[];
  created_at: string; // ISO date string
}

export interface ContentFormData {
  title: string;
  description: string;
  type: "video" | "audio" | "document" | "image";
  file: File; // The actual file object
  tags: string;
  // patientIds are handled by a separate 'share' action
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'message' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface ProgressNote {
  id: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  type: 'therapy' | 'medical' | 'general';
  content: string;
  goals: string[];
  nextSteps: string[];
  createdAt: Date;
}


export interface Tag {
  id: number;
  name: string;
}

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood_emoji: string | null;
  is_private: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  tags: Tag[];
  shared_with_counselor: { full_name: string } | null;

}

// For creating or updating
export interface JournalFormData {
    title: string;
    content: string;
    mood_emoji?: string;
    tag_names?: string[]; // e.g., ["gratitude", "work"]
    is_private?: boolean;
}
// Matches the MessageSerializer output
export interface ChatMessage {
  id: number;
  conversation: number;
  sender: BasicUserInfo; // Uses your existing BasicUserInfo type
  content: string;
  timestamp: string; // ISO date string
  is_read: boolean;
}

// Matches the ConversationListSerializer output
export interface Conversation {
  id: number;
  other_user: BasicUserInfo; // The person you are talking to
  last_message: ChatMessage | null; // The most recent message object
  unread_count: number;
}


// =================================================================
// --- HABITS TYPES ---
// =================================================================

export interface Habit {
  id: string | number; // Django uses number, but frontend sometimes uses string for temporary IDs
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  streak: number;
  category: string;
  color: string;
  completedToday: boolean; // Mapped from completed_today
  createdAt: string; // Keep as string (ISO date string) for transport
  lastCompleted?: string | null; // Keep as string (ISO date string) or null for transport
}

// Data structure for creating a new habit (what React sends to POST /habits/)
export interface HabitInput {
    name: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    target: number;
    category: string;
    color: string;
}

// Data structure for the POST /habits/{id}/toggle_completion/ body
export interface HabitToggleInput {
    completed: boolean;
}

// Data structure for the POST /habits/{id}/toggle_completion/ response
export interface HabitToggleResponse {
    status: string; // e.g., "Habit marked as completed"
    habit: Habit; // The updated habit object from the server
}


export interface ProviderStatsData {
  total_patients: number;
  appointments_today: number;
  pending_messages: number;
  average_rating: number;
}

export interface ReactionTimePayload {
  reaction_time_ms: number;
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
}

export interface MemoryGamePayload {
  max_sequence_length: number;
  total_attempts: number;
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
}

export interface StroopGamePayload {
  total_correct: number;
  interference_score_ms: number;
  total_time_s: number;
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
}

export interface LongestNumberPayload {
  max_number_length: number;
  total_attempts: number;
  total_reaction_time_ms: number;
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
}

// === NEW INTERFACES FOR LONGEST NUMBER GAME STATS ===
export interface LongestNumberHistoryItem {
    score: number;
    time: number;
    created_at: string;
}

export interface LongestNumberGameStats {
    highest_score: number;
    average_score: number;
    total_plays: number;
    history: LongestNumberHistoryItem[];
}

// =================================================================
// --- NUMPUZ GAME
// =================================================================

export interface NumpuzPayload {
  time_taken_s: number;
  puzzle_size: string; // e.g., "3x3", "4x4"
  moves_made: number;
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
}

export interface NumpuzHistoryItem {
  score: number; // We'll use moves_made for score
  time_taken_s: number;
  puzzle_size: string;
  created_at: string;
}

export interface NumpuzGameStats {
  best_time_s: number;
  min_moves: number;
  total_plays: number;
  history: NumpuzHistoryItem[];
}

export interface AdditionsGamePayload {
  total_correct: number;
  time_taken_s: number;
  difficulty_level: number; // Max level reached
  post_game_mood: number;
  perceived_effort: number;
  stress_reduction_rating: number;
}

export interface AdditionsGameHistoryItem {
  score: number; // Total correct
  time: number; // Time taken in seconds
  difficulty: number; // Max difficulty level
  created_at: string;
}

export interface AdditionsGameStats {
  highest_correct: number; // Max total_correct achieved
  avg_correct: number;
  total_plays: number;
  history: AdditionsGameHistoryItem[];
}



// =================================================================
// --- DASHBOARD AGGREGATE GAME STATS ---
// =================================================================

export interface GameSpecificSummary {
    total_plays: number;
    // Best score is an abstract term, we'll use specific metrics for modeled games
    best_metric: number | null; // e.g., Best Time, Max Length, Highest Correct
    last_played_at: string | null; // ISO date string
}

export interface GameDashboardStats {
    total_games_played: number; // Sum of all game plays
    average_success_rate: number; // e.g., an average of best scores (0-100)
    total_time_spent_h: number; // Total time played in hours (for the main stat card)

    // Detailed summary for each game
    summary: {
        reaction_time: {
            best_time_ms: number | null; // Lower is better
            total_plays: number;
        };
        memory_game: {
            max_sequence_length: number | null; // Higher is better
            total_plays: number;
        };
        stroop_game: {
            best_correct_percentage: number | null; // Higher is better
            avg_interference_ms: number | null; // Lower is better
            total_plays: number;
        };
        longest_number: {
            max_number_length: number | null; // Higher is better
            total_plays: number;
        };
        numpuz_game: {
            best_time_s: number | null; // Lower is better
            min_moves: number | null; // Lower is better
            total_plays: number;
        };
        additions_game: {
            highest_correct: number | null; // Higher is better
            total_plays: number;
        };
        // Placeholders for unmodeled games (to maintain frontend stability)
        emotion_recognition: GameSpecificSummary;
        visual_attention_tracker: GameSpecificSummary;
        pattern_recognition: GameSpecificSummary;
        mood_reflection_game: GameSpecificSummary;
    }
}
