'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Character } from '@/lib/types';
import { ensureSeeded, getCharacterList } from '@/lib/client-storage';

const GRID_SIZE = 2000;
const SKELETON_CELLS = Array.from({ length: GRID_SIZE });

interface CharacterGridProps {
  refreshKey?: number;
}

export default function CharacterGrid({ refreshKey }: CharacterGridProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, [refreshKey]);

  const loadCharacters = async () => {
    try {
      const data = await ensureSeeded();
      setCharacters(getCharacterList(data));
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
        {SKELETON_CELLS.map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white dark:bg-black"
          >
            <div className="w-full h-full animate-pulse bg-gray-100 dark:bg-gray-900" style={{ animationDelay: `${(i % 40) * 25}ms` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
      {characters.map((char) => (
        <Link
          key={char.character}
          href={`/character/${encodeURIComponent(char.character)}`}
          className={`
            aspect-square flex items-center justify-center text-3xl
            transition-opacity duration-150 cursor-pointer
            ${char.seenCount > 0
              ? 'bg-black text-white hover:opacity-70 dark:bg-white dark:text-black'
              : 'bg-white text-gray-300 hover:text-gray-600 dark:bg-black dark:text-gray-700 dark:hover:text-gray-500'
            }
          `}
          title={`${char.character} ${char.pinyin ? `(${char.pinyin})` : ''} - Seen: ${char.seenCount} times`}
        >
          {char.character}
        </Link>
      ))}
    </div>
  );
}
