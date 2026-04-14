import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, analyzeVideo } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, videoUrls } = body;

    if (!imageBase64 && !videoUrls) {
      return NextResponse.json(
        { error: 'Image or video is required' },
        { status: 400 }
      );
    }

    let keywords: string[] = [];

    if (imageBase64) {
      keywords = await analyzeImage(imageBase64);
    } else if (videoUrls && videoUrls.length > 0) {
      keywords = await analyzeVideo(videoUrls);
    }

    return NextResponse.json({
      keywords,
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
