import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
  pinyinVariants?: string[];
  wordReferences: string[];
  frequencyRank?: string;
  definition?: string | null;
  radical?: string;
  radicalCode?: string;
  strokeCount?: string;
  hskLevel?: string;
}

interface Word {
  id: string;
  word: string;
  meanings: string[];
  seenCount: number;
  occurrenceIds: string[];
}

interface WordOccurrence {
  id: string;
  wordId: string;
  word: string;
  meaning: string;
  pinyin: string;
  sentenceId: string;
  position: number;
}

interface Sentence {
  id: string;
  text: string;
  occurrenceIds: string[];
  source: string;
}

interface DataStore {
  characters: { [char: string]: Character };
  words: { [id: string]: Word };
  wordOccurrences: { [id: string]: WordOccurrence };
  sentences: { [id: string]: Sentence };
}

function loadHanziDB(): Map<string, HanziData> {
  const hanziPath = path.join(process.cwd(), 'lib', 'hanziDB.json');
  const fileContent = fs.readFileSync(hanziPath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  const hanziDB = new Map<string, HanziData>();

  for (const line of lines) {
    const data: HanziData = JSON.parse(line);
    hanziDB.set(data.charcter, data);
  }

  return hanziDB;
}

const DEMO_SENTENCES = [
  {
    text: '今天天气很好',
    source: 'https://zh.wikipedia.org/wiki/天气',
    words: [
      { word: '今天', meaning: 'today', pinyin: 'jīn tiān' },
      { word: '天气', meaning: 'weather', pinyin: 'tiān qì' },
      { word: '很', meaning: 'very', pinyin: 'hěn' },
      { word: '好', meaning: 'good', pinyin: 'hǎo' },
    ],
  },
  {
    text: '我想学习中文',
    source: 'https://zh.wikipedia.org/wiki/汉语',
    words: [
      { word: '我', meaning: 'I, me', pinyin: 'wǒ' },
      { word: '想', meaning: 'to want, to think', pinyin: 'xiǎng' },
      { word: '学习', meaning: 'to study, to learn', pinyin: 'xué xí' },
      { word: '中文', meaning: 'Chinese language', pinyin: 'zhōng wén' },
    ],
  },
  {
    text: '他是我的朋友',
    source: 'https://zh.wikipedia.org/wiki/友谊',
    words: [
      { word: '他', meaning: 'he, him', pinyin: 'tā' },
      { word: '是', meaning: 'to be', pinyin: 'shì' },
      { word: '我', meaning: 'I, me', pinyin: 'wǒ' },
      { word: '的', meaning: 'possessive particle', pinyin: 'de' },
      { word: '朋友', meaning: 'friend', pinyin: 'péng yǒu' },
    ],
  },
  {
    text: '这本书非常有意思',
    source: 'https://zh.wikipedia.org/wiki/文学',
    words: [
      { word: '这', meaning: 'this', pinyin: 'zhè' },
      { word: '本', meaning: 'measure word for books', pinyin: 'běn' },
      { word: '书', meaning: 'book', pinyin: 'shū' },
      { word: '非常', meaning: 'very, extremely', pinyin: 'fēi cháng' },
      { word: '有意思', meaning: 'interesting', pinyin: 'yǒu yì si' },
    ],
  },
  {
    text: '请问你叫什么名字',
    source: 'https://zh.wikipedia.org/wiki/自我介绍',
    words: [
      { word: '请问', meaning: 'may I ask', pinyin: 'qǐng wèn' },
      { word: '你', meaning: 'you', pinyin: 'nǐ' },
      { word: '叫', meaning: 'to be called', pinyin: 'jiào' },
      { word: '什么', meaning: 'what', pinyin: 'shén me' },
      { word: '名字', meaning: 'name', pinyin: 'míng zì' },
    ],
  },
  {
    text: '中国的历史很长',
    source: 'https://zh.wikipedia.org/wiki/中国历史',
    words: [
      { word: '中国', meaning: 'China', pinyin: 'zhōng guó' },
      { word: '的', meaning: 'possessive particle', pinyin: 'de' },
      { word: '历史', meaning: 'history', pinyin: 'lì shǐ' },
      { word: '很', meaning: 'very', pinyin: 'hěn' },
      { word: '长', meaning: 'long', pinyin: 'cháng' },
    ],
  },
  {
    text: '她每天早上跑步',
    source: 'https://zh.wikipedia.org/wiki/跑步',
    words: [
      { word: '她', meaning: 'she, her', pinyin: 'tā' },
      { word: '每天', meaning: 'every day', pinyin: 'měi tiān' },
      { word: '早上', meaning: 'morning', pinyin: 'zǎo shàng' },
      { word: '跑步', meaning: 'to jog, to run', pinyin: 'pǎo bù' },
    ],
  },
  {
    text: '我们一起去吃饭吧',
    source: 'https://zh.wikipedia.org/wiki/中国菜',
    words: [
      { word: '我们', meaning: 'we, us', pinyin: 'wǒ men' },
      { word: '一起', meaning: 'together', pinyin: 'yì qǐ' },
      { word: '去', meaning: 'to go', pinyin: 'qù' },
      { word: '吃饭', meaning: 'to eat (a meal)', pinyin: 'chī fàn' },
      { word: '吧', meaning: 'suggestion particle', pinyin: 'ba' },
    ],
  },
  {
    text: '北京是中国的首都',
    source: 'https://zh.wikipedia.org/wiki/北京',
    words: [
      { word: '北京', meaning: 'Beijing', pinyin: 'běi jīng' },
      { word: '是', meaning: 'to be', pinyin: 'shì' },
      { word: '中国', meaning: 'China', pinyin: 'zhōng guó' },
      { word: '的', meaning: 'possessive particle', pinyin: 'de' },
      { word: '首都', meaning: 'capital city', pinyin: 'shǒu dū' },
    ],
  },
  {
    text: '学生们在教室里上课',
    source: 'https://zh.wikipedia.org/wiki/教育',
    words: [
      { word: '学生', meaning: 'student', pinyin: 'xué shēng' },
      { word: '们', meaning: 'plural suffix', pinyin: 'men' },
      { word: '在', meaning: 'at, in', pinyin: 'zài' },
      { word: '教室', meaning: 'classroom', pinyin: 'jiào shì' },
      { word: '里', meaning: 'inside', pinyin: 'lǐ' },
      { word: '上课', meaning: 'to attend class', pinyin: 'shàng kè' },
    ],
  },
  {
    text: '这个电影太好看了',
    source: 'https://zh.wikipedia.org/wiki/电影',
    words: [
      { word: '这个', meaning: 'this', pinyin: 'zhè ge' },
      { word: '电影', meaning: 'movie, film', pinyin: 'diàn yǐng' },
      { word: '太', meaning: 'too, extremely', pinyin: 'tài' },
      { word: '好看', meaning: 'good-looking, worth watching', pinyin: 'hǎo kàn' },
      { word: '了', meaning: 'completion particle', pinyin: 'le' },
    ],
  },
  {
    text: '明天我要去图书馆看书',
    source: 'https://zh.wikipedia.org/wiki/图书馆',
    words: [
      { word: '明天', meaning: 'tomorrow', pinyin: 'míng tiān' },
      { word: '我', meaning: 'I, me', pinyin: 'wǒ' },
      { word: '要', meaning: 'to want, will', pinyin: 'yào' },
      { word: '去', meaning: 'to go', pinyin: 'qù' },
      { word: '图书馆', meaning: 'library', pinyin: 'tú shū guǎn' },
      { word: '看书', meaning: 'to read books', pinyin: 'kàn shū' },
    ],
  },
];

function seedDatabase() {
  console.log('Starting database seed...');

  const hanziDB = loadHanziDB();
  console.log(`Loaded ${hanziDB.size} characters from hanziDB`);

  const sortedChars = Array.from(hanziDB.values())
    .sort((a, b) => parseInt(a.frequency_rank) - parseInt(b.frequency_rank))
    .slice(0, 2000);

  const characters: { [char: string]: Character } = {};
  for (const hanziData of sortedChars) {
    characters[hanziData.charcter] = {
      character: hanziData.charcter,
      seenCount: 0,
      pinyin: hanziData.pinyin,
      wordReferences: [],
      frequencyRank: hanziData.frequency_rank,
      definition: hanziData.definition,
      radical: hanziData.radical,
      radicalCode: hanziData.radical_code,
      strokeCount: hanziData.stroke_count,
      hskLevel: hanziData.hsk_levl,
    };
  }

  const data: DataStore = {
    characters,
    words: {},
    wordOccurrences: {},
    sentences: {},
  };

  // Seed demo sentences, words, and character counts
  const wordMap = new Map<string, Word>();

  for (const sentenceData of DEMO_SENTENCES) {
    const sentenceId = uuidv4();
    const occurrenceIds: string[] = [];

    for (let position = 0; position < sentenceData.words.length; position++) {
      const w = sentenceData.words[position];

      let word = wordMap.get(w.word);
      if (!word) {
        word = {
          id: uuidv4(),
          word: w.word,
          meanings: [w.meaning],
          seenCount: 0,
          occurrenceIds: [],
        };
        wordMap.set(w.word, word);
        data.words[word.id] = word;
      }

      word.seenCount++;
      if (!word.meanings.includes(w.meaning)) {
        word.meanings.push(w.meaning);
      }

      const occurrenceId = uuidv4();
      data.wordOccurrences[occurrenceId] = {
        id: occurrenceId,
        wordId: word.id,
        word: w.word,
        meaning: w.meaning,
        pinyin: w.pinyin,
        sentenceId,
        position,
      };
      occurrenceIds.push(occurrenceId);
      word.occurrenceIds.push(occurrenceId);

      // Update characters
      const pinyinParts = w.pinyin.split(/\s+/).filter((p: string) => p.length > 0);
      const chars = Array.from(w.word).filter((c: string) => /[\u4e00-\u9fa5]/.test(c));

      chars.forEach((char, idx) => {
        if (data.characters[char]) {
          data.characters[char].seenCount++;
          if (!data.characters[char].wordReferences.includes(word!.id)) {
            data.characters[char].wordReferences.push(word!.id);
          }
          const charPinyin = pinyinParts[idx];
          if (charPinyin) {
            if (!data.characters[char].pinyinVariants) {
              data.characters[char].pinyinVariants = [];
            }
            if (!data.characters[char].pinyinVariants!.includes(charPinyin)) {
              data.characters[char].pinyinVariants!.push(charPinyin);
            }
          }
        }
      });
    }

    data.sentences[sentenceId] = {
      id: sentenceId,
      text: sentenceData.text,
      occurrenceIds,
      source: sentenceData.source,
    };
  }

  const dataPath = path.join(process.cwd(), 'lib', 'data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  const caughtCount = Object.values(data.characters).filter(c => c.seenCount > 0).length;
  console.log('Database seeded successfully!');
  console.log(`   Characters: ${Object.keys(data.characters).length} (${caughtCount} caught)`);
  console.log(`   Words: ${Object.keys(data.words).length}`);
  console.log(`   Sentences: ${Object.keys(data.sentences).length}`);
  console.log(`   Word occurrences: ${Object.keys(data.wordOccurrences).length}`);
}

try {
  seedDatabase();
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
}
