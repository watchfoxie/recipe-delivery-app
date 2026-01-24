'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { recipesApi } from '../../../../lib/api/recipes';
import type { Recipe } from '../../../../lib/api/types';

const ingredientNames: Record<string, string> = {
  cereale: 'Cereale',
  legume: 'Legume',
  condimente: 'Condimente și ierburi',
  fructe: 'Fructe',
  dulciuri: 'Dulciuri și zahăr',
  carne: 'Carne',
  peste: 'Pește',
  lactate: 'Lactate și ouă',
  grasimi: 'Grăsimi și uleiuri',
  nuci: 'Nuci și semințe',
  bauturi: 'Băuturi',
};

const ingredientIcons: Record<string, string> = {
  cereale: 'fa-wheat-awn',
  legume: 'fa-carrot',
  condimente: 'fa-mortar-pestle',
  fructe: 'fa-apple-whole',
  dulciuri: 'fa-candy-cane',
  carne: 'fa-drumstick-bite',
  peste: 'fa-fish',
  lactate: 'fa-cheese',
  grasimi: 'fa-oil-can',
  nuci: 'fa-seedling',
  bauturi: 'fa-wine-glass',
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

export default function IngredientPage() {
  const params = useParams();
  const ingredient = params.ingredient as string;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [totalCount, setTotalCount] = useState(0);

  const ingredientName = ingredientNames[ingredient] || ingredient;
  const ingredientIcon = ingredientIcons[ingredient] || 'fa-utensils';

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await recipesApi.getAll({
          filter: `ingredient:eq:${ingredient}`,
          sort: sortBy,
          limit: 12,
        });
        setRecipes(response.data?.items || []);
        setTotalCount(response.data?.total || 0);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [ingredient, sortBy]);

  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      {/* Header with icon */}
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm text-theme-secondary mb-4">
            <Link href="/" className="hover:text-peach">Acasă</Link>
            <span className="mx-2">/</span>
            <Link href="/ingrediente" className="hover:text-peach">Ingrediente</Link>
            <span className="mx-2">/</span>
            <span className="text-theme-primary">{ingredientName}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-pink flex items-center justify-center">
              <i className={`fas ${ingredientIcon} text-2xl text-brown`}></i>
            </div>
            <div>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-theme-primary">
                Rețete cu {ingredientName}
              </h1>
              <p className="text-theme-secondary">{totalCount} rețete găsite</p>
            </div>
          </div>
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
              onChange={(e) => setSortBy(e.target.value)}
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

      {/* Recipe Grid - same as other subcategory pages */}
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
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-theme-secondary mb-4"></i>
              <h2 className="font-heading text-2xl text-theme-primary mb-2">
                Nu am găsit rețete cu acest ingredient
              </h2>
              <p className="text-theme-secondary">
                Încearcă să explorezi alte ingrediente
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
