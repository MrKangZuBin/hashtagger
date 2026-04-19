'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PlatformSelector } from '@/components/PlatformSelector';
import { HashtagInput } from '@/components/HashtagInput';
import { HashtagResults } from '@/components/HashtagResults';
import { AppProvider } from '@/context/AppContext';

function MainContent() {
  const t = useTranslations('home');
  const th = useTranslations('hero');
  const tf = useTranslations('footer');

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <Hero />

        {/* Introduction Section */}
        <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6 dark:from-violet-950/30 dark:to-fuchsia-950/30">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {th('intro')}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 dark:bg-gray-900 dark:shadow-gray-950/50">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{t('createHashtags')}</h2>
              <p className="text-sm text-gray-500">
                {t('selectPlatform')}
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

          {/* FAQ Section */}
          <FAQSection t={t} />
        </section>
      </main>

      <footer className="border-t bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          <p>{tf('poweredBy')} • {tf('builtForCreators')}</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <a
              href="https://t.me/+uNUUQQawnzkwY2Y1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600"
            >
              {tf('telegram')}
            </a>
            <a
              href="https://x.com/sanKang29267869"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600"
            >
              {tf('xTwitter')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProUpgradeCTA() {
  const t = useTranslations('home');

  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h3 className="text-lg font-semibold">{t('unlockProFeatures')}</h3>
          <p className="mt-1 text-sm text-violet-100">
            {t('unlimitedGenerations')}
          </p>
        </div>
        <a
          href="/pricing"
          className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-medium text-violet-600 transition-transform hover:scale-105"
        >
          {t('viewPricing')}
        </a>
      </div>
    </div>
  );
}

function FAQSection({ t }: { t: any }) {
  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
  ];

  return (
    <div className="mt-16">
      <h2 className="text-center text-2xl font-bold">{t('faqTitle')}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border p-4 dark:border-gray-800">
            <h3 className="font-semibold">{faq.q}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
          </div>
        ))}
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
