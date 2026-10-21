// ============================================================
// Gallery & Media API client helpers
// ============================================================

import { api, mediaUrl } from '@/lib/api';

export type Visibility = 'public' | 'private';
export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: number;
  event_id: number;
  uploaded_by: number | null;
  file_name: string;
  url: string;
  media_type: MediaType;
  file_size: number;
  title: string | null;
  visibility: Visibility;
  created_at: string;
}

export interface GalleryEvent {
  id: number;
  title: string;
  description: string | null;
  event_date: string; // YYYY-MM-DD
  category: string;
  class_name: string | null;
  section: string | null;
  visibility: Visibility;
  cover_url: string | null;
  photo_count: number;
  video_count: number;
  created_by: number | null;
  created_at: string;
  media?: MediaItem[];
}

export interface EventCreateInput {
  title: string;
  description?: string;
  event_date: string;
  category?: string;
  class_name?: string | null;
  section?: string | null;
  visibility?: Visibility;
}

export interface EventUpdateInput {
  title?: string;
  description?: string;
  event_date?: string;
  category?: string;
  class_name?: string | null;
  section?: string | null;
  visibility?: Visibility;
  cover_url?: string | null;
}

export async function listEvents(category?: string, className?: string, signal?: AbortSignal): Promise<GalleryEvent[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (className) params.set('class_name', className);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return api<GalleryEvent[]>(`/api/gallery/events${qs}`, { signal });
}

export async function getEvent(id: number | string, signal?: AbortSignal): Promise<GalleryEvent> {
  return api<GalleryEvent>(`/api/gallery/events/${id}`, { signal });
}

export async function createEvent(input: EventCreateInput): Promise<GalleryEvent> {
  return api<GalleryEvent>('/api/gallery/events', {
    method: 'POST',
    body: input,
  });
}

export async function updateEvent(id: number, input: EventUpdateInput): Promise<GalleryEvent> {
  return api<GalleryEvent>(`/api/gallery/events/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteEvent(id: number): Promise<void> {
  return api<void>(`/api/gallery/events/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteMedia(mediaId: number): Promise<void> {
  return api<void>(`/api/gallery/media/${mediaId}`, {
    method: 'DELETE',
  });
}
