import CharacterGrid from '@/components/CharacterGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="py-8">
        <header className="mb-8 ml-3 font-mono flex justify-between items-center pr-3">
          <h1 className="text-2xl font-light tracking-tight text-black dark:text-white">
            Charadex
          </h1>
          <Link
            href="/settings"
            className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Settings
          </Link>
        </header>

        <CharacterGrid />
      </main>
    </div>
  );
}
