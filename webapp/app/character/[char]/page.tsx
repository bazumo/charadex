import { notFound } from "next/navigation";
import { readData } from "@/lib/storage";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

interface CharacterPageProps {
  params: Promise<{ char: string }>;
}

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
        if (!word) return null;

        // Get all occurrences to find most common meaning and pinyin
        const occurrences = word.occurrenceIds?.map(occId => data.wordOccurrences?.[occId]).filter(Boolean) || [];

        // Count frequency of each meaning and pinyin
        const meaningCounts = new Map<string, number>();
        const pinyinCounts = new Map<string, number>();

        occurrences.forEach(occ => {
          if (occ) {
            meaningCounts.set(occ.meaning, (meaningCounts.get(occ.meaning) || 0) + 1);
            pinyinCounts.set(occ.pinyin, (pinyinCounts.get(occ.pinyin) || 0) + 1);
          }
        });

        // Get most common meaning and pinyin
        let mostCommonMeaning = word.meanings?.[0] || '';
        let mostCommonPinyin = '';
        let maxMeaningCount = 0;
        let maxPinyinCount = 0;

        meaningCounts.forEach((count, meaning) => {
          if (count > maxMeaningCount) {
            maxMeaningCount = count;
            mostCommonMeaning = meaning;
          }
        });

        pinyinCounts.forEach((count, pinyin) => {
          if (count > maxPinyinCount) {
            maxPinyinCount = count;
            mostCommonPinyin = pinyin;
          }
        });

        // Calculate variant count (total unique meanings - 1)
        const variantCount = Math.max(0, (word.meanings?.length || 1) - 1);

        return {
          id: word.id,
          word: word.word,
          meanings: word.meanings || [],
          mostCommonMeaning,
          mostCommonPinyin,
          variantCount,
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

function checkCharacterImage(char: string): boolean {
  try {
    const imagePath = join(process.cwd(), "public", "characters", `${char}.png`);
    return existsSync(imagePath);
  } catch {
    return false;
  }
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { char } = await params;
  const decodedChar = decodeURIComponent(char);
  const details = getCharacterDetails(decodedChar);
  const hasImage = checkCharacterImage(decodedChar);

  console.log(details);
  if (!details) {
    notFound();
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      {/* Split Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left 1/3 - Image Section */}
        {hasImage && (
          <div className="w-1/3 h-full flex items-center justify-center p-8 border-r border-gray-200 dark:border-gray-800">
            <div className="relative w-full h-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden p-4">
              <Image
                src={`/characters/${decodedChar}.png`}
                alt={`${decodedChar} character image`}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Right 2/3 - Content Section (scrollable) */}
        <div className={`${hasImage ? 'w-2/3' : 'w-full'} h-full overflow-y-auto`}>
          <main className="px-8 py-12">
            {/* Character Display */}
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
                        <div className="text-sm text-gray-500 mb-1">
                          {word.mostCommonPinyin}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {word.mostCommonMeaning}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">
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
      </div>
    </div>
  );
}
