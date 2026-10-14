// ============================================================
// Core Types for Little Flowers Schools
// These mirror the eventual FastAPI/PostgreSQL data model
// ============================================================

// --- Auth & Users ---

export type UserRole = 'parent' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// --- Students ---

export interface Student {
  id: string;
  name: string;
  classId: string;
  section: string;
  parentId: string;
  rollNumber: string;
  photoUrl?: string;
  dateOfBirth: string;
  admissionDate: string;
  status: 'active' | 'inactive';
}

// --- Parents ---

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // student IDs
  photoUrl?: string;
  status: 'active' | 'inactive';
}

// --- Teachers ---

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  subject: string;
  experience: string;
  bio: string;
  photoUrl: string;
  assignedClasses: string[]; // class IDs
  department: string;
  status: 'active' | 'inactive';
}

// --- Classes ---

export interface SchoolClass {
  id: string;
  name: string;
  section: string;
  classTeacherId: string;
  studentCount: number;
}

// --- Teacher-Class Assignment ---

export interface TeacherClass {
  teacherId: string;
  classId: string;
}

// --- Events ---

export type EventVisibility = 'public' | 'private';

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  classId?: string;
  className?: string;
  category: string;
  imageUrl: string;
  visibility: EventVisibility;
  photoCount: number;
  videoCount: number;
}

// --- Media ---

export type MediaType = 'image' | 'video';
export type MediaVisibility = 'public' | 'private';

export interface MediaItem {
  id: string;
  eventId: string;
  uploadedBy: string;
  fileName: string;
  storageKey: string;
  thumbnailUrl: string;
  fullUrl: string;
  fileType: MediaType;
  fileSize: number;
  duration?: string; // for videos
  title?: string;
  createdAt: string;
  visibility: MediaVisibility;
}

// --- Enquiries ---

export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface Enquiry {
  id: string;
  parentName: string;
  studentName: string;
  studentClass: string;
  phone: string;
  email: string;
  message: string;
  preferredContact?: 'phone' | 'email';
  status: EnquiryStatus;
  createdAt: string;
}

// --- Gallery ---

export type GalleryCategory = 'all' | 'events' | 'sports' | 'celebrations' | 'activities' | 'campus' | 'achievements';

// --- Navigation ---

export interface NavItem {
  label: string;
  href: string;
}

// --- Dashboard Stats ---

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}

// --- Forms ---

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface EnquiryFormData {
  parentName: string;
  studentName: string;
  studentClass: string;
  phone: string;
  email: string;
  message: string;
  preferredContact?: 'phone' | 'email';
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// --- Upload ---

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: MediaType;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  thumbnailUrl?: string;
}

export interface CreateEventFormData {
  name: string;
  description: string;
  date: string;
  classId: string;
  visibility: EventVisibility;
}
