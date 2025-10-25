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
  meaning: string;
  seenCount: number;
  sentences: Array<{
    id: string;
    text: string;
    source: string;
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

    // Get all sentences that contain this word
    const sentences = wordEntry.sentenceReferences.map(sentenceId => {
      const sentence = data.sentences[sentenceId];
      return sentence ? {
        id: sentence.id,
        text: sentence.text,
        source: sentence.source
      } : null;
    }).filter((sentence): sentence is NonNullable<typeof sentence> => sentence !== null);

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
      meaning: wordEntry.meaning,
      seenCount: wordEntry.seenCount,
      sentences,
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
          <div className="text-xl text-gray-500 dark:text-gray-500">
            {details.meaning}
          </div>
        </div>

        {/* Statistics */}
        <div className="flex justify-center gap-12 mb-12 text-center">
          <div>
            <div className="text-3xl font-light mb-1">{details.seenCount}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Seen</div>
          </div>

          <div>
            <div className="text-3xl font-light mb-1">{details.sentences.length}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Sentences</div>
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

        {/* Sentences Section */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
            Sentences ({details.sentences.length})
          </h3>

          {details.sentences.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              No sentences captured yet
            </p>
          ) : (
            <div className="space-y-6">
              {details.sentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0"
                >
                  <div className="text-xl mb-3">
                    {sentence.text}
                  </div>
                  <a
                    href={sentence.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors truncate block"
                  >
                    {sentence.source}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
