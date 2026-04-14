'use client';

import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PricingTier } from '@/lib/types';

export function PricingCard({ tier, yearly = false }: { tier: PricingTier; yearly?: boolean }) {
  const price = yearly ? tier.yearlyPrice : tier.price;
  const period = yearly ? '/year' : tier.price === 0 ? 'forever' : '/month';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all',
        tier.highlighted
          ? 'border-violet-500 shadow-xl shadow-violet-500/10 dark:border-violet-400 dark:shadow-violet-500/20'
          : 'border-gray-200 dark:border-gray-800'
      )}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-gray-500">{period}</span>
        </div>
        {yearly && price > 0 && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Save ${(tier.price * 12 - tier.yearlyPrice).toFixed(0)}/year
          </p>
        )}
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={tier.price === 0 ? '/?upgrade=free' : `/checkout/${tier.plan}?yearly=${yearly}`}
        className={cn(
          'block w-full rounded-lg py-3 text-center text-sm font-medium transition-all',
          tier.highlighted
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
        )}
      >
        {tier.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
      </a>
    </div>
  );
}
