'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Zap, Users, Crown } from 'lucide-react';
import { Header } from '@/components/Header';
import { PricingCard } from '@/components/PricingCard';
import { PRICING_TIERS } from '@/lib/constants';
import { AppProvider } from '@/context/AppContext';

function PricingContent() {
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
            Back to generator
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Choose the plan that fits your needs. Start free, upgrade when you need more power.
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
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  yearly
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  Save 17%
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
            <h2 className="text-center text-2xl font-bold">Compare Plans</h2>

            <div className="mt-8 overflow-hidden rounded-2xl border dark:border-gray-800">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Pro</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <ComparisonRow feature="Daily generations" free="10" pro="Unlimited" business="Unlimited" />
                  <ComparisonRow feature="Text-to-hashtags" free={true} pro={true} business={true} />
                  <ComparisonRow feature="Image analysis" free={false} pro={true} business={true} />
                  <ComparisonRow feature="Banned tag filter" free={false} pro={true} business={true} />
                  <ComparisonRow feature="Multi-platform" free={false} pro={true} business={true} />
                  <ComparisonRow feature="History" free={false} pro="30 days" business="30 days" />
                  <ComparisonRow feature="Competition analysis" free={false} pro={true} business={true} />
                  <ComparisonRow feature="CSV bulk generation" free={false} pro={false} business={true} />
                  <ComparisonRow feature="Team members" free={false} pro={false} business="5" />
                  <ComparisonRow feature="API access" free={false} pro={false} business={true} />
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <FAQItem
                question="How does the daily limit work?"
                answer="Free users get 10 generations per day, reset at midnight UTC. Pro and Business users have unlimited generations."
              />
              <FAQItem
                question="Can I cancel anytime?"
                answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, debit cards, and PayPal through our secure payment provider Lemon Squeezy."
              />
              <FAQItem
                question="Is there a free trial?"
                answer="Pro users can start with a 5-day money-back guarantee. If you're not satisfied, contact us for a full refund."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          <p>Powered by Zane • Built for creators</p>
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
}: {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
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
