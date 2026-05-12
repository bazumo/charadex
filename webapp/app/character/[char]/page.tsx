'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDataStore, ensureSeeded } from '@/lib/client-storage';
import { DataStore } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';

interface CharacterDetails {
  character: string;
  seenCount: number;
  pinyin: string;
  pinyinVariants?: string[];
  wordReferences: string[];
  hanziData: {
    frequency_rank: string;
    definition: string | null;
    radical: string;
    radical_code: string;
    stroke_count: string;
    hsk_level: string;
  } | null;
  words: Array<{
    id: string;
    word: string;
    meanings: string[];
    mostCommonMeaning: string;
    mostCommonPinyin: string;
    variantCount: number;
    seenCount: number;
  }>;
}

function getCharacterDetails(data: DataStore, char: string): CharacterDetails | null {
  const characterData = data.characters[char];
  if (!characterData) return null;

  const words = characterData.wordReferences
    .map((wordId) => {
      const word = data.words[wordId];
      if (!word) return null;

      const occurrences = word.occurrenceIds?.map(occId => data.wordOccurrences?.[occId]).filter(Boolean) || [];

      const meaningCounts = new Map<string, number>();
      const pinyinCounts = new Map<string, number>();

      occurrences.forEach(occ => {
        if (occ) {
          meaningCounts.set(occ.meaning, (meaningCounts.get(occ.meaning) || 0) + 1);
          pinyinCounts.set(occ.pinyin, (pinyinCounts.get(occ.pinyin) || 0) + 1);
        }
      });

      let mostCommonMeaning = word.meanings?.[0] || '';
      let mostCommonPinyin = '';
      let maxMeaningCount = 0;
      let maxPinyinCount = 0;

      meaningCounts.forEach((count, meaning) => {
        if (count > maxMeaningCount) { maxMeaningCount = count; mostCommonMeaning = meaning; }
      });
      pinyinCounts.forEach((count, pinyin) => {
        if (count > maxPinyinCount) { maxPinyinCount = count; mostCommonPinyin = pinyin; }
      });

      return {
        id: word.id,
        word: word.word,
        meanings: word.meanings || [],
        mostCommonMeaning,
        mostCommonPinyin,
        variantCount: Math.max(0, (word.meanings?.length || 1) - 1),
        seenCount: word.seenCount,
      };
    })
    .filter((word): word is NonNullable<typeof word> => word !== null);

  return {
    character: characterData.character,
    seenCount: characterData.seenCount,
    pinyin: characterData.pinyin,
    pinyinVariants: characterData.pinyinVariants,
    wordReferences: characterData.wordReferences,
    hanziData: characterData.frequencyRank
      ? {
          frequency_rank: characterData.frequencyRank,
          definition: characterData.definition || null,
          radical: characterData.radical || '',
          radical_code: characterData.radicalCode || '',
          stroke_count: characterData.strokeCount || '',
          hsk_level: characterData.hskLevel || '',
        }
      : null,
    words,
  };
}

export default function CharacterPage({ params }: { params: Promise<{ char: string }> }) {
  const { char } = use(params);
  const decodedChar = decodeURIComponent(char);
  const router = useRouter();
  const [details, setDetails] = useState<CharacterDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = getDataStore() || await ensureSeeded();
      const d = getCharacterDetails(data, decodedChar);
      if (!d) {
        router.replace('/');
        return;
      }
      setDetails(d);
      setLoading(false);
    }
    load();
  }, [decodedChar, router]);

  if (loading || !details) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-black">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-8xl animate-pulse text-gray-200 dark:text-gray-800">{decodedChar}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      <div className="flex-1 overflow-y-auto">
        <main className="px-8 py-12 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-8xl mb-4">{details.character}</div>
            <div className="text-2xl text-gray-600 dark:text-gray-400 mb-2">
              {details.pinyin}
              {details.pinyinVariants && details.pinyinVariants.length > 1 && (
                <span className="text-sm ml-3 text-gray-400">
                  ({details.pinyinVariants.join(', ')})
                </span>
              )}
            </div>
            {details.hanziData?.definition && (
              <div className="text-lg text-gray-500">{details.hanziData.definition}</div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 text-center">
            <div>
              <div className="text-3xl font-light mb-1">{details.seenCount}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Seen</div>
            </div>
            {details.hanziData && (
              <>
                <div>
                  <div className="text-3xl font-light mb-1">#{details.hanziData.frequency_rank}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Rank</div>
                </div>
                <div>
                  <div className="text-3xl font-light mb-1">HSK {details.hanziData.hsk_level}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Level</div>
                </div>
                <div>
                  <div className="text-3xl font-light mb-1">{details.hanziData.stroke_count}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Strokes</div>
                </div>
              </>
            )}
          </div>

          {details.hanziData && (
            <div className="mb-12 pb-8">
              <div className="text-sm text-gray-500">
                Radical:{' '}
                <span className="text-2xl text-black dark:text-white ml-2">{details.hanziData.radical}</span>
                <span className="ml-2 text-gray-400">({details.hanziData.radical_code})</span>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
              Words ({details.words.length})
            </h3>
            {details.words.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-600 text-sm">No words captured yet</p>
            ) : (
              <div className="space-y-3">
                {details.words.map((word) => (
                  <Link
                    key={word.id}
                    href={`/word/${encodeURIComponent(word.word)}`}
                    className="block py-3 border-b border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="mb-1">
                          <span className="text-xl mr-3">{word.word}</span>
                          {word.variantCount > 0 && (
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              +{word.variantCount}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mb-1">{word.mostCommonPinyin}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{word.mostCommonMeaning}</div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">{word.seenCount}×</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
