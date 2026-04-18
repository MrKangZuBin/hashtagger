'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Hashtag, Platform, Plan, UserUsage } from '@/lib/types';

interface AppState {
  // User state
  plan: Plan;
  isPro: boolean;
  usage: UserUsage;

  // Generation state
  hashtags: Hashtag[];
  isGenerating: boolean;
  error: string | null;

  // Platform (array for multi-select)
  platform: Platform[];

  // History (Pro feature)
  history: Array<{ text: string; hashtags: Hashtag[]; timestamp: Date }>;

  // Media analysis result (Pro feature)
  mediaAnalysisResult: {
    titles: string[];
    themes: string[];
    description: string;
  } | null;
}

interface AppContextType extends AppState {
  generateHashtags: (text: string) => Promise<void>;
  setPlatform: (platform: Platform | Platform[]) => void;
  clearHashtags: () => void;
  copyToClipboard: () => Promise<boolean>;
  resetUsage: () => void;
  toggleProMode: () => void;
  setHashtagsDirectly: (hashtags: Hashtag[]) => void;
  deleteHashtag: (index: number) => void;
  setMediaAnalysisResult: (result: { titles: string[]; themes: string[]; description: string } | null) => void;
}

const defaultUsage: UserUsage = {
  dailyUses: 0,
  maxUses: 10,
  isPro: false,
  plan: 'free',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    plan: 'free',
    isPro: false,
    usage: defaultUsage,
    hashtags: [],
    isGenerating: false,
    error: null,
    platform: ['instagram'],
    history: [],
    mediaAnalysisResult: null,
  });

  const mounted = useRef(false);

  // Load usage from localStorage on mount
  useEffect(() => {
    mounted.current = true;
    const savedUsage = localStorage.getItem('hashtagger_usage');
    const savedPlan = localStorage.getItem('hashtagger_user_plan');
    const authToken = localStorage.getItem('auth_token');

    if (savedUsage) {
      try {
        const parsed = JSON.parse(savedUsage);
        const today = new Date().toISOString().split('T')[0];

        if (parsed.date !== today) {
          localStorage.setItem('hashtagger_usage', JSON.stringify({ date: today, uses: 0 }));
        } else {
          setState(prev => ({
            ...prev,
            usage: {
              ...prev.usage,
              dailyUses: parsed.uses,
            },
          }));
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // If logged in, fetch user info from server
    if (authToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const userPlan = data.user.plan;
            const isProPlan = userPlan !== 'FREE';
            setState(prev => ({
              ...prev,
              plan: userPlan,
              isPro: isProPlan,
              usage: { ...prev.usage, maxUses: isProPlan ? 999999 : prev.usage.maxUses, isPro: isProPlan },
            }));
          }
        })
        .catch(console.error);
    } else if (savedPlan === 'pro' || savedPlan === 'business') {
      setState(prev => ({
        ...prev,
        plan: savedPlan,
        isPro: true,
        usage: { ...prev.usage, maxUses: 999999, isPro: true },
      }));
    }
  }, []);

  const generateHashtags = useCallback(async (text: string) => {
    if (!text.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a description' }));
      return;
    }

    // Check usage limits for free users
    if (!state.isPro && state.usage.dailyUses >= state.usage.maxUses) {
      setState(prev => ({ ...prev, error: 'Daily limit reached. Upgrade to Pro for unlimited generations!' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null, mediaAnalysisResult: null }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          platform: state.platform,
          includeBanned: state.isPro,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      // Update usage for free users
      if (!state.isPro) {
        const newUses = state.usage.dailyUses + 1;
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('hashtagger_usage', JSON.stringify({ date: today, uses: newUses }));
      }

      setState(prev => ({
        ...prev,
        hashtags: data.hashtags || [],
        isGenerating: false,
        usage: {
          ...prev.usage,
          dailyUses: state.isPro ? prev.usage.dailyUses : prev.usage.dailyUses + 1,
        },
        history: prev.isPro ? [...prev.history, { text, hashtags: data.hashtags || [], timestamp: new Date() }].slice(-30) : prev.history,
      }));
    } catch (err) {
      console.error('Generate error:', err);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'An error occurred. Please try again.',
      }));
    }
  }, [state.platform, state.isPro, state.usage.dailyUses, state.usage.maxUses]);

  const setPlatform = useCallback((platform: Platform | Platform[]) => {
    setState(prev => ({ ...prev, platform: Array.isArray(platform) ? platform : [platform] }));
  }, []);

  const clearHashtags = useCallback(() => {
    setState(prev => ({ ...prev, hashtags: [], error: null, mediaAnalysisResult: null }));
  }, []);

  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (state.hashtags.length === 0) return false;

    const tagsString = state.hashtags.map(h => h.tag).join(' ');
    try {
      await navigator.clipboard.writeText(tagsString);
      return true;
    } catch {
      return false;
    }
  }, [state.hashtags]);

  const resetUsage = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('hashtagger_usage', JSON.stringify({ date: today, uses: 0 }));
    setState(prev => ({
      ...prev,
      usage: { ...prev.usage, dailyUses: 0 },
    }));
  }, []);

  const toggleProMode = useCallback(() => {
    setState(prev => {
      if (prev.isPro) {
        // Downgrade to free
        localStorage.removeItem('hashtagger_user_plan');
        return {
          ...prev,
          plan: 'free',
          isPro: false,
          usage: { ...prev.usage, maxUses: 10, isPro: false },
        };
      } else {
        // Upgrade to Pro (demo mode)
        localStorage.setItem('hashtagger_user_plan', 'pro');
        return {
          ...prev,
          plan: 'pro',
          isPro: true,
          usage: { ...prev.usage, maxUses: 999999, isPro: true },
        };
      }
    });
  }, []);

  const setHashtagsDirectly = useCallback((hashtags: Hashtag[]) => {
    setState(prev => ({
      ...prev,
      hashtags,
      isGenerating: false,
      error: null,
    }));
  }, []);

  const setMediaAnalysisResult = useCallback((result: { titles: string[]; themes: string[]; description: string } | null) => {
    setState(prev => ({
      ...prev,
      mediaAnalysisResult: result,
    }));
  }, []);

  const deleteHashtag = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index),
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        generateHashtags,
        setPlatform,
        clearHashtags,
        copyToClipboard,
        resetUsage,
        toggleProMode,
        setHashtagsDirectly,
        deleteHashtag,
        setMediaAnalysisResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
