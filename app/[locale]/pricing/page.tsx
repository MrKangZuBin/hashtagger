'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Sparkles, Zap, Users, Crown } from 'lucide-react';
import { Header } from '@/components/Header';
import { PricingCard } from '@/components/PricingCard';
import { PRICING_TIERS } from '@/lib/constants';
import { AppProvider } from '@/context/AppContext';

function PricingContent() {
  const t = useTranslations('pricing');
  const tf = useTranslations('footer');
  const [yearly, setYearly] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToGenerator')}
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-white p-1 shadow-sm dark:bg-gray-900">
              <button
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !yearly
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {t('monthly')}
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  yearly
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {t('yearly')}
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  {t('save17')}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.name} tier={tier} yearly={yearly} />
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold">{t('comparePlans')}</h2>

            <div className="mt-8 overflow-hidden rounded-2xl border dark:border-gray-800">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t('feature')}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">{t('free')}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">{t('pro')}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">{t('business')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <ComparisonRow feature={t('dailyGenerations')} free="10" pro={t('unlimited')} business={t('unlimited')} t={t} />
                  <ComparisonRow feature={t('textToHashtags')} free={true} pro={true} business={true} t={t} />
                  <ComparisonRow feature={t('imageAnalysis')} free={false} pro={true} business={true} t={t} />
                  <ComparisonRow feature={t('bannedTagFilter')} free={false} pro={true} business={true} t={t} />
                  <ComparisonRow feature={t('multiPlatform')} free={false} pro={true} business={true} t={t} />
                  <ComparisonRow feature={t('history')} free={false} pro={`30 ${t('days')}`} business={`30 ${t('days')}`} t={t} />
                  <ComparisonRow feature={t('competitionAnalysis')} free={false} pro={true} business={true} t={t} />
                  <ComparisonRow feature={t('csvBulkGeneration')} free={false} pro={false} business={true} t={t} />
                  <ComparisonRow feature={t('teamMembers')} free={false} pro={false} business="5" t={t} />
                  <ComparisonRow feature={t('apiAccess')} free={false} pro={false} business={true} t={t} />
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold">{t('faq')}</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <FAQItem
                question={t('faq1Q')}
                answer={t('faq1A')}
              />
              <FAQItem
                question={t('faq2Q')}
                answer={t('faq2A')}
              />
              <FAQItem
                question={t('faq3Q')}
                answer={t('faq3A')}
              />
              <FAQItem
                question={t('faq4Q')}
                answer={t('faq4A')}
              />
            </div>
          </div>
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

function ComparisonRow({
  feature,
  free,
  pro,
  business,
  t,
}: {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
  t: any;
}) {
  const Cell = ({ value }: { value: string | boolean }) => {
    if (typeof value === 'boolean') {
      return (
        <td className="px-6 py-4 text-center">
          {value ? (
            <Zap className="mx-auto h-5 w-5 text-violet-600" />
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
      );
    }
    return <td className="px-6 py-4 text-center text-sm">{value}</td>;
  };

  return (
    <tr className="dark:text-gray-300">
      <td className="px-6 py-4 text-sm font-medium">{feature}</td>
      <Cell value={free} />
      <Cell value={pro} />
      <Cell value={business} />
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border p-4 dark:border-gray-800">
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{answer}</p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <AppProvider>
      <PricingContent />
    </AppProvider>
  );
}
