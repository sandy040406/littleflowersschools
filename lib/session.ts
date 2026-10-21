'use client';

// ============================================================
// Session store — keeps the logged-in user + JWT tokens in
// localStorage and lets React components subscribe to changes.
// ============================================================

import { useSyncExternalStore } from 'react';
import type { UserRole } from '@/lib/types';

export interface Session {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  userId: number;
  name: string;
  /** True until the user replaces a temporary / first-login credential. */
  mustChangePassword?: boolean;
}

const KEY = 'lfs_session';
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function read(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEY);
  // Return the same object while the raw value is unchanged so
  // useSyncExternalStore doesn't re-render endlessly.
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  try {
    cachedSession = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

function emit() {
  listeners.forEach((l) => l());
}

export function getSession(): Session | null {
  return read();
}

export function setSession(session: Session | null) {
  if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
  else window.localStorage.removeItem(KEY);
  emit();
}

export function clearSession() {
  setSession(null);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sync across browser tabs (e.g. logout in one tab logs out others)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** React hook: current session (null on the server / when logged out). */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

/** React hook: true once we're running in the browser (avoids hydration flashes). */
const noopSubscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
