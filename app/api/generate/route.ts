import { NextRequest, NextResponse } from 'next/server';
import { generateHashtags } from '@/lib/deepseek';
import type { Platform, Hashtag } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platform, includeBanned = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const validPlatforms: Platform[] = ['instagram', 'tiktok', 'youtube', 'twitter'];

    // Handle both single platform and array of platforms
    let selectedPlatforms: Platform[];
    if (Array.isArray(platform)) {
      selectedPlatforms = platform.filter(p => validPlatforms.includes(p));
      if (selectedPlatforms.length === 0) selectedPlatforms = ['instagram'];
    } else {
      selectedPlatforms = validPlatforms.includes(platform) ? [platform] : ['instagram'];
    }

    // Generate hashtags for each platform and combine
    const allHashtags = await Promise.all(
      selectedPlatforms.map(async (p) => {
        const hashtags = await generateHashtags(text, p, !includeBanned);
        // Mark each hashtag with its source platform
        return hashtags.map(h => ({ ...h, platform: p } as Hashtag));
      })
    );

    // If multiple platforms, group hashtags by platform
    // If single platform, no need to mark
    const mergedHashtags = allHashtags.flat();
    const uniqueTags = new Map();
    mergedHashtags.forEach(h => {
      const key = h.tag.toLowerCase();
      if (!uniqueTags.has(key)) {
        uniqueTags.set(key, h);
      } else {
        // If tag exists, add platform to existing tag's platforms
        const existing = uniqueTags.get(key);
        if (existing.platform && h.platform && existing.platform !== h.platform) {
          // Keep track of multiple platforms for this tag
          existing.platforms = existing.platforms || [existing.platform];
          if (!existing.platforms.includes(h.platform)) {
            existing.platforms.push(h.platform);
          }
        }
      }
    });

    return NextResponse.json({
      hashtags: Array.from(uniqueTags.values()),
      platforms: selectedPlatforms,
      success: true,
    });
  } catch (error) {
    console.error('Generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service not configured. Please add your DeepSeek API key.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
