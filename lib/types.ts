export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter';

export type Plan = 'free' | 'pro' | 'business';

export interface Hashtag {
  tag: string;
  category: 'popular' | 'niche' | 'specific';
  competition?: 'low' | 'medium' | 'high';
  reach?: number;
  platform?: Platform; // Which platform this hashtag is best for
}

export interface GenerationRequest {
  text: string;
  platform: Platform | Platform[];
  includeBanned?: boolean;
}

export interface GenerationResult {
  hashtags: Hashtag[];
  remainingUses: number;
  isPro: boolean;
}

export interface UserUsage {
  dailyUses: number;
  maxUses: number;
  isPro: boolean;
  plan: Plan;
}

export interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  plan: Plan;
}

export interface MediaAnalysisResult {
  hashtags: Hashtag[];
  titles: string[];
  themes: string[];
  description: string;
}
