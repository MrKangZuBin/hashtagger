'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError(t('noTokenProvided'));
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t('verificationFailed'));
        }

        // Save token and user info
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setStatus('success');

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : t('verificationFailed'));
      }
    };

    verify();
  }, [token, router, t]);

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
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-violet-600" />
              <h1 className="text-xl font-bold">{t('verifying')}</h1>
              <p className="mt-2 text-gray-500">{t('pleaseWait')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h1 className="text-xl font-bold text-green-600">{t('emailVerified')}</h1>
              <p className="mt-2 text-gray-500">{t('accountActivated')}</p>
              <p className="mt-4 text-sm text-gray-500">{t('redirecting')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h1 className="text-xl font-bold text-red-600">{t('verificationFailed')}</h1>
              <p className="mt-2 text-gray-500">{error}</p>
              <Link
                href="/auth/login"
                className="mt-6 inline-block text-violet-600 hover:underline"
              >
                {t('backToLogin')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
