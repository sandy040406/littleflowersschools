'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { changePassword } from '@/lib/auth';
import { useSession } from '@/lib/session';
import type { UserRole } from '@/lib/types';

const MIN_LENGTH = 8;

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white';

/** Shared "change password" screen for every portal role. */
export default function ChangePasswordForm({ role }: { role: UserRole }) {
  const session = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const forced = !!session?.mustChangePassword;

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (next.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    const result = await changePassword(current, next);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Could not change password.');
      return;
    }

    showToast('Password changed successfully', 'success');
    setCurrent('');
    setNext('');
    setConfirm('');
    if (forced) router.replace(`/${role}/dashboard`);
  };

  const currentLabel =
    role === 'parent' && forced ? 'Current password (your child’s date of birth, YYYY-MM-DD, or your temporary password)' : 'Current password';

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">Change Password</h1>
        <p className="text-text-secondary">Choose a strong password you don’t use anywhere else.</p>
      </div>

      {forced && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-light px-4 py-3 text-sm text-warning-dark mb-6"
        >
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <span>For your security, you need to set a new password before continuing.</span>
        </div>
      )}

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="block text-sm font-medium text-navy">
              {currentLabel}
            </label>
            <input
              id="current-password"
              type={role === 'parent' && forced ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputClass}
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-medium text-navy">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_LENGTH}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputClass}
              suppressHydrationWarning
            />
            <p className="text-xs text-text-muted">At least {MIN_LENGTH} characters.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-navy">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              suppressHydrationWarning
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button id="change-password-submit" type="submit" size="lg" className="w-full" loading={loading} icon={<KeyRound size={18} />}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
