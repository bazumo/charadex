import Anthropic from '@anthropic-ai/sdk';
import { DataStore, Sentence, Word } from './types';
import { v4 as uuidv4 } from 'uuid';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate LLM output to ensure data quality
function validateLLMOutput(result: any, originalText: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if result has the expected structure
  if (!result || typeof result !== 'object') {
    errors.push('Result is not a valid object');
    return { isValid: false, errors, warnings };
  }

  if (!Array.isArray(result.sentences)) {
    errors.push('Result.sentences is not an array');
    return { isValid: false, errors, warnings };
  }

  if (result.sentences.length === 0) {
    errors.push('No sentences found in result');
    return { isValid: false, errors, warnings };
  }

  // Validate each sentence
  let totalWords = 0;
  let totalChars = 0;

  result.sentences.forEach((sentence: any, idx: number) => {
    // Check sentence structure
    if (!sentence.text || typeof sentence.text !== 'string') {
      errors.push(`Sentence ${idx}: Missing or invalid 'text' field`);
    }

    if (!Array.isArray(sentence.words)) {
      errors.push(`Sentence ${idx}: 'words' is not an array`);
      return;
    }

    if (sentence.words.length === 0) {
      warnings.push(`Sentence ${idx}: No words found in sentence "${sentence.text}"`);
    }

    // Validate each word
    sentence.words.forEach((word: any, wordIdx: number) => {
      totalWords++;

      if (!word.word || typeof word.word !== 'string') {
        errors.push(`Sentence ${idx}, Word ${wordIdx}: Missing or invalid 'word' field`);
      }

      if (!word.meaning || typeof word.meaning !== 'string') {
        errors.push(`Sentence ${idx}, Word ${wordIdx} (${word.word}): Missing or invalid 'meaning' field`);
      }

      // Check if word contains Chinese characters
      if (word.word && !/[\u4e00-\u9fa5]/.test(word.word)) {
        warnings.push(`Sentence ${idx}, Word ${wordIdx}: "${word.word}" contains no Chinese characters`);
      }

      // Count characters
      if (word.word) {
        for (const char of word.word) {
          if (/[\u4e00-\u9fa5]/.test(char)) {
            totalChars++;
          }
        }
      }

      // Warn if meaning is empty or too short
      if (word.meaning && word.meaning.trim().length === 0) {
        warnings.push(`Sentence ${idx}, Word ${wordIdx} (${word.word}): Empty meaning`);
      }

      // Warn if meaning is the same as the word (no translation)
      if (word.meaning && word.word && word.meaning.trim() === word.word.trim()) {
        warnings.push(`Sentence ${idx}, Word ${wordIdx} (${word.word}): Meaning is same as word (no translation)`);
      }
    });

    // Check if sentence text matches the words
    if (sentence.text && sentence.words.length > 0) {
      const reconstructedText = sentence.words.map((w: any) => w.word).join('');
      const cleanSentenceText = sentence.text.replace(/[，。！？、；：""''（）《》【】…—\s]/g, '');
      const cleanReconstructed = reconstructedText.replace(/[，。！？、；：""''（）《》【】…—\s]/g, '');

      // Check coverage - should be close to 100%
      const similarity = cleanReconstructed.length / cleanSentenceText.length;
      if (similarity < 0.85) {
        errors.push(`Sentence ${idx}: Incomplete word extraction. Only ${Math.round(similarity * 100)}% coverage. Missing words!`);
        console.log(`  Original: ${cleanSentenceText}`);
        console.log(`  Reconstructed: ${cleanReconstructed}`);
      } else if (similarity < 0.95) {
        warnings.push(`Sentence ${idx}: Low coverage (${Math.round(similarity * 100)}%). Some words may be missing.`);
      } else if (similarity > 1.15) {
        warnings.push(`Sentence ${idx}: Possible duplicate words. Coverage: ${Math.round(similarity * 100)}%`);
      }
    }
  });

  // Check overall coverage
  const originalChineseChars = (originalText.match(/[\u4e00-\u9fa5]/g) || []).length;
  if (totalChars < originalChineseChars * 0.5) {
    warnings.push(`Low coverage: Only ${totalChars} Chinese characters extracted from ${originalChineseChars} in original text`);
  }

  // Summary warnings
  if (totalWords === 0) {
    errors.push('No words extracted from text');
  }

  console.log(`\n✅ LLM Output Validation:`);
  console.log(`   Sentences: ${result.sentences.length}`);
  console.log(`   Words: ${totalWords}`);
  console.log(`   Chinese chars: ${totalChars}/${originalChineseChars}`);

  if (errors.length > 0) {
    console.log(`\n❌ Validation Errors (${errors.length}):`);
    errors.forEach(err => console.log(`   - ${err}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Validation Warnings (${warnings.length}):`);
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Create Anthropic client
const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return new Anthropic({
    apiKey: apiKey,
  });
};

interface ProcessedText {
  sentences: Array<{
    text: string;
    words: Array<{
      word: string;
      meaning: string;
    }>;
  }>;
  words: Array<{
    word: string;
    meaning: string;
  }>;
  characters: Set<string>;
}

export async function processTextWithAI(text: string): Promise<ProcessedText> {
  const prompt = `You are a Chinese language expert. Analyze the following Chinese text and:
1. Split it into individual sentences
2. For each sentence, identify ALL Chinese words (词) - this is CRITICAL, you must include EVERY word
3. Provide English meanings for each word
4. Extract the pinyin for each unique character

IMPORTANT RULES:
- Include ALL words from the sentence, even common words like 的, 是, 在, etc.
- Include ALL nouns, verbs, adjectives, adverbs, particles, and function words
- Each sentence should be fully reconstructable from the words array
- The words should cover 100% of the Chinese characters in the sentence
- Do NOT skip any words, no matter how simple or common they are

Return your response in the following JSON format:
{
  "sentences": [
    {
      "text": "sentence in Chinese",
      "words": [
        {
          "word": "Chinese word",
          "meaning": "English meaning",
          "pinyin": "pinyin for each character in the word"
        }
      ]
    }
  ]
}

Text to analyze:
${text}

Important: Return ONLY the JSON, no additional text. DO NOT USE \`\`\`json \`\`\` tags.
`;

  try {
    const client = getClient();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the text content from Claude's response
    const resultText = response.content[0].type === 'text' ? response.content[0].text : '';
    const result = JSON.parse(resultText);

    // Validate the LLM output
    const validation = validateLLMOutput(result, text);

    if (!validation.isValid) {
      console.error('\n❌ LLM output validation failed!');
      throw new Error(`Invalid LLM output: ${validation.errors.join(', ')}`);
    }

    // Collect all unique words and characters
    const allWords = new Map<string, string>();
    const allCharacters = new Set<string>();

    for (const sentence of result.sentences) {
      for (const wordObj of sentence.words) {
        allWords.set(wordObj.word, wordObj.meaning);

        // Extract individual characters
        for (const char of wordObj.word) {
          if (/[\u4e00-\u9fa5]/.test(char)) { // Check if it's a Chinese character
            allCharacters.add(char);
          }
        }
      }
    }

    const words = Array.from(allWords.entries()).map(([word, meaning]) => ({
      word,
      meaning
    }));

    return {
      sentences: result.sentences,
      words,
      characters: allCharacters
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
}

export function storeProcessedData(
  data: DataStore,
  processed: ProcessedText,
  sourceUrl: string
): void {
  // Initialize wordOccurrences if it doesn't exist (backward compatibility)
  if (!data.wordOccurrences) {
    data.wordOccurrences = {};
  }

  // Store sentences
  const sentenceIds: string[] = [];

  for (const sentenceData of processed.sentences) {
    const sentenceId = uuidv4();
    sentenceIds.push(sentenceId);

    const occurrenceIds: string[] = [];

    // Store word occurrences from this sentence
    for (let position = 0; position < sentenceData.words.length; position++) {
      const wordData = sentenceData.words[position];

      // Get pinyin for the word
      const pinyinParts: string[] = [];
      for (const char of wordData.word) {
        const charData = data.characters[char];
        if (charData?.pinyin) {
          pinyinParts.push(charData.pinyin);
        }
      }
      const pinyin = pinyinParts.join(' ');

      // Check if word already exists, if not create it
      let existingWord = Object.values(data.words).find(w => w.word === wordData.word);
      let wordId: string;

      if (existingWord) {
        wordId = existingWord.id;
        existingWord.seenCount++;
        // Add meaning if it's not already in the list
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

      // Create word occurrence
      const occurrenceId = uuidv4();
      data.wordOccurrences[occurrenceId] = {
        id: occurrenceId,
        wordId: wordId,
        word: wordData.word,
        meaning: wordData.meaning,
        pinyin: pinyin,
        sentenceId: sentenceId,
        position: position
      };

      occurrenceIds.push(occurrenceId);
      existingWord.occurrenceIds.push(occurrenceId);

      // Update character references
      for (const char of wordData.word) {
        if (/[\u4e00-\u9fa5]/.test(char)) {
          if (!data.characters[char]) {
            data.characters[char] = {
              character: char,
              seenCount: 0,
              pinyin: '',
              wordReferences: []
            };
          }

          data.characters[char].seenCount++;

          if (!data.characters[char].wordReferences.includes(wordId)) {
            data.characters[char].wordReferences.push(wordId);
          }
        }
      }
    }

    // Store sentence
    data.sentences[sentenceId] = {
      id: sentenceId,
      text: sentenceData.text,
      occurrenceIds,
      source: sourceUrl
    };
  }
}
