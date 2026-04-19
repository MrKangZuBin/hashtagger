'use client';

import { useTranslations } from 'next-intl';
import { Zap, Shield, Clock, TrendingUp } from 'lucide-react';

export function Hero() {
  const t = useTranslations('hero');

  const features = [
    {
      icon: Zap,
      titleKey: '3SecondGeneration',
      descKey: '3SecondGenerationDesc',
    },
    {
      icon: Shield,
      titleKey: 'bannedTagFilter',
      descKey: 'bannedTagFilterDesc',
    },
    {
      icon: Clock,
      titleKey: 'multiPlatform',
      descKey: 'multiPlatformDesc',
    },
    {
      icon: TrendingUp,
      titleKey: 'competitionAnalysis',
      descKey: 'competitionAnalysisDesc',
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            {t('titleGradient')}
          </span>{' '}
          {t('titleSuffix')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 font-semibold">{t(feature.titleKey)}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t(feature.descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
