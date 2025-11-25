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
  start_time: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  has_review?: boolean;
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
  mh_diagnosis_history: boolean;
  substance_use: boolean;
  chronic_illness: boolean;
  financial_stress_level: number;
  employment_status: string;
  marital_status: string;
  gender: string;
  full_name: string;
  nic: string;
  contact_number: string;
  address: string;
  dob: string; // Dates come as strings from JSON
  health_issues: string | null;
  profile_picture?: string | null;
  risk_level?: 'low' | 'medium' | 'high'| string;
}

export type ProfessionalProfile = DoctorProfile | CounselorProfile;
export type CombinedProfile = PatientProfile | DoctorProfile | CounselorProfile;

export interface AdminUserListItem {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  full_name: string;
  date_joined: string;
  license_document_url?: string | null;
}


export interface User {
  id: number; // Corrected to number
  username: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  profile_visibility: 'public' | 'private' | 'patients_only';
  show_online_status: boolean;
  // The nested profile object
  profile: DoctorProfile | CounselorProfile | PatientProfile | null;
}

export interface UserSettings {
  profile_visibility: 'public' | 'private' | 'patients_only';
  show_online_status: boolean;
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
  is_active?: boolean;
  risk_level?: 'low' | 'medium' | 'high';
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

//Progress note Interfaces
export interface ProgressNote {
    id: number;
    patient_id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface ProgressNoteInput {
    patient_id: number;
    content: string;
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
// --- MOOD TRACKER TYPES (NEW) ---
// =================================================================

export interface Activity {
  id: number;
  name: string;
}

export interface MoodEntry {
  id: number;
  patient: number; // Just the ID is fine for the fetched object
  mood: number;
  energy: number;
  anxiety: number;
  notes: string | null;
  activities: Activity[]; // List of activity objects
  tags: Tag[]; // List of tag objects
  date: string; // ISO date string (YYYY-MM-DD)
  created_at: string; // ISO datetime string
}

// Type for sending data to the backend
export interface MoodEntryInput {
  mood: number;
  energy: number;
  anxiety: number;
  notes: string | null;
  activity_ids: number[]; // Array of Activity IDs
  tag_ids: number[]; // Array of Tag IDs
  date: string; // The date of the entry
}


// =================================================================
// --- HABITS TYPES ---
// ... (Your existing HABITS TYPES go here)
// ...

export type HabitTask = {
    habit: Habit;
    id: number;
    name: string;
    isCompleted: boolean; // Dynamic status for the current period
};
// ... (rest of Habit types)


// ... (The rest of your existing types, starting from HabitTaskInput)

export type HabitTaskInput = {
    name: string;
};

export type Habit = {
    id: number;
    name: string;
    description: string | null;
    frequency: 'daily' | 'weekly' | 'monthly';
    target: number;
    current: number;
    streak: number;
    category: string;
    color: string;
    createdAt: string;
    completedToday: boolean;
    tasks: HabitTask[];
};

export type HabitToggleResponse = {
    status: string;
    habit: Habit;
    // If you had 'any' here, that's the fix.
    // The Habit type itself should also not contain 'any'
};

export type HabitInput = {
    name: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    target: number; // Typically 1 for a new habit, can be updated later by adding tasks
    category: string;
    color: string;
};

export type MissedHabitItem = {
    habit_id: number;
    habit_name: string;
    task_id: number;
    task_name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    missed_period_end_date: string; // The last date of the missed period
};

//Recent Activity Interfaces
export interface ActivityItem {
  id: string;
  // Updated types to match your requirements
  type: 'cancellation' | 'new_patient' | 'prescription' | 'content_shared';
  text: string;
  date: string; // ISO string
}
export interface ProviderStatsData {
  total_patients: number;
  appointments_today: number;
  pending_messages: number;
  average_rating: number;
  recent_activity: ActivityItem[];
}
// ... (The rest of your existing types from ReactionTimePayload down to WeeklyMoodDataPoint)


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


//Rating System Interfaces
export interface Review {
    id: number;
    appointment_id: number;
    rating: number;
    comment: string;
    created_at: string;
}

export interface ReviewInput {
    appointment_id: number;
    rating: number;
    comment: string;
}
export interface PatientDashboardStats {
  current_streak: number;
  today_mood_score: number;
  total_meditation_minutes: number;
  // FIX: Added meditation_sessions for the timer card footer
  meditation_sessions: number;
  // We use Appointment | null because the date might not exist
  next_appointment: Appointment | null;
  daily_progress_percentage: number;
}

export interface WeeklyMoodDataPoint {
  day: string; // e.g., "Mon", "Tue"
  mood: number;
  energy: number;
  anxiety: number;
}


export interface PatientUpdateInput {
    // Define specific fields you expect to update
    risk_status?: 'low' | 'medium' | 'high' | string;
    full_name?: string;
    contact_number?: string;
    // ... add any other top-level fields you might patch

    // If you are patching the nested profile data, you would use:
    patientprofile?: Partial<PatientProfile>;
}


// --- BLOG ENGAGEMENT TYPES ---

// Matches BlogCommentSerializer.get_author
export interface CommentAuthor {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  guestName?: string | null;
  guestEmail?: string | null;
}

// Matches BlogCommentSerializer
export interface BlogComment {
  id: number;
  post: number;
  author: CommentAuthor | null;
  content: string;
  createdAt: string;
}

// Matches BlogPostSerializer aggregated fields
export interface BlogAggregates {
  average_rating: number; // 0.0 to 5.0
  rating_count: number;
  comment_count: number;
  reaction_counts: {
    like: number;
    love: number;
    insightful: number;
  };
}

// Update the main BlogPost interface to include the new aggregated fields
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
  // New Aggregated fields
  average_rating: number;
  rating_count: number;
  comment_count: number;
  reaction_counts: {
    like: number;
    love: number;
    insightful: number;
  };
}


export type BlogReactionType = 'like' | 'love' | 'insightful';
export type BlogSortBy = 'newest' | 'oldest' | 'top_rated';


export interface BlogInputData {
    title: string;
    content: string;
    excerpt?: string;
    tags_input?: string; // Comma-separated tags string
    status: 'draft' | 'pending' | 'published' | 'rejected';
}

export interface AssessmentQuestion {
    id: number;
    text: string;
    order: number;
    // questionnaire: number; // For internal use, may not be needed on client
}


export interface AssessmentResponseInput {
    question_id: number;
    score: number; // 0 to 4
}

export interface AssessmentResult {
    id: number;
    questionnaire_title: string;
    raw_score: number;       // e.g., 50 (max 80)
    scaled_score: number;    // e.g., 62 (max 100)
    level: number;           // 1 to 5
    level_display: string;   // e.g., "Possible signs of depression (37-63)"
    interpretation: string;  // The detailed text interpretation
    submitted_at: string;    // ISO date string
}
// FeedBack Data Types

export interface Feedback {
    id: number;
    user: BasicUserInfo; // Reusing existing user type
    content: string;
    rating: number;
    is_approved: boolean;
    created_at: string;
}

export interface FeedbackInput {
    content: string;
    rating: number;
}


export interface AdaptiveQuestionSet {
    title: string;
    description: string;
    questions: ContentItem[]; // Assuming ContentItem is the type for the individual question structure
    max_raw_score: number;
}

export interface AdaptiveSubmissionResponse {
    assessment_result: {
        risk_level: 'low' | 'medium' | 'high';
        total_score: number;
        justification: string;
    };
    content_recommendations: Array<{
        title: string;
        type: string; // Assuming ContentItem['type'] structure
        url: string;
    }>;
    recommended_tags: string[];
}

export interface AssessmentResponseInput {
    question_id: number;
    score: number;
}

