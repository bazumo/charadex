import fs from 'fs';
import path from 'path';

interface HanziData {
  frequency_rank: string;
  charcter: string; // Note: typo in original data
  pinyin: string;
  definition: string | null;
  radical: string;
  radical_code: string;
  stroke_count: string;
  hsk_levl: string;
  general_standard_num: string;
}

let hanziDB: Map<string, HanziData> | null = null;

// Load hanziDB data from JSON file
function loadHanziDB(): Map<string, HanziData> {
  if (hanziDB) return hanziDB;

  try {
    const hanziPath = path.join(process.cwd(), '..', 'hanziDB.json');
    const fileContent = fs.readFileSync(hanziPath, 'utf-8');

    // Parse NDJSON (newline-delimited JSON)
    const lines = fileContent.trim().split('\n');
    hanziDB = new Map();

    for (const line of lines) {
      const data: HanziData = JSON.parse(line);
      hanziDB.set(data.charcter, data);
    }

    return hanziDB;
  } catch (error) {
    console.error('Error loading hanziDB.json:', error);
    return new Map();
  }
}

// Get top N most common characters from hanziDB
export function getCommonCharacters(count: number = 2000): string[] {
  const db = loadHanziDB();

  // Sort by frequency rank and get the top N characters
  const sortedChars = Array.from(db.values())
    .sort((a, b) => parseInt(a.frequency_rank) - parseInt(b.frequency_rank))
    .slice(0, count)
    .map(char => char.charcter);

  return sortedChars;
}

// 2000 most common Chinese characters (simplified) - loaded from hanziDB
export const COMMON_CHARACTERS = getCommonCharacters(2000);

// Generate initial character data with pinyin from hanziDB
export function getInitialCharacterData() {
  const characterData: { [char: string]: { character: string; seenCount: number; pinyin: string; wordReferences: string[] } } = {};
  const db = loadHanziDB();

  COMMON_CHARACTERS.forEach(char => {
    const hanziInfo = db.get(char);

    characterData[char] = {
      character: char,
      seenCount: 0,
      pinyin: hanziInfo?.pinyin || '',
      wordReferences: []
    };
  });

  return characterData;
}
