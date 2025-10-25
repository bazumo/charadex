import { NextResponse } from 'next/server';
import { readData } from '@/lib/storage';
import { COMMON_CHARACTERS, getInitialCharacterData } from '@/lib/common-characters';

export async function GET() {
  try {
    const data = readData();

    // Initialize characters if empty
    if (Object.keys(data.characters).length === 0) {
      data.characters = getInitialCharacterData();
    }

    // Convert to array and sort by common character order
    const charactersArray = COMMON_CHARACTERS.map(char =>
      data.characters[char] || {
        character: char,
        seenCount: 0,
        pinyin: '',
        wordReferences: []
      }
    );

    return NextResponse.json(charactersArray);
  } catch (error) {
    console.error('Error reading characters:', error);
    return NextResponse.json({ error: 'Failed to load characters' }, { status: 500 });
  }
}
