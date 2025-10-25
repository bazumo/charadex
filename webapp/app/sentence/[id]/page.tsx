import { notFound } from "next/navigation";
import { readData } from "@/lib/storage";
import PageHeader from "@/components/PageHeader";
import WordTooltip from "@/components/WordTooltip";
import Link from "next/link";

interface SentencePageProps {
  params: Promise<{ id: string }>;
}

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

function getSentenceDetails(id: string): SentenceDetails | null {
  try {
    const data = readData();

    // Get sentence data
    const sentence = data.sentences[id];

    if (!sentence) {
      return null;
    }

    // Get all word occurrences in this sentence
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
      .sort((a, b) => a.position - b.position) || []; // Sort by position

    return {
      id: sentence.id,
      text: sentence.text,
      source: sentence.source,
      occurrences,
    };
  } catch (error) {
    console.error("Error fetching sentence details:", error);
    return null;
  }
}

// Function to split sentence text into word segments
function segmentSentence(text: string, words: Array<{ word: string; meaning: string; pinyin: string }>): Array<{ text: string; word?: { word: string; meaning: string; pinyin: string } }> {
  const segments: Array<{ text: string; word?: { word: string; meaning: string; pinyin: string } }> = [];

  // Sort words by length (longest first) to match longer words first
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

  let position = 0;

  while (position < text.length) {
    const remainingText = text.slice(position);
    let matched = false;

    // Try to find a matching word at current position (longest match first)
    for (const word of sortedWords) {
      if (remainingText.startsWith(word.word)) {
        // Found a word match
        segments.push({
          text: word.word,
          word: word,
        });
        position += word.word.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // No word match, add single character as plain text
      const char = text[position];
      // Check if last segment is plain text, if so append to it
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

export default async function SentencePage({ params }: SentencePageProps) {
  const { id } = await params;
  const details = getSentenceDetails(id);

  if (!details) {
    notFound();
  }

  const segments = segmentSentence(details.text, details.occurrences);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-8 py-12 max-w-4xl">
          {/* Sentence Display */}
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

            {/* Source */}
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

          {/* Words Section */}
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {occurrence.meaning}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
