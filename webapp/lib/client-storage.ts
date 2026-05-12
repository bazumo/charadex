import { DataStore, Character } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'charadex-data';

let memoryCache: DataStore | null = null;

export function getDataStore(): DataStore | null {
  if (memoryCache) return memoryCache;
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryCache = JSON.parse(raw);
      return memoryCache;
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return null;
}

export function saveDataStore(data: DataStore): void {
  memoryCache = data;
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage:', e);
  }
}

export function clearDataStore(): void {
  memoryCache = null;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isSeeded(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export async function ensureSeeded(): Promise<DataStore> {
  const existing = getDataStore();
  if (existing && Object.keys(existing.characters).length > 0) return existing;

  const response = await fetch('/api/seed-data');
  const data: DataStore = await response.json();
  saveDataStore(data);
  return data;
}

export function getCharacterList(data: DataStore): Character[] {
  return Object.values(data.characters).sort((a, b) => {
    const rankA = parseInt(a.frequencyRank || '99999');
    const rankB = parseInt(b.frequencyRank || '99999');
    return rankA - rankB;
  });
}

interface ProcessedText {
  sentences: Array<{
    text: string;
    words: Array<{
      word: string;
      meaning: string;
      pinyin: string;
    }>;
  }>;
  words: Array<{ word: string; meaning: string }>;
  characters: string[];
}

export function storeProcessedData(
  data: DataStore,
  processed: ProcessedText,
  sourceUrl: string
): void {
  if (!data.wordOccurrences) {
    data.wordOccurrences = {};
  }

  for (const sentenceData of processed.sentences) {
    const sentenceId = uuidv4();
    const occurrenceIds: string[] = [];

    for (let position = 0; position < sentenceData.words.length; position++) {
      const wordData = sentenceData.words[position];
      const pinyin = wordData.pinyin || '';

      let existingWord = Object.values(data.words).find(w => w.word === wordData.word);
      let wordId: string;

      if (existingWord) {
        wordId = existingWord.id;
        existingWord.seenCount++;
        if (!existingWord.meanings.includes(wordData.meaning)) {
          existingWord.meanings.push(wordData.meaning);
        }
      } else {
        wordId = uuidv4();
        data.words[wordId] = {
          id: wordId,
          word: wordData.word,
          meanings: [wordData.meaning],
          seenCount: 1,
          occurrenceIds: []
        };
        existingWord = data.words[wordId];
      }

      const occurrenceId = uuidv4();
      data.wordOccurrences[occurrenceId] = {
        id: occurrenceId,
        wordId,
        word: wordData.word,
        meaning: wordData.meaning,
        pinyin,
        sentenceId,
        position
      };

      occurrenceIds.push(occurrenceId);
      existingWord.occurrenceIds.push(occurrenceId);

      const pinyinParts = pinyin.split(/\s+/).filter((p: string) => p.length > 0);
      const chars = Array.from(wordData.word).filter((c: string) => /[\u4e00-\u9fa5]/.test(c));

      chars.forEach((char, idx) => {
        if (!data.characters[char]) {
          data.characters[char] = {
            character: char,
            seenCount: 0,
            pinyin: '',
            pinyinVariants: [],
            wordReferences: []
          };
        }

        data.characters[char].seenCount++;

        const charPinyin = pinyinParts[idx];
        if (charPinyin) {
          if (!data.characters[char].pinyin) {
            data.characters[char].pinyin = charPinyin;
          }
          if (!data.characters[char].pinyinVariants) {
            data.characters[char].pinyinVariants = [];
          }
          if (!data.characters[char].pinyinVariants!.includes(charPinyin)) {
            data.characters[char].pinyinVariants!.push(charPinyin);
          }
        }

        if (!data.characters[char].wordReferences.includes(wordId)) {
          data.characters[char].wordReferences.push(wordId);
        }
      });
    }

    data.sentences[sentenceId] = {
      id: sentenceId,
      text: sentenceData.text,
      occurrenceIds,
      source: sourceUrl
    };
  }

  saveDataStore(data);
}
