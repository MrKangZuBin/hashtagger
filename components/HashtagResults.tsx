'use client';

import { useState } from 'react';
import { Copy, Check, Trash2, TrendingUp, Lock, Info, Camera, Music, Video, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { PLATFORM_LIMITS } from '@/lib/constants';
import type { Hashtag, Platform } from '@/lib/types';

const platformIcons = {
  instagram: Camera,
  tiktok: Music,
  youtube: Video,
  twitter: MessageCircle,
};

const platformNames = {
  instagram: 'IG',
  tiktok: 'TikTok',
  youtube: 'YT',
  twitter: 'X',
};

export function HashtagResults() {
  const { hashtags, platform, clearHashtags, copyToClipboard, isPro, deleteHashtag } = useApp();
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showGuide, setShowGuide] = useState(false);

  if (hashtags.length === 0) return null;

  const platforms = Array.isArray(platform) ? platform : [platform];

  const filteredHashtags = hashtags.filter((h) =>
    filter === 'all' ? true : h.competition === filter
  );

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Generated Hashtags</h2>
            <p className="text-sm text-gray-500">
              {hashtags.length} tags for {platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
            </p>
          </div>

          {/* Competition filter buttons */}
          <div className="flex gap-2">
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              {(['all', 'high', 'medium', 'low'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                    filter === f
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  )}
                >
                  {f === 'all' ? 'All' : f === 'high' ? 'High' : f === 'medium' ? 'Medium' : 'Low'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Competition Analysis Guide */}
        {isPro && (
          <div className="mb-4 rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 p-3 dark:from-violet-950/30 dark:to-fuchsia-950/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  <span className="font-medium text-violet-700 dark:text-violet-300">How to Use These Hashtags</span>
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-violet-400 hover:text-violet-600"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                {showGuide && (
                  <div className="mt-2 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium text-red-500">Red (High Competition):</span> Very popular tags with millions of posts. Hard to get noticed unless you have a large following. Best for established accounts.</p>
                    <p><span className="font-medium text-yellow-500">Yellow (Medium Competition):</span> Good balance of reach and competition. Ideal for growing accounts. Mix with some low competition tags.</p>
                    <p><span className="font-medium text-green-500">Green (Low Competition):</span> Easier to rank for. Great for new accounts or niche content. Use these to build initial engagement.</p>
                    <p className="border-t pt-2 dark:border-gray-700"><span className="font-medium">Pro tip:</span> Mix high, medium, and low competition tags (about 2-3 of each) for best results across all platforms.</p>
                  </div>
                )}

                {!showGuide && (
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-gray-600 dark:text-gray-400">High - Hard to rank</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-400">Medium - Balanced</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">Low - Easy to rank</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Free user upgrade hint */}
        {!isPro && (
          <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="h-4 w-4" />
              <span>Competition analysis & banned tag filtering are Pro features</span>
            </div>
          </div>
        )}

        {/* Hashtag Tags - colors based on competition, show platform if multi-select */}
        <div className="mb-4 flex flex-wrap gap-2">
          {filteredHashtags.map((hashtag, index) => {
            const originalIndex = hashtags.findIndex(h => h.tag === hashtag.tag);
            return (
              <HashtagTag
                key={`${hashtag.tag}-${originalIndex}`}
                hashtag={hashtag}
                isPro={isPro}
                multiPlatform={platforms.length > 1}
                onDelete={() => deleteHashtag(originalIndex)}
              />
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t pt-4 dark:border-gray-800">
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              copied
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
            )}
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy All
              </span>
            )}
          </button>

          <button
            onClick={clearHashtags}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function HashtagTag({ hashtag, isPro, multiPlatform, onDelete }: { hashtag: Hashtag; isPro: boolean; multiPlatform: boolean; onDelete?: () => void }) {
  const competitionColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  };

  const dotColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  // Get platforms for this hashtag
  const tagPlatforms: Platform[] = (hashtag as any).platforms || (hashtag.platform ? [hashtag.platform] : []);

  return (
    <div
      className={cn(
        'group relative rounded-full px-2 py-1.5 pr-2 text-sm font-medium transition-all hover:scale-105',
        competitionColors[hashtag.competition || 'medium']
      )}
    >
      <div className="flex items-center gap-1.5">
        <span>{hashtag.tag}</span>

        {/* Competition dot */}
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            dotColors[hashtag.competition || 'medium']
          )}
        />

        {/* Platform badges for multi-platform */}
        {multiPlatform && tagPlatforms.length > 0 && (
          <div className="ml-1 flex gap-0.5">
            {tagPlatforms.slice(0, 2).map((p) => {
              const Icon = platformIcons[p];
              return (
                <span
                  key={p}
                  className="flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[10px] font-bold dark:bg-white/20"
                  title={platformNames[p]}
                >
                  {platformNames[p]}
                </span>
              );
            })}
            {tagPlatforms.length > 2 && (
              <span className="flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[10px] font-bold dark:bg-white/20">
                +{tagPlatforms.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[10px] opacity-0 transition-opacity hover:bg-black/20 group-hover:opacity-100 dark:bg-white/20 dark:hover:bg-white/30"
          >
            ×
          </button>
        )}
      </div>

      {/* Tooltip with reach and platforms */}
      {isPro && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-white dark:text-gray-900">
          <div className="font-medium">{(hashtag.reach! / 1000000).toFixed(1)}M potential reach</div>
          {tagPlatforms.length > 0 && (
            <div className="mt-1 text-gray-400 dark:text-gray-600">
              Best for: {tagPlatforms.map(p => platformNames[p]).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
