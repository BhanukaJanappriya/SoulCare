export type UserRole = 'patient'|'doctor' | 'counselor';

// User roles
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
  experience?: number;
  certifications?: string[];
  phone?: string;
  bio?: string;
  rating?: number;
  createdAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  assignedDoctorId?: string;
  assignedCounselorId?: string;
  createdAt: Date;
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

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  notes?: string;
  createdAt: Date;
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