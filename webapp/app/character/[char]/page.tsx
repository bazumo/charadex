import Link from "next/link";
import { notFound } from "next/navigation";
import { readData } from "@/lib/storage";

interface CharacterPageProps {
  params: Promise<{ char: string }>;
}

interface CharacterDetails {
  character: string;
  seenCount: number;
  pinyin: string;
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
    meaning: string;
    seenCount: number;
  }>;
}

function getCharacterDetails(char: string): CharacterDetails | null {
  try {
    const data = readData();

    // Get character data
    const characterData = data.characters[char];

    // If character doesn't exist in our database, it's not valid
    if (!characterData) {
      return null;
    }

    // Get all words that contain this character
    const words = characterData.wordReferences
      .map((wordId) => {
        const word = data.words[wordId];
        return word
          ? {
              id: word.id,
              word: word.word,
              meaning: word.meaning,
              seenCount: word.seenCount,
            }
          : null;
      })
      .filter((word): word is NonNullable<typeof word> => word !== null);

    return {
      character: characterData.character,
      seenCount: characterData.seenCount,
      pinyin: characterData.pinyin,
      wordReferences: characterData.wordReferences,
      hanziData: characterData.frequencyRank
        ? {
            frequency_rank: characterData.frequencyRank,
            definition: characterData.definition || null,
            radical: characterData.radical || "",
            radical_code: characterData.radicalCode || "",
            stroke_count: characterData.strokeCount || "",
            hsk_level: characterData.hskLevel || "",
          }
        : null,
      words,
    };
  } catch (error) {
    console.error("Error fetching character details:", error);
    return null;
  }
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { char } = await params;
  const decodedChar = decodeURIComponent(char);
  const details = getCharacterDetails(decodedChar);

  console.log(details);
  if (!details) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="my-8 font-mono text-2xl font-light tracking-tight text-black dark:text-white border-b-1 border-gray-200 dark:border-gray-800">
        <div className="ml-3 mr-3">
          <Link
            href="/"
            className="inline-block mb-8 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Back
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl border-top">
        {/* Character Display */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4">{details.character}</div>
          <div className="text-2xl text-gray-600 dark:text-gray-400 mb-2">
            {details.pinyin}
          </div>
          {details.hanziData?.definition && (
            <div className="text-lg text-gray-500 dark:text-gray-500">
              {details.hanziData.definition}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 text-center">
          <div>
            <div className="text-3xl font-light mb-1">{details.seenCount}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Seen
            </div>
          </div>

          {details.hanziData && (
            <>
              <div>
                <div className="text-3xl font-light mb-1">
                  #{details.hanziData.frequency_rank}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Rank
                </div>
              </div>

              <div>
                <div className="text-3xl font-light mb-1">
                  HSK {details.hanziData.hsk_level}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Level
                </div>
              </div>

              <div>
                <div className="text-3xl font-light mb-1">
                  {details.hanziData.stroke_count}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Strokes
                </div>
              </div>
            </>
          )}
        </div>

        {/* Character Details */}
        {details.hanziData && (
          <div className="mb-12 pb-8">
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Radical:{" "}
              <span className="text-2xl text-black dark:text-white ml-2">
                {details.hanziData.radical}
              </span>
              <span className="ml-2 text-gray-400">
                ({details.hanziData.radical_code})
              </span>
            </div>
          </div>
        )}

        {/* Words Section */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
            Words ({details.words.length})
          </h3>

          {details.words.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              No words captured yet
            </p>
          ) : (
            <div className="space-y-3">
              {details.words.map((word) => (
                <Link
                  key={word.id}
                  href={`/word/${encodeURIComponent(word.word)}`}
                  className="block py-3 border-b border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xl mr-3">{word.word}</span>
                      <span className="text-sm text-gray-500">
                        {word.meaning}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {word.seenCount}×
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
