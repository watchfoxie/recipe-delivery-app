'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { useToast } from '../../../../lib/hooks/useToast';
import { favoritesApi } from '../../../../lib/api/favorites';
import type { Recipe } from '../../../../lib/api/types';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const difficultyLabels: Record<string, string> = {
  usor: 'Ușor',
  mediu: 'Mediu',
  greu: 'Greu',
};

const difficultyColors: Record<string, string> = {
  usor: 'bg-mint text-brown',
  mediu: 'bg-peach text-brown',
  greu: 'bg-pink text-brown',
};

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();

  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/autentificare');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch favorites on mount
  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await favoritesApi.getAll();
      // API returns PaginatedResponse<Recipe> - extract items
      setFavorites(response.data.items);
    } catch (err) {
      error('Nu am putut încărca rețetele favorite');
      console.error('Failed to fetch favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  // Remove from favorites
  const handleRemoveFavorite = async (recipeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (removingIds.has(recipeId)) return;

    setRemovingIds((prev) => new Set(prev).add(recipeId));

    try {
      await favoritesApi.remove(recipeId);
      setFavorites((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      success('Rețeta a fost eliminată din favorite');
    } catch (err) {
      error('Nu am putut elimina rețeta din favorite');
      console.error('Failed to remove favorite:', err);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(recipeId);
        return next;
      });
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fa-solid fa-star text-peach"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fa-solid fa-star-half-stroke text-peach"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star text-peach"></i>);
      }
    }
    return stars;
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <main className="min-h-screen py-8 px-4 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Se încarcă..." />
      </main>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen py-8 px-4 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecționare..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/profil"
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Înapoi la profil</span>
        </Link>

        {/* Page Header */}
        <h1 className="text-3xl font-display font-bold text-theme-primary mb-2">
          Rețetele mele favorite
        </h1>
        <p className="text-theme-secondary mb-8">
          Toate rețetele pe care le-ai salvat pentru mai târziu
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Se încarcă favoritele..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="bg-theme-card rounded-2xl shadow-rustic p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-pink/20 flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-heart text-4xl text-pink"></i>
            </div>
            <h2 className="font-display text-xl font-bold text-theme-primary mb-2">
              Nu ai încă rețete favorite
            </h2>
            <p className="text-theme-secondary mb-6">
              Explorează colecția noastră de rețete și salvează-le pe cele care îți plac
            </p>
            <Link
              href="/retete"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brown text-white rounded-full font-medium hover:bg-brown/90 transition-colors"
            >
              <i className="fa-solid fa-compass"></i>
              <span>Descoperă rețete</span>
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites.length > 0 && (
          <>
            <p className="text-sm text-theme-secondary mb-4">
              {favorites.length} {favorites.length === 1 ? 'rețetă salvată' : 'rețete salvate'}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe) => {
                const totalTime = recipe.prepTime + recipe.cookTime;
                const isRemoving = removingIds.has(recipe.id);

                return (
                  <Link
                    key={recipe.id}
                    href={`/reteta/${recipe.slug}`}
                    className="bg-theme-card rounded-2xl overflow-hidden shadow-rustic hover:shadow-rustic-lg transition-all cursor-pointer group"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={recipe.imageUrl || '/images/placeholders/recipe-placeholder-2.png'}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleRemoveFavorite(recipe.id, e)}
                        disabled={isRemoving}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                        aria-label="Elimină din favorite"
                      >
                        {isRemoving ? (
                          <i className="fa-solid fa-spinner fa-spin text-pink"></i>
                        ) : (
                          <i className="fa-solid fa-heart text-pink"></i>
                        )}
                      </button>

                      {/* Difficulty Badge */}
                      <span
                        className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                          difficultyColors[recipe.difficulty] || 'bg-mint text-brown'
                        }`}
                      >
                        {difficultyLabels[recipe.difficulty] || recipe.difficulty}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <h3 className="font-display font-bold text-lg text-theme-primary mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-theme-secondary">
                        {/* Cooking Time */}
                        <span className="flex items-center gap-1">
                          <i className="fa-regular fa-clock"></i>
                          <span>{totalTime} min</span>
                        </span>

                        {/* Rating */}
                        {recipe.ratingAvg > 0 && (
                          <span className="flex items-center gap-1">
                            {renderStars(recipe.ratingAvg)}
                            <span className="ml-1">({recipe.ratingAvg.toFixed(1)})</span>
                          </span>
                        )}
                      </div>

                      {/* Category */}
                      {recipe.category && (
                        <p className="text-xs text-theme-secondary mt-2">
                          <i className="fa-solid fa-folder mr-1"></i>
                          {recipe.category.name}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
