// Banned hashtags that are limited or violate platform policies
export const BANNED_HASHTAGS = new Set([
  // Platform-limited hashtags
  'pushups', 'follow4follow', 'like4like', 'comment4comment', 's4s',
  'followme', 'likeforlike', 'instalike', 'likeforlikes', 'likeback',
  'followforfollow', 'followback', 'followforfollowback', 'followalways',
  'followmeplease', 'followmenext', 'pleasefollow', 'tagsforlikes',
  'igers', 'instalikes', 'instafollow', 'photooftheday', 'ootd',
  'picoftheday', 'instadaily', 'instamood', 'instagood', 'followshoutoutlikecomment',
  'spamforspam', 'spam4spam', 's4sl', 'l4l', 'f4f', 'c4c',
  'beautyblogger', 'fitnessblogger', 'foodblogger', 'travelblogger',
  'lifestyleblogger', 'fashionblogger', 'makeupblogger', 'skincareblogger',

  // Drugs and illegal substances
  'weed', 'cannabis', 'marijuana', 'cocaine', 'heroin', 'meth',
  'drugs', 'pillstore', 'pharmacy', 'rx', 'prescription',

  // Adult content
  'nsfw', 'adulting', 'hot', 'sexy', 'babe', 'babes', 'xxx',
  'nude', 'nudes', 'naked', 'lingerie', 'underwear', 'lingerie',

  // Weapons and violence
  'weapon', 'gun', 'firearm', 'rifle', 'pistol', 'knife', 'blade',
  'violence', 'fight', 'boxing', 'wrestling', 'mma', 'ufc',

  // Hate speech and discrimination
  'hate', 'racist', 'sexist', 'homophobic', 'transphobic',
  'discrimination', 'bigot', 'nazi', 'whitepower', 'blackpower',

  // Extreme and dangerous
  'thinspiration', 'proana', 'promia', 'bulimia', 'eatingdisorder',
  'selfharm', 'suicide', 'depression', 'anxiety', 'cutting',

  // Misinformation
  'flatearth', 'chemtrails', 'antivax', 'covidskeptic',

  // Spam and noise
  'love', 'happy', 'beautiful', 'amazing', 'awesome', 'cool',
  'best', 'great', 'good', 'nice', 'pretty', 'cute',

  // Restricted platform terms
  'teen', 'young', 'minor', 'adult', 'snapchat', 'tiktokverified',
]);

// Platform-specific tag count recommendations
export const PLATFORM_LIMITS = {
  instagram: { min: 3, max: 5, recommended: 5 },
  tiktok: { min: 3, max: 5, recommended: 3 },
  youtube: { min: 3, max: 3, recommended: 3 },
  twitter: { min: 1, max: 2, recommended: 2 },
} as const;

// Pricing tiers
export const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    plan: 'free' as const,
    features: [
      '10 generations per day',
      'Text-to-hashtags',
      'Basic categorization',
      'One-click copy',
    ],
  },
  {
    name: 'Pro',
    price: 9,
    yearlyPrice: 90,
    plan: 'pro' as const,
    highlighted: true,
    features: [
      'Unlimited generations',
      'Image analysis',
      'Banned tag filtering',
      'Multi-platform adapt',
      '30-day history',
      'Competition analysis',
    ],
  },
  {
    name: 'Business',
    price: 29,
    yearlyPrice: 290,
    plan: 'business' as const,
    features: [
      'Everything in Pro',
      'CSV bulk generation',
      '5 team members',
      'API access',
      'Custom prompts',
      'Priority support',
    ],
  },
];

// DeepSeek API configuration
export const DEEPSEEK_CONFIG = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  maxTokens: 500,
  temperature: 0.8,
};

// Alibaba DashScope (Qwen VL) API configuration for image/video analysis
export const ALIBABA_CONFIG = {
  apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  model: 'qwen-vl-max',
  maxTokens: 500,
  temperature: 0.7,
};
