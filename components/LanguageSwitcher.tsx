'use client';

import { useTransition, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [showDropdown, setShowDropdown] = useState(false);

  const currentLocale = pathname.split('/')[1] || 'en';

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
      router.push(newPath);
    });
    setShowDropdown(false);
  };

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
          'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
          isPending && 'opacity-50'
        )}
        disabled={isPending}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLocaleChange(lang.code)}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  lang.code === currentLocale && 'text-violet-600 dark:text-violet-400'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
