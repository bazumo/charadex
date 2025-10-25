export interface Character {
  character: string;
  seenCount: number;
  pinyin: string;
  wordReferences: string[]; // word IDs
  // HanziDB metadata
  frequencyRank?: string;
  definition?: string | null;
  radical?: string;
  radicalCode?: string;
  strokeCount?: string;
  hskLevel?: string;
}

export interface Word {
  id: string;
  word: string;
  meanings: string[]; // All meanings from different contexts
  seenCount: number;
  occurrenceIds: string[]; // word occurrence IDs
}

export interface WordOccurrence {
  id: string;
  wordId: string; // Reference to the word
  word: string; // The actual Chinese word text
  meaning: string; // Meaning in this specific context
  pinyin: string; // Pinyin for this occurrence
  sentenceId: string; // Which sentence this appears in
  position: number; // Position in the sentence (0-indexed)
}

export interface Sentence {
  id: string;
  text: string;
  occurrenceIds: string[]; // word occurrence IDs in order
  source: string; // URL where found
}

export interface DataStore {
  characters: { [char: string]: Character };
  words: { [id: string]: Word };
  wordOccurrences: { [id: string]: WordOccurrence };
  sentences: { [id: string]: Sentence };
}
