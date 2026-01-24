'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { useToast } from '../../../../lib/hooks/useToast';
import { recipesApi } from '../../../../lib/api/recipes';
import type { Recipe } from '../../../../lib/api/types';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export default function MyRecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/autentificare');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user's recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Use getMyRecipes endpoint to fetch authenticated user's recipes
        const response = await recipesApi.getMyRecipes({ 
          sort: 'created_at:desc' 
        });
        setRecipes(response.data?.items || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        error('Nu am putut încărca rețetele tale');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchRecipes();
    }
  }, [isAuthenticated, user?.id, error]);

  const handleDelete = async (recipe: Recipe) => {
    const confirmed = window.confirm(
      `Ești sigur că vrei să ștergi rețeta "${recipe.title}"? Această acțiune nu poate fi anulată.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(recipe.id);
      await recipesApi.delete(recipe.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      success('Rețeta a fost ștearsă cu succes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      error('Nu am putut șterge rețeta. Te rugăm să încerci din nou.');
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      usor: 'Ușor',
      mediu: 'Mediu',
      greu: 'Greu',
    };
    return labels[difficulty] || difficulty;
  };

  const formatCookingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Back navigation */}
      <Link 
        href="/profil" 
        className="inline-flex items-center gap-2 text-brown hover:text-brown/70 transition-colors mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        <span>Înapoi la profil</span>
      </Link>

      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-theme-primary">
          Rețetele mele
        </h1>
        <Link
          href="/profil/retete/noua"
          className="px-6 py-3 rounded-lg font-semibold text-white bg-brown hover:bg-brown/90 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          Adaugă rețetă nouă
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && recipes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-6">
            <i className="fa-solid fa-utensils text-3xl text-brown/50"></i>
          </div>
          <h2 className="text-xl font-display font-bold text-theme-primary mb-2">
            Nu ai creat încă nicio rețetă
          </h2>
          <p className="text-theme-secondary mb-6 max-w-md">
            Începe să îți împărtășești rețetele preferate cu comunitatea noastră.
          </p>
          <Link
            href="/profil/retete/noua"
            className="px-6 py-3 rounded-lg font-semibold text-white bg-brown hover:bg-brown/90 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            Creează prima ta rețetă
          </Link>
        </div>
      )}

      {/* Recipes grid */}
      {!isLoading && recipes.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-theme-card rounded-2xl overflow-hidden shadow-rustic"
            >
              {/* Card image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={recipe.imageUrl || '/images/placeholders/recipe-placeholder-2.png'}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
                {/* Category badge */}
                {recipe.category && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-mint text-brown">
                    {recipe.category.name}
                  </span>
                )}
              </div>

              {/* Card content */}
              <div className="p-4">
                <h3 className="font-display font-bold text-lg text-theme-primary mb-2 line-clamp-2">
                  {recipe.title}
                </h3>

                {/* Recipe meta */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-theme-secondary mb-3">
                  {recipe.difficulty && (
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-signal text-xs"></i>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  )}
                  {recipe.cookTime > 0 && (
                    <span className="flex items-center gap-1">
                      <i className="fa-regular fa-clock text-xs"></i>
                      {formatCookingTime(recipe.cookTime)}
                    </span>
                  )}
                  {recipe.ratingAvg > 0 && (
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-star text-xs text-peach"></i>
                      {recipe.ratingAvg.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/reteta/${recipe.slug}`}
                    className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors bg-mint/30 text-brown hover:bg-mint/50"
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span className="hidden sm:inline">Vezi</span>
                  </Link>
                  <Link
                    href={`/profil/retete/${recipe.id}/editeaza`}
                    className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors bg-peach/30 text-brown hover:bg-peach/50"
                  >
                    <i className="fa-solid fa-pencil"></i>
                    <span className="hidden sm:inline">Editează</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe)}
                    disabled={deletingId === recipe.id}
                    className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors bg-pink/30 text-brown hover:bg-pink/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === recipe.id ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-trash"></i>
                    )}
                    <span className="hidden sm:inline">Șterge</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
