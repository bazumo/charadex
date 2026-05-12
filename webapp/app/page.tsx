'use client';

import { useState } from 'react';
import CharacterGrid from '@/components/CharacterGrid';
import CaptureForm from '@/components/CaptureForm';
import Link from 'next/link';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="py-8">
        <header className="mb-8 ml-3 font-mono flex justify-between items-center pr-3">
          <h1 className="text-2xl font-light tracking-tight text-black dark:text-white">
            Charadex
          </h1>
          <div className="flex items-center gap-4">
            <CaptureForm onCapture={() => setRefreshKey((k) => k + 1)} />
            <Link
              href="/settings"
              className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Settings
            </Link>
            <Link
              href="https://www.youtube.com/watch?v=CwTEyKz6p7E&feature=youtu.be"
              className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Demo
            </Link>
          </div>
        </header>

        <CharacterGrid refreshKey={refreshKey} />
      </main>
    </div>
  );
}
