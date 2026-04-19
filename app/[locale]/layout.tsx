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

export const metadata: Metadata = {
  title: "Hashtagger - AI-Powered Hashtag Generator",
  description: "Generate perfect hashtags for Instagram, TikTok, YouTube, and Twitter with AI. Increase your reach and engagement with optimized tags.",
  keywords: ["hashtags", "instagram", "tiktok", "youtube", "social media", "ai", "generator"],
  openGraph: {
    type: "website",
    url: "https://hashtagger.ai",
    title: "Hashtagger - AI-Powered Hashtag Generator",
    description: "Generate perfect hashtags for Instagram, TikTok, YouTube, and Twitter with AI. Increase your reach and engagement with optimized tags.",
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
    description: "Generate perfect hashtags for Instagram, TikTok, YouTube, and Twitter with AI.",
    images: ["/images/og-image.png"],
  },
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
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
