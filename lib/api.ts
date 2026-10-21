// ============================================================
// API client — all calls to the FastAPI backend go through here.
// Adds the JWT, refreshes it automatically on 401, and turns
// backend errors into readable messages.
// ============================================================

import { getSession, setSession, clearSession, type Session } from '@/lib/session';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Turn a backend-relative path like "/uploads/x.jpg" into a full URL. */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_URL}${path}`;
}

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === 'string') return detail;
    // FastAPI validation errors: [{ loc, msg }, ...]
    if (Array.isArray(detail) && detail[0]?.msg) {
      const first = detail[0];
      const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : '';
      return field ? `${field}: ${first.msg}` : first.msg;
    }
  }
  if (status === 0) return 'Cannot reach the server. Please check your connection.';
  return `Request failed (${status})`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  role: Session['role'];
  user_id: number;
  name: string;
  must_change_password?: boolean;
}

export function toSession(t: TokenResponse): Session {
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    role: t.role,
    userId: t.user_id,
    name: t.name,
    mustChangePassword: !!t.must_change_password,
  };
}

// Share one in-flight refresh between parallel requests
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      if (!res.ok) return false;
      setSession(toSession(await res.json()));
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

interface RequestOptions {
  method?: string;
  body?: unknown;            // JSON-serialisable or FormData
  auth?: boolean;            // attach token (default: true if logged in)
  signal?: AbortSignal;
}

export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = opts;

  const doFetch = async () => {
    const headers: Record<string, string> = {};
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
    const token = auth ? getSession()?.accessToken : undefined;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
      signal,
    });
  };

  let res: Response;
  try {
    res = await doFetch();
    if (res.status === 401 && auth && getSession()) {
      if (await tryRefresh()) {
        res = await doFetch();
      } else {
        clearSession();
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(extractMessage(null, 0), 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(extractMessage(data, res.status), res.status);
  return data as T;
}
