import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getDailyUsageKey(): string {
  const today = new Date().toISOString().split('T')[0];
  return `hashtagger_usage_${today}`;
}

export function getBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('hashtagger fingerprint', 2, 15);
  }
  return canvas.toDataURL();
}

export function parseHashtagsFromResponse(response: string): string[] {
  // Extract hashtags from AI response
  const hashtagRegex = /#[\w\u4e00-\u9fa5]+/g;
  const matches = response.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}
