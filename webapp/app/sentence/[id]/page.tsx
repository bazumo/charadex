'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDataStore, ensureSeeded } from '@/lib/client-storage';
import { DataStore } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import WordTooltip from '@/components/WordTooltip';
import Link from 'next/link';

interface SentenceDetails {
  id: string;
  text: string;
  source: string;
  occurrences: Array<{
    id: string;
    wordId: string;
    word: string;
    meaning: string;
    pinyin: string;
    position: number;
  }>;
}

function getSentenceDetails(data: DataStore, id: string): SentenceDetails | null {
  const sentence = data.sentences[id];
  if (!sentence) return null;

  const occurrences = sentence.occurrenceIds?.map((occurrenceId) => {
    const occurrence = data.wordOccurrences?.[occurrenceId];
    if (!occurrence) return null;
    return {
      id: occurrence.id,
      wordId: occurrence.wordId,
      word: occurrence.word,
      meaning: occurrence.meaning,
      pinyin: occurrence.pinyin,
      position: occurrence.position,
    };
  }).filter((occ): occ is NonNullable<typeof occ> => occ !== null)
    .sort((a, b) => a.position - b.position) || [];

  return { id: sentence.id, text: sentence.text, source: sentence.source, occurrences };
}

function segmentSentence(text: string, words: Array<{ word: string; meaning: string; pinyin: string }>): Array<{ text: string; word?: { word: string; meaning: string; pinyin: string } }> {
  const segments: Array<{ text: string; word?: { word: string; meaning: string; pinyin: string } }> = [];
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);
  let position = 0;

  while (position < text.length) {
    const remainingText = text.slice(position);
    let matched = false;

    for (const word of sortedWords) {
      if (remainingText.startsWith(word.word)) {
        segments.push({ text: word.word, word });
        position += word.word.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const char = text[position];
      if (segments.length > 0 && !segments[segments.length - 1].word) {
        segments[segments.length - 1].text += char;
      } else {
        segments.push({ text: char });
      }
      position++;
    }
  }

  return segments;
}

export default function SentencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [details, setDetails] = useState<SentenceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = getDataStore() || await ensureSeeded();
      const d = getSentenceDetails(data, id);
      if (!d) {
        router.replace('/');
        return;
      }
      setDetails(d);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading || !details) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-black">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-200 dark:text-gray-800 text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  const segments = segmentSentence(details.text, details.occurrences);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-8 py-12 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl font-light text-gray-600 dark:text-gray-400 mb-8 text-center">
              Sentence
            </h1>

            <div className="text-3xl leading-relaxed mb-8 text-center">
              {segments.map((segment, index) => (
                segment.word ? (
                  <WordTooltip
                    key={index}
                    word={segment.word.word}
                    meaning={segment.word.meaning}
                    pinyin={segment.word.pinyin}
                  />
                ) : (
                  <span key={index}>{segment.text}</span>
                )
              ))}
            </div>

            <div className="text-center mb-12">
              <a
                href={details.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Source: {details.source}
              </a>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
              Words in this sentence ({details.occurrences.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.occurrences.map((occurrence) => (
                <Link
                  key={occurrence.id}
                  href={`/word/${encodeURIComponent(occurrence.word)}`}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="text-2xl mb-2">{occurrence.word}</div>
                  <div className="text-sm text-gray-500 mb-1">{occurrence.pinyin}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{occurrence.meaning}</div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
