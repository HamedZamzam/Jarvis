'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { Mic } from 'lucide-react';

export default function LoginPage() {
  const { supabase, lang } = useApp();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Supabase may require email confirmation
        if (data.user && !data.session) {
          setSuccess('Check your email for a confirmation link!');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t(lang, 'auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-jarvis-500 mb-4">
            <Mic size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t(lang, 'app.name')}</h1>
          <p className="text-[var(--muted)] mt-1">{t(lang, 'app.tagline')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t(lang, 'auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)]
                         focus:outline-none focus:ring-2 focus:ring-jarvis-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t(lang, 'auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)]
                         focus:outline-none focus:ring-2 focus:ring-jarvis-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-jarvis-500 text-white font-semibold
                       hover:bg-jarvis-600 disabled:opacity-50 transition-colors"
          >
            {loading ? t(lang, 'common.loading') : (isSignUp ? t(lang, 'auth.signUp') : t(lang, 'auth.signIn'))}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[var(--border)]" />
          <span className="px-3 text-sm text-[var(--muted)]">or</span>
          <div className="flex-1 border-t border-[var(--border)]" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]
                     font-medium hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Toggle */}
        <p className="text-center mt-6 text-sm text-[var(--muted)]">
          {isSignUp ? t(lang, 'auth.hasAccount') : t(lang, 'auth.noAccount')}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-jarvis-500 font-medium hover:underline"
          >
            {isSignUp ? t(lang, 'auth.signIn') : t(lang, 'auth.signUp')}
          </button>
        </p>
      </div>
    </div>
  );
}
