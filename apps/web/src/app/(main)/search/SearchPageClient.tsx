'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { recipesApi } from '../../../lib/api/recipes';
import type { Recipe } from '../../../lib/api/types';

const sortOptions = [
  { label: 'Relevență', value: 'relevance:desc' },
  { label: 'Recente (cele mai noi)', value: 'created_at:desc' },
  { label: 'Vechi (cele mai vechi)', value: 'created_at:asc' },
  { label: 'Alfabetic A-Z', value: 'title:asc' },
  { label: 'Alfabetic Z-A', value: 'title:desc' },
  { label: 'Dificultate', value: 'difficulty:asc' },
  { label: 'Popularitate (descrescător)', value: 'likes_count:desc' },
  { label: 'Popularitate (crescător)', value: 'likes_count:asc' },
];

const difficultyOptions = [
  { label: 'Toate', value: '' },
  { label: 'Ușor', value: 'usor' },
  { label: 'Mediu', value: 'mediu' },
  { label: 'Greu', value: 'greu' },
];

const prepTimeOptions = [
  { label: 'Toate', value: '' },
  { label: 'Sub 15 min', value: '0-15' },
  { label: '15-30 min', value: '15-30' },
  { label: '30-60 min', value: '30-60' },
  { label: 'Peste 60 min', value: '60+' },
];

const difficultyColors: Record<string, string> = {
  usor: 'bg-mint text-brown',
  mediu: 'bg-peach text-brown',
  greu: 'bg-pink text-brown',
};

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(query);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance:desc');
  const [difficulty, setDifficulty] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRecipes = useCallback(async () => {
    if (!query) {
      setRecipes([]);
      setTotalCount(0);
      return;
    }
    
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (difficulty) {
        filters.difficulty = `eq:${difficulty}`;
      }
      if (prepTime) {
        const [min, max] = prepTime.split('-');
        if (max === '+') {
          filters.prepTime = `gte:${min}`;
        } else if (max) {
          filters.prepTime = `gte:${min},lte:${max}`;
        }
      }
      
      const response = await recipesApi.getAll({
        search: query,
        sort: sortBy === 'relevance:desc' ? undefined : sortBy,
        page,
        limit: 12,
        ...filters,
      });
      setRecipes(response.data?.items || []);
      setTotalCount(response.data?.total || 0);
      setTotalPages(Math.ceil((response.data?.total || 0) / (response.data?.limit || 12)));
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [query, sortBy, difficulty, prepTime, page]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    setSearchInput(query);
    setPage(1);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      {/* Header */}
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-theme-secondary mb-4">
            <Link href="/" className="hover:text-peach">Acasă</Link>
            <span className="mx-2">/</span>
            <span className="text-theme-primary">Căutare</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-theme-primary mb-4">
            <i className="fas fa-search mr-3 text-peach"></i>Căutare Rețete
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary"></i>
                <input
                  type="search"
                  placeholder="Caută rețete, ingrediente..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-theme-input border border-theme text-theme-primary placeholder-theme-secondary focus:outline-none focus:border-peach transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="px-8 py-3 rounded-xl bg-peach text-brown font-medium hover:bg-peach/80 transition-colors"
              >
                Caută
              </button>
            </div>
          </form>
          
          {query && (
            <p className="text-theme-secondary mt-4">
              {totalCount} rezultate pentru: <strong className="text-theme-primary">&quot;{query}&quot;</strong>
            </p>
          )}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-4 border-b border-theme bg-theme-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-theme-secondary font-medium">
              <i className="fas fa-sliders-h mr-2"></i>Filtre:
            </span>
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-theme-secondary">Ordonare:</label>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                className="px-3 py-2 rounded-lg bg-theme-input border border-theme text-theme-primary text-sm focus:outline-none focus:border-peach"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-theme-secondary">Dificultate:</label>
              <select
                value={difficulty}
                onChange={(e) => handleFilterChange(setDifficulty, e.target.value)}
                className="px-3 py-2 rounded-lg bg-theme-input border border-theme text-theme-primary text-sm focus:outline-none focus:border-peach"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prep Time */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-theme-secondary">Timp:</label>
              <select
                value={prepTime}
                onChange={(e) => handleFilterChange(setPrepTime, e.target.value)}
                className="px-3 py-2 rounded-lg bg-theme-input border border-theme text-theme-primary text-sm focus:outline-none focus:border-peach"
              >
                {prepTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(difficulty || prepTime || sortBy !== 'relevance:desc') && (
              <button
                onClick={() => {
                  setDifficulty('');
                  setPrepTime('');
                  setSortBy('relevance:desc');
                  setPage(1);
                }}
                className="text-sm text-peach hover:text-peach/80 transition-colors"
              >
                <i className="fas fa-times mr-1"></i>Resetează filtrele
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {!query ? (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-theme-secondary mb-4"></i>
              <h2 className="font-heading text-2xl text-theme-primary mb-2">
                Caută rețete delicioase
              </h2>
              <p className="text-theme-secondary max-w-md mx-auto">
                Introdu un termen de căutare pentru a găsi rețete după nume, ingrediente sau descriere.
              </p>
            </div>
          ) : loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-theme-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-theme-secondary"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-theme-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-theme-secondary rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/recipes/${recipe.slug}`}
                    className="bg-theme-card rounded-2xl overflow-hidden shadow-rustic hover:-translate-y-1 hover:shadow-rustic-lg transition-all duration-300"
                  >
                    <div className="relative">
                      <Image
                        src={recipe.imageUrl || '/images/placeholders/recipe-placeholder-2.png'}
                        alt={recipe.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty] || 'bg-mint text-brown'}`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-sm text-theme-secondary mb-2">
                        <span><i className="fas fa-clock mr-1"></i>{recipe.prepTime || '30'} min</span>
                        <span className="mx-2">•</span>
                        <span><i className="fas fa-heart mr-1"></i>{recipe.likesCount || 0}</span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-theme-primary line-clamp-2">
                        {recipe.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-theme-card border border-theme text-theme-primary hover:border-peach disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>Anterior
                  </button>
                  <span className="px-4 py-2 text-theme-secondary">
                    Pagina {page} din {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-theme-card border border-theme text-theme-primary hover:border-peach disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Următor<i className="fas fa-chevron-right ml-2"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-theme-secondary mb-4"></i>
              <h2 className="font-heading text-2xl text-theme-primary mb-2">
                Nu am găsit rezultate
              </h2>
              <p className="text-theme-secondary mb-6 max-w-md mx-auto">
                Nu am găsit rețete pentru &quot;{query}&quot;. Încearcă alte cuvinte cheie sau explorează categoriile noastre.
              </p>
              <Link
                href="/retete"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-peach text-brown font-medium hover:bg-peach/80 transition-colors"
              >
                <i className="fas fa-utensils"></i>
                Explorează Rețetele
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
