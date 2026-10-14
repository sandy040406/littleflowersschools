'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, BookOpen, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { loginWithEmail } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password, 'teacher');

    if (result.success) {
      showToast('Login successful', 'success');
      router.replace('/teacher/dashboard');
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
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-dark">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Teacher Portal Login</h1>
          <p className="text-text-secondary">Sign in to manage your classes and media uploads.</p>
        </div>

        <Card padding="lg" className="shadow-xl border-gold/20 backdrop-blur-sm bg-white/90">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="teacher-email" className="text-sm font-medium text-navy block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail size={18} />
                </div>
                <input
                  id="teacher-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all"
                  placeholder="yourname@littleflowersschools.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="teacher-password" className="text-sm font-medium text-navy block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock size={18} />
                </div>
                <input
                  id="teacher-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <p id="teacher-login-error" role="alert" className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button id="teacher-login-submit" type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 pt-6 border-t border-border text-center text-xs text-text-muted">
            Forgot your password? Please contact the school office.
          </p>
        </Card>
      </div>
    </div>
  );
}
