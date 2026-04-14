'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Image, X, Upload, Video } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { Hashtag } from '@/lib/types';

const SAMPLE_PROMPTS = [
  'Just finished a tough workout at the gym, feeling accomplished and energized!',
  'Made homemade pasta for the first time - it turned out amazing!',
  'Sunset at the beach today, absolutely beautiful view',
  'New recipe: healthy avocado toast with eggs for breakfast',
  'Working from home with my cute dog sleeping next to me',
];

export function HashtagInput() {
  const { generateHashtags, isGenerating, error, isPro, setHashtagsDirectly } = useApp();
  const [text, setText] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      await generateHashtags(text);
    }
  };

  const fillSample = (sample: string) => {
    setText(sample);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your post... e.g., 'Just finished a tough workout at the gym, feeling accomplished!'"
            className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-white p-4 pr-24 text-base transition-colors placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500"
            rows={4}
          />

          <div className="absolute right-3 top-3 flex gap-2">
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isGenerating || !text.trim()}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Media Upload Button - Pro feature */}
      {isPro && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowMediaUpload(!showMediaUpload)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              showMediaUpload
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            )}
          >
            <Upload className="h-4 w-4" />
            {showMediaUpload ? 'Hide Media Upload' : 'Upload Image/Video (Pro)'}
          </button>
        </div>
      )}

      {showMediaUpload && isPro && (
        <MediaUploader
          mediaType={mediaType}
          onMediaTypeChange={setMediaType}
          onHashtagsGenerated={setHashtagsDirectly}
        />
      )}

      {/* Sample prompts */}
      <div className="mt-4">
        <p className="mb-2 text-xs text-gray-500">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fillSample(sample)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {sample.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
          {error.toLowerCase().includes('limit') && (
            <a href="/pricing" className="ml-2 font-medium underline">
              Upgrade to Pro
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function MediaUploader({
  mediaType,
  onMediaTypeChange,
  onHashtagsGenerated,
}: {
  mediaType: 'image' | 'video';
  onMediaTypeChange: (type: 'image' | 'video') => void;
  onHashtagsGenerated: (hashtags: Hashtag[]) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === 'image' && file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    if (mediaType === 'video' && file.size > 50 * 1024 * 1024) {
      alert('Video must be less than 50MB');
      return;
    }

    // Show preview
    if (mediaType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(URL.createObjectURL(file));
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      if (mediaType === 'image') {
        const base64 = await fileToBase64(file);
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Image analysis failed');
        }

        if (data.keywords && data.keywords.length > 0) {
          // Convert keywords to hashtag format
          const hashtags: Hashtag[] = data.keywords.map((tag: string, index: number) => ({
            tag: tag.startsWith('#') ? tag : `#${tag}`,
            category: index < 5 ? 'popular' : index < 10 ? 'niche' : 'specific',
            competition: index < 4 ? 'high' : index > 12 ? 'low' : 'medium',
            reach: index < 4 ? 15000000 : index > 12 ? 50000 : 2000000,
          }));
          onHashtagsGenerated(hashtags);
          setPreview(null);
        } else {
          throw new Error('No hashtags generated. Try a clearer image.');
        }
      }
    } catch (err) {
      console.error('Media analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Media analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVideoUrlAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrls: [videoUrl] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video analysis failed');
      }

      if (data.keywords && data.keywords.length > 0) {
        // Convert keywords to hashtag format
        const hashtags: Hashtag[] = data.keywords.map((tag: string, index: number) => ({
          tag: tag.startsWith('#') ? tag : `#${tag}`,
          category: index < 5 ? 'popular' : index < 10 ? 'niche' : 'specific',
          competition: index < 4 ? 'high' : index > 12 ? 'low' : 'medium',
          reach: index < 4 ? 15000000 : index > 12 ? 50000 : 2000000,
        }));
        onHashtagsGenerated(hashtags);
        setVideoUrl('');
      } else {
        throw new Error('No hashtags generated. Try a different URL.');
      }
    } catch (err) {
      console.error('Video analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Video analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
      {/* Media type toggle */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => { onMediaTypeChange('image'); setShowUrlInput(false); }}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
            mediaType === 'image'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          <Image className="h-4 w-4" />
          Image
        </button>
        <button
          type="button"
          onClick={() => { onMediaTypeChange('video'); setShowUrlInput(true); }}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
            mediaType === 'video'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          <Video className="h-4 w-4" />
          Video
        </button>
      </div>

      {mediaType === 'image' ? (
        <>
          {/* Image Preview */}
          <div className="mb-4 flex justify-center">
            {preview ? (
              <img src={preview} alt="Preview" className="h-40 w-40 rounded-lg object-cover" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}

          <div className="flex justify-center">
            <label className="cursor-pointer">
              <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                {isAnalyzing ? 'Analyzing...' : 'Choose File'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isAnalyzing}
              />
            </label>
          </div>

          <p className="mt-2 text-center text-xs text-gray-500">
            JPG/PNG, max 5MB
          </p>
        </>
      ) : (
        <>
          {/* Video URL input */}
          <div className="mb-4">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              onClick={handleVideoUrlAnalyze}
              disabled={isAnalyzing || !videoUrl.trim()}
              className="mt-2 w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Video URL'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500">
            Enter a direct video URL for analysis
          </p>
        </>
      )}

      {error && mediaType === 'image' && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
