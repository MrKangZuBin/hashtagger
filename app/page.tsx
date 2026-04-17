'use client';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PlatformSelector } from '@/components/PlatformSelector';
import { HashtagInput } from '@/components/HashtagInput';
import { HashtagResults } from '@/components/HashtagResults';
import { AppProvider } from '@/context/AppContext';

function MainContent() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <Hero />

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 dark:bg-gray-900 dark:shadow-gray-950/50">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Create Your Hashtags</h2>
              <p className="text-sm text-gray-500">
                Select your platform and describe your post
              </p>
            </div>

            <PlatformSelector />

            <div className="mt-6">
              <HashtagInput />
            </div>

            <HashtagResults />
          </div>

          {/* Pro Features CTA */}
          <ProUpgradeCTA />
        </section>
      </main>

      <footer className="border-t bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          <p>Powered by Zane • Built for creators</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <a
              href="https://t.me/+uNUUQQawnzkwY2Y1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600"
            >
              Telegram
            </a>
            <a
              href="https://x.com/sanKang29267869"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600"
            >
              X (Twitter)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProUpgradeCTA() {
  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h3 className="text-lg font-semibold">Unlock Pro Features</h3>
          <p className="mt-1 text-sm text-violet-100">
            Unlimited generations, image analysis, competition insights, and more
          </p>
        </div>
        <a
          href="/pricing"
          className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-medium text-violet-600 transition-transform hover:scale-105"
        >
          View Pricing
        </a>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
