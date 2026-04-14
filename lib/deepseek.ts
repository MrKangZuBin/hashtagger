import OpenAI from 'openai';
import { DEEPSEEK_CONFIG, ALIBABA_CONFIG, BANNED_HASHTAGS, PLATFORM_LIMITS } from './constants';
import { parseHashtagsFromResponse } from './utils';
import type { Hashtag, Platform } from './types';

// Initialize OpenAI client for Aliyun DashScope (compatible mode)
const aliyunClient = new OpenAI({
  apiKey: process.env.ALIYUN_API_KEY || '',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a social media hashtag expert. Generate 15-20 relevant hashtags for the given post.
Rules:
- Mix of popular, niche, and specific tags
- Avoid banned or limited hashtags
- Format: just the hashtags separated by spaces, nothing else
- Use the platform's best practices`;

const IMAGE_ANALYSIS_PROMPT = `Analyze this image and describe:
- Objects present
- Scene/setting
- Actions/activities
- Mood/emotion
- Color/style
Output 5-8 keywords in English that can be used to generate social media hashtags.`;

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; image_url?: { url: string }; text?: string }>;
}

export async function generateHashtags(
  text: string,
  platform: Platform,
  filterBanned: boolean = true
): Promise<Hashtag[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DeepSeek API key not configured');
  }

  const platformContext = getPlatformContext(platform);
  const userMessage = `${platformContext}\n\nPost description: ${text}`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_CONFIG.model,
      messages,
      max_tokens: DEEPSEEK_CONFIG.maxTokens,
      temperature: DEEPSEEK_CONFIG.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  let hashtags = parseHashtagsFromResponse(content);

  // Filter banned hashtags if requested
  if (filterBanned) {
    hashtags = hashtags.filter(tag => !BANNED_HASHTAGS.has(tag.toLowerCase()));
  }

  // Categorize hashtags
  return categorizeHashtags(hashtags);
}

export async function analyzeImage(imageBase64: string): Promise<string[]> {
  if (!process.env.ALIYUN_API_KEY) {
    throw new Error('Aliyun API key not configured. Please add ALIYUN_API_KEY to .env.local');
  }

  try {
    const response = await aliyunClient.chat.completions.create({
      model: 'qwen-vl-max',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: 'Generate 5-8 relevant social media hashtags for this image. Output ONLY the hashtags in English, separated by spaces, nothing else. Example: #fashion #style #love #photo #instagood' },
          ],
        },
      ],
      max_tokens: ALIBABA_CONFIG.maxTokens,
      temperature: ALIBABA_CONFIG.temperature,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('DashScope response:', content);

    // Parse hashtags from response
    const hashtags = content
      .split(/[\s,#]+/)
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0 && k.length < 30 && !k.startsWith('http'))
      .map((k: string) => k.startsWith('#') ? k : `#${k}`);

    return hashtags.slice(0, 8);
  } catch (error) {
    console.error('DashScope API error:', error);
    throw error;
  }
}

export async function analyzeVideo(videoUrls: string[]): Promise<string[]> {
  if (!process.env.ALIYUN_API_KEY) {
    throw new Error('Aliyun API key not configured. Please add ALIYUN_API_KEY to .env.local');
  }

  try {
    // Use type assertion for DashScope-specific video content part
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await aliyunClient.chat.completions.create({
      model: 'qwen-vl-max-latest',
      messages: [
        {
          role: 'user',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: [
            { type: 'video', video: videoUrls } as any,
            { type: 'text', text: 'Generate 5-8 relevant social media hashtags for this video. Output ONLY the hashtags in English, separated by spaces, nothing else. Example: #fashion #style #love #video #trending' },
          ],
        },
      ],
      max_tokens: ALIBABA_CONFIG.maxTokens,
      temperature: ALIBABA_CONFIG.temperature,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('DashScope video response:', content);

    const keywords = content
      .split(/[,\n]/)
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0 && k.length < 30);

    return keywords.slice(0, 8);
  } catch (error) {
    console.error('DashScope API error:', error);
    throw error;
  }
}

function getPlatformContext(platform: Platform): string {
  const contexts = {
    instagram: 'Platform: Instagram. Use 3-5 trending/mix tags. Focus on visual appeal and lifestyle.',
    tiktok: 'Platform: TikTok. Use 3-5 searchable/topic tags. Mix trending and niche.',
    youtube: 'Platform: YouTube Shorts. Use exactly 3 core keyword tags.',
    twitter: 'Platform: Twitter/X. Use 1-2 hashtag(s). Keep it brief and relevant.',
  };
  return contexts[platform];
}

function categorizeHashtags(hashtags: string[]): Hashtag[] {
  // Balanced categorization based on position and tag characteristics
  const popularTags = ['trending', 'viral', 'fyp', 'foryou', 'explore', 'popular', 'fashion', 'love', 'instagood', 'photooftheday'];
  const nicheTags = ['life', 'style', 'world', 'community', 'fitness', 'food', 'travel', 'photography', 'art', 'music'];

  return hashtags.map((tag, index) => {
    const tagLower = tag.toLowerCase();
    let category: 'popular' | 'niche' | 'specific' = 'specific';

    // Use position-based distribution: first 5 are popular, middle are niche, rest are specific
    if (index < 5) {
      category = 'popular';
    } else if (index < 10) {
      category = 'niche';
    } else {
      category = 'specific';
    }

    // Override category based on tag content if it matches
    if (popularTags.some(p => tagLower.includes(p))) {
      category = 'popular';
    } else if (nicheTags.some(n => tagLower.includes(n))) {
      category = 'niche';
    }

    // Assign competition level based on position (simple heuristic)
    let competition: 'low' | 'medium' | 'high' = 'medium';
    if (index < 4) competition = 'high';
    else if (index > 12) competition = 'low';

    // Estimate reach based on category and competition
    let reach = 500000;
    if (competition === 'high') reach = 15000000;
    else if (competition === 'low') reach = 50000;
    else reach = 2000000;

    return {
      tag,
      category,
      competition,
      reach,
    };
  });
}
