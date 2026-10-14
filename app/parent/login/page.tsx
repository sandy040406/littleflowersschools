'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hash, CalendarDays, Users, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { loginParent } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function ParentLoginPage() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD from <input type="date">
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  const today = new Date().toISOString().slice(0, 10);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginParent(admissionNumber, dob);

    if (result.success) {
      showToast('Login successful', 'success');
      router.replace('/parent/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-blue flex flex-col items-center justify-center p-4">
      <Link href="/login" className="absolute top-8 left-8 text-text-secondary hover:text-navy flex items-center gap-2 font-medium transition-colors">
        <ArrowLeft size={18} />
        Back to Portals
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-school-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-school-blue">
            <Users size={32} />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Parent Portal Login</h1>
          <p className="text-text-secondary">Sign in with your child&apos;s admission number and date of birth.</p>
        </div>

        <Card padding="lg" className="shadow-xl border-border/50 backdrop-blur-sm bg-white/90">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="parent-admission" className="text-sm font-medium text-navy block">
                Admission Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Hash size={18} />
                </div>
                <input
                  id="parent-admission"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue outline-none transition-all"
                  placeholder="e.g. LFS2025001"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="parent-dob" className="text-sm font-medium text-navy block">
                Child&apos;s Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <CalendarDays size={18} />
                </div>
                <input
                  id="parent-dob"
                  type="date"
                  required
                  max={today}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p id="parent-login-error" role="alert" className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button id="parent-login-submit" type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 pt-6 border-t border-border text-center text-xs text-text-muted">
            Can&apos;t sign in? Please contact the school office to verify your child&apos;s details.
          </p>
        </Card>
      </div>
    </div>
  );
}
