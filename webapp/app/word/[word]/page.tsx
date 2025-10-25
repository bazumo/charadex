import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readData } from '@/lib/storage';
import PageHeader from '@/components/PageHeader';

interface WordPageProps {
  params: Promise<{ word: string }>;
}

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

function getWordDetails(word: string): WordDetails | null {
  try {
    const data = readData();

    // Find the word in the data
    const wordEntry = Object.values(data.words).find(w => w.word === word);

    if (!wordEntry) {
      return null;
    }

    // Get all occurrences of this word
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

    // Get character information for each character in the word
    const characters = Array.from(word).map(char => {
      const characterData = data.characters[char];
      return {
        character: char,
        pinyin: characterData?.pinyin || ''
      };
    });

    return {
      id: wordEntry.id,
      word: wordEntry.word,
      meanings: wordEntry.meanings || [wordEntry.meaning || ''],
      seenCount: wordEntry.seenCount,
      occurrences,
      characters
    };
  } catch (error) {
    console.error('Error fetching word details:', error);
    return null;
  }
}

export default async function WordPage({ params }: WordPageProps) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  const details = getWordDetails(decodedWord);

  if (!details) {
    notFound();
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-8 py-12 max-w-3xl">
          {/* Word Display */}
          <div className="text-center mb-12">
          <div className="text-6xl mb-4">
            {details.word}
          </div>
          <div className="text-xl text-gray-500 dark:text-gray-500 mb-4">
            {details.meanings.join('; ')}
          </div>
        </div>

        {/* Statistics */}
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

        {/* Characters in this word */}
        <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
            Characters
          </h3>
          <div className="flex gap-6 justify-center">
            {details.characters.map((char, index) => (
              <Link
                key={index}
                href={`/character/${encodeURIComponent(char.character)}`}
                className="text-center hover:opacity-60 transition-opacity"
              >
                <div className="text-5xl mb-2">
                  {char.character}
                </div>
                <div className="text-sm text-gray-500">
                  {char.pinyin}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Occurrences Section */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
            Occurrences in Sentences ({details.occurrences.length})
          </h3>

          {details.occurrences.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              No occurrences captured yet
            </p>
          ) : (
            <div className="space-y-6">
              {details.occurrences.map((occurrence) => (
                <Link
                  key={occurrence.id}
                  href={`/sentence/${occurrence.sentenceId}`}
                  className="block pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 -mx-4 px-4 transition-colors"
                >
                  <div className="text-xl mb-3">
                    {occurrence.sentenceText}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {occurrence.pinyin} • {occurrence.meaning}
                  </div>
                  <span className="text-xs text-gray-400">
                    Click to view sentence details →
                  </span>
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
