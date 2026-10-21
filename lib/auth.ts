// ============================================================
// Authentication service — talks to the FastAPI backend.
//   Admin / Teacher : email + password
//   Parent          : child's admission number + date of birth
// ============================================================

import { User, UserRole } from '@/lib/types';
import { api, ApiError, toSession } from '@/lib/api';
import { setSession, clearSession, getSession } from '@/lib/session';

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  role: UserRole;
  user_id: number;
  name: string;
  must_change_password?: boolean;
}

function failure(err: unknown): LoginResult {
  return { success: false, error: err instanceof ApiError ? err.message : 'Login failed. Please try again.' };
}

/** Admin & teacher login. `expectedRole` stops a teacher using the admin portal and vice-versa. */
export async function loginWithEmail(
  email: string,
  password: string,
  expectedRole: 'admin' | 'teacher'
): Promise<LoginResult> {
  try {
    const res = await api<TokenResponse>('/api/auth/login/admin', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
      auth: false,
    });
    if (res.role !== expectedRole) {
      return {
        success: false,
        error: `This account is not a${expectedRole === 'admin' ? 'n admin' : ' teacher'} account. Please use the ${res.role} portal.`,
      };
    }
    setSession(toSession(res));
    return { success: true };
  } catch (err) {
    return failure(err);
  }
}

/**
 * Parent login. First time: admission number + DOB (YYYY-MM-DD).
 * After they've set a password: admission number + password.
 */
export async function loginParent(
  admissionNumber: string,
  credential: string,
  mode: 'dob' | 'password' = 'dob'
): Promise<LoginResult> {
  try {
    const res = await api<TokenResponse>('/api/auth/login/parent', {
      method: 'POST',
      body: {
        admission_number: admissionNumber.trim(),
        ...(mode === 'dob' ? { date_of_birth: credential } : { password: credential }),
      },
      auth: false,
    });
    setSession(toSession(res));
    return { success: true };
  } catch (err) {
    return failure(err);
  }
}

/** Change the signed-in user's own password. Refreshes the session tokens. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<LoginResult> {
  try {
    const res = await api<TokenResponse>('/api/auth/change-password', {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword },
    });
    setSession(toSession(res));
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof ApiError ? err.message : 'Could not change password. Please try again.' };
  }
}

export function logout() {
  clearSession();
}

export function isLoggedInAs(role: UserRole): boolean {
  return getSession()?.role === role;
}

// ------------------------------------------------------------
// TEMPORARY: still used by dashboard/gallery pages that show
// mock data. These will be replaced with real API data in the
// next batches (2b / 2c), after which this can be deleted.
// ------------------------------------------------------------
const MOCK_USERS: Record<UserRole, User> = {
  parent: { id: 'p1', email: '', name: 'Parent', role: 'parent', isActive: true, createdAt: '' },
  teacher: { id: 't1', email: '', name: 'Teacher', role: 'teacher', isActive: true, createdAt: '' },
  admin: { id: 'a1', email: '', name: 'Administrator', role: 'admin', isActive: true, createdAt: '' },
};

/** @deprecated Use `useSession()` from '@/lib/session'. */
export function getMockUser(role: UserRole): User | null {
  return MOCK_USERS[role] ?? null;
}
