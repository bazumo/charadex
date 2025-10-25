import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    const { word } = await params;
    const decodedWord = decodeURIComponent(word);

    const data = readData();

    // Find the word in the data
    const wordEntry = Object.values(data.words).find(w => w.word === decodedWord);

    if (!wordEntry) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    // Get all sentences that contain this word
    const sentences = wordEntry.sentenceReferences.map(sentenceId => {
      const sentence = data.sentences[sentenceId];
      return sentence ? {
        id: sentence.id,
        text: sentence.text,
        source: sentence.source
      } : null;
    }).filter(sentence => sentence !== null);

    // Get character information for each character in the word
    const characters = Array.from(decodedWord).map(char => {
      const characterData = data.characters[char];
      return {
        character: char,
        pinyin: characterData?.pinyin || ''
      };
    });

    const response = {
      id: wordEntry.id,
      word: wordEntry.word,
      meaning: wordEntry.meaning,
      seenCount: wordEntry.seenCount,
      sentences,
      characters
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching word details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word details' },
      { status: 500 }
    );
  }
}
