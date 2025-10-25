import fs from 'fs';
import path from 'path';

interface HanziData {
  frequency_rank: string;
  charcter: string;
  pinyin: string;
  definition: string | null;
  radical: string;
  radical_code: string;
  stroke_count: string;
  hsk_levl: string;
  general_standard_num: string;
}

interface Character {
  character: string;
  seenCount: number;
  pinyin: string;
  wordReferences: string[];
  frequencyRank?: string;
  definition?: string | null;
  radical?: string;
  radicalCode?: string;
  strokeCount?: string;
  hskLevel?: string;
}

interface DataStore {
  characters: { [char: string]: Character };
  words: { [id: string]: any };
  sentences: { [id: string]: any };
}

function loadHanziDB(): Map<string, HanziData> {
  const hanziPath = path.join(process.cwd(), '..', 'hanziDB.json');
  const fileContent = fs.readFileSync(hanziPath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  const hanziDB = new Map<string, HanziData>();

  for (const line of lines) {
    const data: HanziData = JSON.parse(line);
    hanziDB.set(data.charcter, data);
  }

  return hanziDB;
}

function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // Load hanziDB
  console.log('📖 Loading hanziDB.json...');
  const hanziDB = loadHanziDB();
  console.log(`✓ Loaded ${hanziDB.size} characters from hanziDB`);

  // Get top 2000 most common characters
  const sortedChars = Array.from(hanziDB.values())
    .sort((a, b) => parseInt(a.frequency_rank) - parseInt(b.frequency_rank))
    .slice(0, 2000);

  console.log(`📝 Preparing data for top ${sortedChars.length} characters...`);

  // Create character data
  const characters: { [char: string]: Character } = {};

  for (const hanziData of sortedChars) {
    characters[hanziData.charcter] = {
      character: hanziData.charcter,
      seenCount: 0,
      pinyin: hanziData.pinyin,
      wordReferences: [],
      // Store all hanziDB metadata
      frequencyRank: hanziData.frequency_rank,
      definition: hanziData.definition,
      radical: hanziData.radical,
      radicalCode: hanziData.radical_code,
      strokeCount: hanziData.stroke_count,
      hskLevel: hanziData.hsk_levl
    };
  }

  // Create the complete data structure
  const data: DataStore = {
    characters,
    words: {},
    sentences: {}
  };

  // Write to data.json
  const dataPath = path.join(process.cwd(), 'lib', 'data.json');
  console.log(`💾 Writing to ${dataPath}...`);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log('✅ Database seeded successfully!');
  console.log(`   - Characters: ${Object.keys(data.characters).length}`);
  console.log(`   - Words: ${Object.keys(data.words).length}`);
  console.log(`   - Sentences: ${Object.keys(data.sentences).length}`);
}

// Run the seed function
try {
  seedDatabase();
} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
}
