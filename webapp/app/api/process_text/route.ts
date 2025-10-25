import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/storage';
import { processTextWithAI, storeProcessedData } from '@/lib/ai-processor';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, url } = body;

    if (!text || !url) {
      return NextResponse.json(
        { error: 'Text and URL are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Process text with AI to extract sentences and words
    const processed = await processTextWithAI(text);

    // Store the processed data
    const data = readData();
    storeProcessedData(data, processed, url);
    writeData(data);

    return NextResponse.json({
      success: true,
      stats: {
        sentences: processed.sentences.length,
        words: processed.words.length,
        characters: processed.characters.size
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
