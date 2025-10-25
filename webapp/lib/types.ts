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
  meaning: string;
  seenCount: number;
  sentenceReferences: string[]; // sentence IDs
}

export interface Sentence {
  id: string;
  text: string;
  wordIds: string[];
  source: string; // URL where found
}

export interface DataStore {
  characters: { [char: string]: Character };
  words: { [id: string]: Word };
  sentences: { [id: string]: Sentence };
}
