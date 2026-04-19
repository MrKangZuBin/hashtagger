import { getRequestConfig } from 'next-intl/server';
import en from '../messages/en.json';
import zh from '../messages/zh.json';
import es from '../messages/es.json';
import ja from '../messages/ja.json';
import ko from '../messages/ko.json';
import th from '../messages/th.json';

export const locales = ['en', 'zh', 'es', 'ja', 'ko', 'th'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const messages: Record<string, any> = {
  en,
  zh,
  es,
  ja,
  ko,
  th,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: messages[locale],
  };
});
