'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { loginWithEmail } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

export default function AdminLoginPage() {
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

    const result = await loginWithEmail(email, password, 'admin');

    if (result.success) {
      showToast('Login successful', 'success');
      router.replace('/admin/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-school-blue/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      
      <Link href="/login" className="absolute top-8 left-8 text-white/60 hover:text-white flex items-center gap-2 font-medium transition-colors z-10">
        <ArrowLeft size={18} />
        Back to Portals
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white backdrop-blur-sm border border-white/20 shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal Login</h1>
          <p className="text-white/60">Secure access for school administrators.</p>
        </div>

        <Card padding="lg" className="shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium text-white/90 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Mail size={18} />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-navy/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-school-blue focus:border-school-blue outline-none transition-all text-white placeholder-white/30"
                  placeholder="admin@littleflowersschools.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-white/90 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Lock size={18} />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-navy/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-school-blue focus:border-school-blue outline-none transition-all text-white placeholder-white/30"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <p id="admin-login-error" role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button id="admin-login-submit" type="submit" className="w-full bg-school-blue hover:bg-school-blue-light text-white" size="lg" loading={loading}>
              Sign In to Admin
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
