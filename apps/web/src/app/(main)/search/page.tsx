import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

function SearchPageFallback() {
  return (
    <main className="min-h-screen container mx-auto py-8">
      <h1 className="text-3xl font-bold text-brown mb-2">Search Results</h1>
      <p className="text-brown-dark mb-8">Loading search results...</p>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
