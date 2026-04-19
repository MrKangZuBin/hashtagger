'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Crown, Zap, LogOut, User, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'test';

interface UserInfo {
  id: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  plan: string;
  subscriptionStatus: string | null;
}

export function Header() {
  const router = useRouter();
  const { isPro, plan, usage, toggleProMode } = useApp();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-950/95 dark:border-gray-800">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Hashtagger</span>
        </Link>

        <nav className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Logged in user menu */}
          {isLoggedIn ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setShowMenu(false)}
                      >
                        <Crown className="h-4 w-4 text-amber-500" />
                        Admin
                      </Link>
                    )}
                    <hr className="my-2 dark:border-gray-800" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-violet-600 dark:text-gray-400"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Pro badge for logged in users */}
          {isLoggedIn && user.plan !== 'FREE' && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-sm font-medium text-white">
              <Crown className="h-4 w-4" />
              {user.plan.includes('BUSINESS') ? 'Business' : 'Pro'}
            </div>
          )}

          {/* Demo: Toggle Pro Mode - only in dev/test, for logged out users or when testing locally */}
          {isDevOrTest && !isLoggedIn && (
            <button
              onClick={toggleProMode}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all',
                isPro
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
              title="Demo: Toggle Pro mode"
            >
              <Zap className="h-3 w-3" />
              {isPro ? 'Pro Mode ON' : 'Try Pro'}
            </button>
          )}

          {/* Free user usage */}
          {!isPro && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-medium">{usage.dailyUses}/{usage.maxUses}</span>
              <span className="hidden sm:inline">uses today</span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
