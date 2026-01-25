'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { recipesApi } from '../../../../lib/api/recipes';
import type { Recipe } from '../../../../lib/api/types';

const selectionNames: Record<string, string> = {
  craciun: 'Mâncăruri de Crăciun',
  pasti: 'Mâncăruri de Paști',
  post: 'Mâncăruri de Post',
  dietice: 'Mâncăruri Dietice',
};

const selectionDescriptions: Record<string, string> = {
  craciun: 'Rețete festive pentru masa de Crăciun',
  pasti: 'Preparate tradiționale pentru Paști',
  post: 'Rețete delicioase pentru perioadele de post',
  dietice: 'Preparate sănătoase cu calorii reduse',
};

const selectionIcons: Record<string, string> = {
  craciun: 'fa-tree',
  pasti: 'fa-egg',
  post: 'fa-seedling',
  dietice: 'fa-heart',
};

// Mapping from selection slug to recipe_category_id
// These IDs correspond to thematic selection categories in the database
const selectionCategoryIds: Record<string, number> = {
  craciun: 7,
  pasti: 8,
  post: 9,
  dietice: 10,
};

const sortOptions = [
  { label: 'Recente (cele mai noi)', value: 'created_at:desc' },
  { label: 'Vechi (cele mai vechi)', value: 'created_at:asc' },
  { label: 'Alfabetic A-Z', value: 'title:asc' },
  { label: 'Alfabetic Z-A', value: 'title:desc' },
  { label: 'Dificultate', value: 'difficulty:asc' },
  { label: 'Popularitate (descrescător)', value: 'likes_count:desc' },
  { label: 'Popularitate (crescător)', value: 'likes_count:asc' },
];

const difficultyColors: Record<string, string> = {
  usor: 'bg-mint text-brown',
  mediu: 'bg-peach text-brown',
  greu: 'bg-pink text-brown',
};

export default function SelectionPage() {
  const params = useParams();
  const selection = params.selection as string;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const selectionName = selectionNames[selection] || selection;
  const selectionDescription = selectionDescriptions[selection] || '';
  const selectionIcon = selectionIcons[selection] || 'fa-utensils';

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const categoryId = selectionCategoryIds[selection];
        if (!categoryId) {
          console.error(`Unknown selection: ${selection}`);
          setRecipes([]);
          setLoading(false);
          return;
        }
        
        const response = await recipesApi.getAll({
          filter: `recipe_category_id:eq:${categoryId}`,
          sort: sortBy,
          page,
          limit: 12,
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
    };
    fetchRecipes();
  }, [selection, sortBy, page]);

  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      {/* Header */}
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-theme-secondary mb-4">
            <Link href="/" className="hover:text-peach">Acasă</Link>
            <span className="mx-2">/</span>
            <Link href="/selectii" className="hover:text-peach">Selecții</Link>
            <span className="mx-2">/</span>
            <span className="text-theme-primary">{selectionName}</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center">
              <i className={`fas ${selectionIcon} text-2xl text-brown`}></i>
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-theme-primary">
                {selectionName}
              </h1>
              <p className="text-theme-secondary">{selectionDescription}</p>
            </div>
          </div>
          <p className="text-theme-secondary">
            {totalCount} rețete găsite
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-4 border-b border-theme">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-theme-secondary font-medium">
              <i className="fas fa-filter mr-2"></i>Ordonează după:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-theme-input border border-theme text-theme-primary focus:outline-none focus:border-peach"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Recipe Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
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
                Nu am găsit rețete
              </h2>
              <p className="text-theme-secondary mb-6">
                Încearcă să explorezi alte selecții sau categorii
              </p>
              <Link
                href="/selectii"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-peach text-brown font-medium hover:bg-peach/80 transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
                Înapoi la Selecții
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
