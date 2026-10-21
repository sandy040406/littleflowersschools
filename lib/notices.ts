// ============================================================
// Notices, Circulars & Calendar API Client
// ============================================================

import { api } from '@/lib/api';

export type NoticeCategory = 'circular' | 'academic' | 'holiday' | 'exam' | 'fee' | 'general';

export interface Notice {
  id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  target_class: string | null;
  attachment_url: string | null;
  publish_date: string;
  is_pinned: boolean;
  is_active: boolean;
  created_by?: number | null;
  author_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NoticeCreatePayload {
  title: string;
  content: string;
  category?: NoticeCategory;
  target_class?: string | null;
  attachment_url?: string | null;
  publish_date?: string | null;
  is_pinned?: boolean;
  is_active?: boolean;
}

export interface NoticeUpdatePayload {
  title?: string;
  content?: string;
  category?: NoticeCategory;
  target_class?: string | null;
  attachment_url?: string | null;
  publish_date?: string | null;
  is_pinned?: boolean;
  is_active?: boolean;
}

export interface CalendarItem {
  id: string;
  item_type: 'event' | 'notice';
  title: string;
  description: string | null;
  date: string;
  category: string;
  target_class: string | null;
  cover_url: string | null;
}

export const NOTICE_CATEGORIES: { label: string; value: NoticeCategory; color: string }[] = [
  { label: 'Circular', value: 'circular', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Academic', value: 'academic', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: 'Holiday', value: 'holiday', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Exam / Datesheet', value: 'exam', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Fee Reminder', value: 'fee', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { label: 'General Announcement', value: 'general', color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export const SCHOOL_CLASSES = [
  'Pre-K',
  'LKG',
  'UKG',
  'Class I',
  'Class II',
  'Class III',
  'Class IV',
  'Class V',
  'Class VI',
  'Class VII',
  'Class VIII',
  'Class IX',
  'Class X',
  'Class XI',
  'Class XII',
];

// ── Public Fetchers ──────────────────────────────────────────

export async function getPublicNotices(category?: string, search?: string, signal?: AbortSignal): Promise<Notice[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  const q = params.toString() ? `?${params.toString()}` : '';
  return api<Notice[]>(`/api/notices${q}`, { auth: false, signal });
}

export async function getCalendarFeed(signal?: AbortSignal): Promise<CalendarItem[]> {
  return api<CalendarItem[]>('/api/notices/calendar', { auth: false, signal });
}

// ── Parent Portal Fetchers ───────────────────────────────────

export async function getParentNotices(category?: string, search?: string): Promise<Notice[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  const q = params.toString() ? `?${params.toString()}` : '';
  return api<Notice[]>(`/api/notices/parent${q}`);
}

// ── Admin Portal Fetchers ────────────────────────────────────

export async function getAdminNotices(filter?: {
  category?: string;
  target_class?: string;
  is_active?: boolean;
  search?: string;
}): Promise<Notice[]> {
  const params = new URLSearchParams();
  if (filter?.category && filter.category !== 'all') params.set('category', filter.category);
  if (filter?.target_class) params.set('target_class', filter.target_class);
  if (filter?.is_active !== undefined) params.set('is_active', String(filter.is_active));
  if (filter?.search) params.set('search', filter.search);
  const q = params.toString() ? `?${params.toString()}` : '';
  return api<Notice[]>(`/api/notices/admin${q}`);
}

export async function createAdminNotice(payload: NoticeCreatePayload): Promise<Notice> {
  return api<Notice>('/api/notices/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminNotice(id: number, payload: NoticeUpdatePayload): Promise<Notice> {
  return api<Notice>(`/api/notices/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminNotice(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/notices/admin/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleNoticePinned(id: number): Promise<Notice> {
  return api<Notice>(`/api/notices/admin/${id}/toggle-pinned`, {
    method: 'PATCH',
  });
}

export async function toggleNoticeActive(id: number): Promise<Notice> {
  return api<Notice>(`/api/notices/admin/${id}/toggle-active`, {
    method: 'PATCH',
  });
}
