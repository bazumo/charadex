'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Character } from '@/lib/types';

export default function CharacterGrid() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading characters...</p>
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
