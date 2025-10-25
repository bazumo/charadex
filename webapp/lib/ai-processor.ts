import Anthropic from '@anthropic-ai/sdk';
import { DataStore, Sentence, Word } from './types';
import { v4 as uuidv4 } from 'uuid';

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
2. For each sentence, identify all Chinese words (词)
3. Provide English meanings for each word
4. Extract the pinyin for each unique character

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

Important: Return ONLY the JSON, no additional text.

 DO NOT USE \`\`\`json \`\`\` tags.
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

    console.log(resultText)
    const result = JSON.parse(resultText);

    console.log(result)

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
  // Store sentences
  const sentenceIds: string[] = [];

  for (const sentenceData of processed.sentences) {
    const sentenceId = uuidv4();
    sentenceIds.push(sentenceId);

    const wordIds: string[] = [];

    // Store words from this sentence
    for (const wordData of sentenceData.words) {
      const wordId = uuidv4();
      wordIds.push(wordId);

      // Check if word already exists
      const existingWord = Object.values(data.words).find(w => w.word === wordData.word);

      if (existingWord) {
        existingWord.seenCount++;
        if (!existingWord.sentenceReferences.includes(sentenceId)) {
          existingWord.sentenceReferences.push(sentenceId);
        }
      } else {
        data.words[wordId] = {
          id: wordId,
          word: wordData.word,
          meaning: wordData.meaning,
          seenCount: 1,
          sentenceReferences: [sentenceId]
        };
      }

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
      wordIds,
      source: sourceUrl
    };
  }
}
