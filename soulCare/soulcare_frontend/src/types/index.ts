export type UserRole = 'user'|'doctor' | 'counselor'|'admin';

// User roles
export interface DoctorProfile {
  full_name: string;
  nic: string;
  contact_number: string;
  specialization: string;
  availability: string;
  license_number: string;
  rating?: number;
}

export interface CounselorProfile {
  full_name: string;
  nic: string;
  contact_number: string;
  expertise: string;
  license_number: string;
  rating?: number;
}

export interface PatientProfile {
  full_name: string;
  nic: string;
  contact_number: string;
  address: string;
  dob: string; // Dates come as strings from JSON
  health_issues: string | null;
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

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerRole: UserRole;
  date: Date;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'therapy' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  prescription?: Prescription;
  createdAt: Date;
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

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

export interface Prescription {
  id: number;
  patient: number; // Will be the patient's user ID
  doctor: number; // Will be the doctor's user ID
  diagnosis: string;
  date_issued: string; // Dates come as strings
  notes: string;
  medications: Medication[];
}

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItem {
  id: string;
  authorId: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'document' | 'image';
  url: string;
  tags: string[];
  patientIds: string[]; // patients this content is shared with
  createdAt: Date;
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