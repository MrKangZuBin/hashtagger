'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Sparkles, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('registrationFailed'));
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{tc('hashtagger')}</span>
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-2xl font-bold">{t('checkYourEmail')}</h1>
            <p className="mt-2 text-gray-500">
              {t('sentVerificationLink')} <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              {t('clickToActivate')}
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block text-violet-600 hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{tc('hashtagger')}</span>
          </Link>
          <h1 className="text-2xl font-bold">{t('createAccount')}</h1>
          <p className="mt-2 text-gray-500">{t('signUpToStart')}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">{tc('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{tc('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('repeatPassword')}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('creatingAccount')}
                </>
              ) : (
                t('createAccountBtn')
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-500">{t('alreadyHaveAccount')} </span>
            <Link href="/auth/login" className="text-violet-600 hover:underline">
              {tc('signIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
