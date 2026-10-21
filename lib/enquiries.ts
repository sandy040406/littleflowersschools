// ============================================================
// Admission enquiries — typed helpers for /api/enquiries.
// ============================================================

import { api } from '@/lib/api';

export type EnquiryStatus = 'new' | 'contacted' | 'closed';
export type PreferredContact = 'phone' | 'email' | 'whatsapp';

export interface Enquiry {
  id: number;
  parent_name: string;
  email: string;
  phone: string;
  student_name: string | null;
  grade_interested: string | null;
  preferred_contact: PreferredContact | null;
  message: string | null;
  enquiry_type: 'admission' | 'contact';
  subject: string | null;
  status: EnquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface EnquiryInput {
  parent_name: string;
  email: string;
  phone: string;
  student_name?: string;
  grade_interested?: string;
  preferred_contact?: PreferredContact;
  message?: string;
  website?: string; // honeypot — must stay empty
}

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  website?: string; // honeypot — must stay empty
}

export interface EnquiryStats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
}

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string; className: string }[] = [
  { value: 'new', label: 'New', className: 'bg-warning-light text-warning-dark border-warning/20' },
  { value: 'contacted', label: 'Contacted', className: 'bg-school-blue/10 text-school-blue border-school-blue/20' },
  { value: 'closed', label: 'Closed', className: 'bg-success/10 text-success border-success/20' },
];

export function statusMeta(status: EnquiryStatus) {
  return ENQUIRY_STATUSES.find((s) => s.value === status) ?? ENQUIRY_STATUSES[0];
}

/** Public — no auth token attached. */
export function submitEnquiry(input: EnquiryInput) {
  return api<Enquiry>('/api/enquiries', { method: 'POST', body: input, auth: false });
}

/** Public — submit contact us message */
export function submitContactForm(input: ContactInput) {
  return api<Enquiry>('/api/contact', { method: 'POST', body: input, auth: false });
}

export function listEnquiries(status?: EnquiryStatus, enquiryType?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (enquiryType && enquiryType !== 'all') params.set('enquiry_type', enquiryType);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return api<Enquiry[]>(`/api/enquiries${qs}`, { signal });
}

export function getEnquiryStats(signal?: AbortSignal) {
  return api<EnquiryStats>('/api/enquiries/stats', { signal });
}

export function updateEnquiry(id: number, body: { status?: EnquiryStatus; admin_notes?: string }) {
  return api<Enquiry>(`/api/enquiries/${id}`, { method: 'PUT', body });
}

export function deleteEnquiry(id: number) {
  return api<{ message: string }>(`/api/enquiries/${id}`, { method: 'DELETE' });
}
