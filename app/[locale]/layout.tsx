import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://hashtagger.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Hashtagger - AI-Powered Hashtag Generator",
  description: "The best hashtag generator for Instagram, TikTok, YouTube, and Twitter. Generate optimized hashtags with AI in 3 seconds and boost your reach.",
  keywords: ["hashtag generator", "hashtags", "instagram hashtags", "tiktok hashtags", "youtube hashtags", "ai hashtags", "social media tags"],
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'zh': `${BASE_URL}/zh`,
      'es': `${BASE_URL}/es`,
      'ja': `${BASE_URL}/ja`,
      'ko': `${BASE_URL}/ko`,
      'th': `${BASE_URL}/th`,
    },
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "Hashtagger - AI-Powered Hashtag Generator",
    description: "The best hashtag generator for Instagram, TikTok, YouTube, and Twitter. Generate optimized hashtags with AI in 3 seconds and boost your reach.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hashtagger - AI-Powered Hashtag Generator",
    description: "The best hashtag generator for Instagram, TikTok, YouTube, and Twitter. Generate optimized hashtags with AI in 3 seconds.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Hashtagger',
  description: 'AI-powered hashtag generator for Instagram, TikTok, YouTube, and Twitter',
  url: BASE_URL,
  applicationCategory: 'SocialMediaApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan with 10 daily generations',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '126',
  },
  features: [
    'AI-powered hashtag generation',
    'Multi-platform support (Instagram, TikTok, YouTube, Twitter)',
    'Banned tag filtering',
    'Competition analysis',
    'Image and video analysis',
  ],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="canonical" href={BASE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
