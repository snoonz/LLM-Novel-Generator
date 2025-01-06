'use client';

import NovelGenerator from '@/components/NovelGenerator';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">AI小説ジェネレーター</h1>
      <NovelGenerator />
    </main>
  );
}