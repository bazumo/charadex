import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ char: string }> }
) {
  try {
    const { char } = await params;
    const decodedChar = decodeURIComponent(char);

    const data = readData();
    const characterData = data.characters[decodedChar];

    if (!characterData) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // Get all words that contain this character
    const words = characterData.wordReferences.map(wordId => {
      const word = data.words[wordId];
      return word ? {
        id: word.id,
        word: word.word,
        meaning: word.meaning,
        seenCount: word.seenCount
      } : null;
    }).filter((word): word is NonNullable<typeof word> => word !== null);

    const response = {
      character: characterData.character,
      seenCount: characterData.seenCount,
      pinyin: characterData.pinyin,
      wordReferences: characterData.wordReferences,
      hanziData: characterData.frequencyRank ? {
        frequency_rank: characterData.frequencyRank,
        definition: characterData.definition || null,
        radical: characterData.radical || '',
        radical_code: characterData.radicalCode || '',
        stroke_count: characterData.strokeCount || '',
        hsk_level: characterData.hskLevel || ''
      } : null,
      words
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching character details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character details' },
      { status: 500 }
    );
  }
}
