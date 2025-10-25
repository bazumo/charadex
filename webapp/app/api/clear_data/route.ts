import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/storage';

export async function POST() {
  try {
    const data = readData();

    // Clear words, word occurrences, and sentences
    // Keep characters as they come from hanziDB and track seen counts
    data.words = {};
    data.wordOccurrences = {};
    data.sentences = {};

    // Reset character seen counts and word references
    for (const char in data.characters) {
      data.characters[char].seenCount = 0;
      data.characters[char].wordReferences = [];
    }

    writeData(data);

    return NextResponse.json({
      success: true,
      message: 'Successfully cleared all words, occurrences, and sentences. Character data has been reset.'
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
