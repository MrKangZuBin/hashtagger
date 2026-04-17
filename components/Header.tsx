'use client';

import Link from 'next/link';
import { Sparkles, Crown, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'test';

export function Header() {
  const { isPro, plan, usage, toggleProMode } = useApp();

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
          {/* Demo: Toggle Pro Mode - only in dev/test */}
          {isDevOrTest && (
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

          {!isPro && (
            <Link
              href="/pricing"
              className="hidden items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 sm:flex"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Link>
          )}

          {isPro && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-sm font-medium text-white">
              <Crown className="h-4 w-4" />
              {plan === 'business' ? 'Business' : 'Pro'}
            </div>
          )}

          {!isPro && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-medium">{usage.dailyUses}/{usage.maxUses}</span>
              <span className="hidden sm:inline">uses today</span>
            </div>
          )}

          {isPro && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-medium text-green-600 dark:text-green-400">Unlimited</span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
