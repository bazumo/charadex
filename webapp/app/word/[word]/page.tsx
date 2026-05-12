'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDataStore, ensureSeeded } from '@/lib/client-storage';
import { DataStore } from '@/lib/types';
import PageHeader from '@/components/PageHeader';

interface WordDetails {
  id: string;
  word: string;
  meanings: string[];
  seenCount: number;
  occurrences: Array<{
    id: string;
    meaning: string;
    pinyin: string;
    sentenceId: string;
    sentenceText: string;
  }>;
  characters: Array<{
    character: string;
    pinyin: string;
  }>;
}

function getWordDetails(data: DataStore, word: string): WordDetails | null {
  const wordEntry = Object.values(data.words).find(w => w.word === word);
  if (!wordEntry) return null;

  const occurrences = wordEntry.occurrenceIds?.map(occurrenceId => {
    const occurrence = data.wordOccurrences?.[occurrenceId];
    if (!occurrence) return null;
    const sentence = data.sentences[occurrence.sentenceId];
    return {
      id: occurrence.id,
      meaning: occurrence.meaning,
      pinyin: occurrence.pinyin,
      sentenceId: occurrence.sentenceId,
      sentenceText: sentence?.text || ''
    };
  }).filter((occ): occ is NonNullable<typeof occ> => occ !== null) || [];

  const wordPinyin = occurrences[0]?.pinyin || '';
  const pinyinParts = wordPinyin.split(/\s+/).filter(p => p.length > 0);

  const characters = Array.from(word).map((char, index) => ({
    character: char,
    pinyin: pinyinParts[index] || ''
  }));

  return {
    id: wordEntry.id,
    word: wordEntry.word,
    meanings: wordEntry.meanings || [],
    seenCount: wordEntry.seenCount,
    occurrences,
    characters
  };
}

export default function WordPage({ params }: { params: Promise<{ word: string }> }) {
  const { word } = use(params);
  const decodedWord = decodeURIComponent(word);
  const router = useRouter();
  const [details, setDetails] = useState<WordDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = getDataStore() || await ensureSeeded();
      const d = getWordDetails(data, decodedWord);
      if (!d) {
        router.replace('/');
        return;
      }
      setDetails(d);
      setLoading(false);
    }
    load();
  }, [decodedWord, router]);

  if (loading || !details) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-black">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-6xl animate-pulse text-gray-200 dark:text-gray-800">{decodedWord}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-8 py-12 max-w-3xl">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">{details.word}</div>
            <div className="text-xl text-gray-500 mb-4">{details.meanings.join('; ')}</div>
          </div>

          <div className="flex justify-center gap-12 mb-12 text-center">
            <div>
              <div className="text-3xl font-light mb-1">{details.seenCount}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Seen</div>
            </div>
            <div>
              <div className="text-3xl font-light mb-1">{details.occurrences.length}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Occurrences</div>
            </div>
          </div>

          <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">Characters</h3>
            <div className="flex gap-6 justify-center">
              {details.characters.map((char, index) => (
                <Link
                  key={index}
                  href={`/character/${encodeURIComponent(char.character)}`}
                  className="text-center hover:opacity-60 transition-opacity"
                >
                  <div className="text-5xl mb-2">{char.character}</div>
                  <div className="text-sm text-gray-500">{char.pinyin}</div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
              Occurrences in Sentences ({details.occurrences.length})
            </h3>
            {details.occurrences.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-600 text-sm">No occurrences captured yet</p>
            ) : (
              <div className="space-y-6">
                {details.occurrences.map((occurrence) => (
                  <Link
                    key={occurrence.id}
                    href={`/sentence/${occurrence.sentenceId}`}
                    className="block pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 -mx-4 px-4 transition-colors"
                  >
                    <div className="text-xl mb-3">{occurrence.sentenceText}</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {occurrence.pinyin} &bull; {occurrence.meaning}
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
