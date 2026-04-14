'use client';

import { Camera, Music, Video, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { Platform } from '@/lib/types';

const platforms: { id: Platform; label: string; icon: typeof Camera }[] = [
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'tiktok', label: 'TikTok', icon: Music },
  { id: 'youtube', label: 'YouTube', icon: Video },
  { id: 'twitter', label: 'X / Twitter', icon: MessageCircle },
];

export function PlatformSelector() {
  const { platform, setPlatform, isPro } = useApp();

  const togglePlatform = (id: Platform) => {
    if (platform.includes(id)) {
      // Don't allow deselecting if it's the last one
      if (platform.length === 1) return;
      setPlatform(platform.filter(p => p !== id));
    } else {
      setPlatform([...platform, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => togglePlatform(id)}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
            platform.includes(id)
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
