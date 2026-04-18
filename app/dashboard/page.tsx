'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Crown, LogOut, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  plan: string;
  subscriptionStatus: string | null;
  subscriptionEndDate: string | null;
}

const planNames: Record<string, string> = {
  FREE: 'Free',
  PRO_MONTHLY: 'Pro Monthly',
  PRO_YEARLY: 'Pro Yearly',
  BUSINESS_MONTHLY: 'Business Monthly',
  BUSINESS_YEARLY: 'Business Yearly',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPro = user.plan !== 'FREE';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Hashtagger</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="mt-1 text-gray-500">{user.email}</p>

        {/* Plan Status */}
        <div className="mt-8 rounded-2xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold">{planNames[user.plan] || user.plan}</span>
                {isPro && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                    Active
                  </span>
                )}
              </div>
            </div>
            {isPro ? (
              <Crown className="h-8 w-8 text-amber-500" />
            ) : (
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white"
              >
                <CreditCard className="h-4 w-4" />
                Upgrade
              </Link>
            )}
          </div>

          {user.subscriptionEndDate && (
            <p className="mt-4 text-sm text-gray-500">
              {user.subscriptionStatus === 'cancelled'
                ? 'Cancels at'
                : 'Renews at'}{' '}
              {new Date(user.subscriptionEndDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Account Status */}
        <div className="mt-6 rounded-2xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">Account Status</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              {user.isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-red-500" />
              )}
              <span>{user.isVerified ? 'Email verified' : 'Email not verified'}</span>
            </div>
            {user.isAdmin && (
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-amber-500" />
                <span>Admin user</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border p-4 text-center hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <Sparkles className="h-5 w-5 text-violet-600" />
            <span className="font-medium">Generate Hashtags</span>
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-xl border p-4 text-center hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <CreditCard className="h-5 w-5 text-violet-600" />
            <span className="font-medium">
              {isPro ? 'Manage Subscription' : 'View Plans'}
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
