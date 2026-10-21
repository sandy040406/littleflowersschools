// ============================================================
// Homepage CMS types + public fetchers (slides & announcements)
// ============================================================

import { api } from '@/lib/api';

export type AnnouncementPriority = 'info' | 'important' | 'urgent';

export interface Announcement {
  id: number;
  text: string;
  link: string | null;
  priority: AnnouncementPriority;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  cta_label: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const getActiveSlides = (signal?: AbortSignal) =>
  api<HeroSlide[]>('/api/content/slides/active', { auth: false, signal });

export const getActiveAnnouncements = (signal?: AbortSignal) =>
  api<Announcement[]>('/api/content/announcements/active', { auth: false, signal });

export interface FacultyMember {
  id: number;
  name: string;
  email: string | null;
  designation: string | null;
  subject: string | null;
  department: string | null;
  experience: string | null;
  bio: string | null;
  photo_url: string | null;
}

export const getPublicFaculty = (signal?: AbortSignal) =>
  api<FacultyMember[]>('/api/content/faculty', { auth: false, signal });

export interface SiteSettings {
  id: number;
  school_name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  office_hours: string | null;
  school_timings: string | null;
  map_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  about_text: string | null;
  vision_text: string | null;
  mission_text: string | null;
  updated_at: string | null;
}

export const getSiteSettings = (signal?: AbortSignal) =>
  api<SiteSettings>('/api/content/settings', { auth: false, signal });

export const updateSiteSettings = (body: Partial<SiteSettings>) =>
  api<SiteSettings>('/api/content/settings', { method: 'PUT', body });

