import { NextRequest, NextResponse } from 'next/server';
import { processTextWithAI } from '@/lib/ai-processor';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  requestLog.set(ip, recent);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return true;

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later (max 5 requests per hour).' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { text, url } = body;

    if (!text || !url) {
      return NextResponse.json(
        { error: 'Text and URL are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!/[\u4e00-\u9fa5]/.test(text)) {
      return NextResponse.json(
        { error: 'No Chinese characters found in the input.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text too long. Please limit to 2000 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const processed = await processTextWithAI(text);

    return NextResponse.json({
      success: true,
      processed: {
        sentences: processed.sentences,
        words: processed.words.map(w => ({ word: w.word, meaning: w.meaning })),
        characters: Array.from(processed.characters),
      }
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500, headers: corsHeaders }
    );
  }
}
