'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
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
          throw new Error(data.error || 'Verification failed');
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
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Hashtagger</span>
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-violet-600" />
              <h1 className="text-xl font-bold">Verifying...</h1>
              <p className="mt-2 text-gray-500">Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h1 className="text-xl font-bold text-green-600">Email Verified!</h1>
              <p className="mt-2 text-gray-500">Your account has been activated.</p>
              <p className="mt-4 text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h1 className="text-xl font-bold text-red-600">Verification Failed</h1>
              <p className="mt-2 text-gray-500">{error}</p>
              <Link
                href="/auth/login"
                className="mt-6 inline-block text-violet-600 hover:underline"
              >
                Back to login
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
