import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, analyzeImages } from '@/lib/deepseek';
import type { MediaAnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageBase64s, videoUrls } = body;

    if (!imageBase64 && !imageBase64s && !videoUrls) {
      return NextResponse.json(
        { error: 'Image or video is required' },
        { status: 400 }
      );
    }

    let result: MediaAnalysisResult;

    if (imageBase64) {
      result = await analyzeImage(imageBase64);
    } else if (imageBase64s && imageBase64s.length > 0) {
      // Multiple frames from video
      result = await analyzeImages(imageBase64s);
    } else if (videoUrls && videoUrls.length > 0) {
      // Direct video URL (short videos only)
      const { analyzeVideo } = await import('@/lib/deepseek');
      result = await analyzeVideo(videoUrls);
    } else {
      return NextResponse.json(
        { error: 'No valid input provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      keywords: result.hashtags,
      titles: result.titles,
      themes: result.themes,
      description: result.description,
      success: true,
    });
  } catch (error) {
    console.error('Media analysis error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('configured')) {
        return NextResponse.json(
          { error: error.message },
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
