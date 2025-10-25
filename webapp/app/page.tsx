import CharacterGrid from '@/components/CharacterGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="py-8">
        <header className="mb-8 ml-3 font-mono">
          <h1 className="text-2xl font-light tracking-tight text-black dark:text-white">
            Charadex
          </h1>
        </header>

        <CharacterGrid />
      </main>
    </div>
  );
}
