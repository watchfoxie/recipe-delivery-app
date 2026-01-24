'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { recipesApi } from '../../../../lib/api/recipes';
import { favoritesApi } from '../../../../lib/api/favorites';
import { reviewsApi } from '../../../../lib/api/reviews';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { useToast } from '../../../../lib/hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import StarRating from '../../../../components/ui/StarRating';
import type { Recipe, Review } from '../../../../lib/api/types';

// Difficulty badge colors
const difficultyBadge: Record<string, { label: string; classes: string }> = {
  usor: { label: 'Ușor', classes: 'bg-mint text-green-800' },
  mediu: { label: 'Mediu', classes: 'bg-peach text-orange-800' },
  greu: { label: 'Greu', classes: 'bg-pink text-red-800' },
};

export default function RecipeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  // Recipe state
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Fetch recipe by slug
  const fetchRecipe = useCallback(async () => {
    if (!slug) return;
    
    setIsLoading(true);
    setNotFound(false);
    
    try {
      const data = await recipesApi.getBySlug(slug);
      setRecipe(data);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Check if recipe is favorited
  const checkFavorite = useCallback(async () => {
    if (!recipe || !isAuthenticated) return;
    
    try {
      const isFav = await favoritesApi.check(recipe.id);
      setIsFavorite(isFav);
    } catch {
      // Ignore errors
    }
  }, [recipe, isAuthenticated]);

  // Fetch reviews for recipe
  const fetchReviews = useCallback(async () => {
    if (!recipe) return;
    
    setReviewsLoading(true);
    try {
      const data = await reviewsApi.getByRecipe(recipe.id);
      setReviews(data);
      
      // Check if user has already reviewed
      if (isAuthenticated && user) {
        const existingReview = data.find(r => r.userId === user.id);
        setUserReview(existingReview || null);
      }
    } catch {
      // Ignore errors
    } finally {
      setReviewsLoading(false);
    }
  }, [recipe, isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  // Fetch related data when recipe loads
  useEffect(() => {
    if (recipe) {
      checkFavorite();
      fetchReviews();
    }
  }, [recipe, checkFavorite, fetchReviews]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!recipe) return;
    
    if (!isAuthenticated) {
      showError('Trebuie să fii autentificat pentru a salva rețete la favorite.');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(recipe.id);
        setIsFavorite(false);
        success('Rețeta a fost eliminată din favorite.');
      } else {
        await favoritesApi.add(recipe.id);
        setIsFavorite(true);
        success('Rețeta a fost adăugată la favorite!');
      }
    } catch {
      showError('A apărut o eroare. Încercați din nou.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipe) return;
    
    if (!isAuthenticated) {
      showError('Trebuie să fii autentificat pentru a lăsa o recenzie.');
      return;
    }

    if (newRating === 0) {
      showError('Te rugăm să selectezi un rating.');
      return;
    }

    setSubmittingReview(true);
    try {
      const review = await reviewsApi.create(recipe.id, {
        rating: newRating,
        comment: newComment || undefined,
      });
      
      setReviews(prev => [review, ...prev]);
      setUserReview(review);
      setNewRating(0);
      setNewComment('');
      success('Recenzia ta a fost publicată!');
      
      // Refresh recipe to update average rating
      fetchRecipe();
    } catch {
      showError('A apărut o eroare la publicarea recenziei.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Share functions
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = recipe?.title || 'Rețetă delicioasă';

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnDiscord = () => {
    // Discord doesn't have a direct share URL, so we copy to clipboard
    navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
    success('Link-ul a fost copiat! Lipește-l pe Discord.');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Se încarcă rețeta..." />
      </div>
    );
  }

  // Not found state
  if (notFound || !recipe) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-theme-card rounded-2xl shadow-rustic p-12 text-center">
          <i className="fas fa-utensils text-6xl text-brown/30 mb-4"></i>
          <h1 className="text-2xl font-bold text-brown mb-2">Rețeta nu a fost găsită</h1>
          <p className="text-brown/70 mb-6">
            Ne pare rău, dar rețeta pe care o cauți nu există sau a fost ștearsă.
          </p>
          <Link
            href="/retete"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brown text-cream rounded-full hover:bg-brown/90 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Înapoi la rețete
          </Link>
        </div>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;
  const badge = difficultyBadge[recipe.difficulty] || difficultyBadge.mediu;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-rustic-lg">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-cream-dark flex items-center justify-center">
            <i className="fas fa-utensils text-6xl text-brown/30"></i>
          </div>
        )}
        
        {/* Favorite button overlay */}
        <button
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className={`
            absolute top-4 right-4 w-12 h-12 rounded-full 
            flex items-center justify-center
            transition-all duration-200
            ${isFavorite 
              ? 'bg-pink text-red-600' 
              : 'bg-white/90 text-brown hover:bg-pink/80 hover:text-red-600'
            }
            ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
            shadow-lg
          `}
          aria-label={isFavorite ? 'Elimină din favorite' : 'Adaugă la favorite'}
        >
          <i className={`${isFavorite ? 'fas' : 'far'} fa-heart text-xl`}></i>
        </button>
      </div>

      {/* Title & Meta Section */}
      <div className="bg-theme-card rounded-2xl shadow-rustic p-6 mt-6">
        {/* Category badge */}
        {recipe.category && (
          <Link
            href={`/retete/${recipe.category.slug}`}
            className="inline-block px-3 py-1 bg-cream text-brown text-sm rounded-full hover:bg-cream-dark transition-colors mb-3"
          >
            {recipe.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-brown mb-3">
          {recipe.title}
        </h1>

        {/* Description */}
        <p className="text-brown/80 text-lg mb-4">
          {recipe.description}
        </p>

        {/* Meta info row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-brown/70 mb-4">
          {/* Prep time */}
          <div className="flex items-center gap-1">
            <i className="fas fa-clock"></i>
            <span>Prep: {recipe.prepTime} min</span>
          </div>
          
          {/* Cook time */}
          <div className="flex items-center gap-1">
            <i className="fas fa-fire"></i>
            <span>Gătit: {recipe.cookTime} min</span>
          </div>

          {/* Total time */}
          <div className="flex items-center gap-1">
            <i className="fas fa-hourglass-half"></i>
            <span>Total: {totalTime} min</span>
          </div>

          {/* Servings */}
          <div className="flex items-center gap-1">
            <i className="fas fa-users"></i>
            <span>{recipe.servings} porții</span>
          </div>

          {/* Difficulty badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.classes}`}>
            {badge.label}
          </span>
        </div>

        {/* Rating & Author row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-brown/10">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={recipe.ratingAvg} size="md" showValue />
            <span className="text-brown/60 text-sm">
              ({reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'})
            </span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 text-brown/70">
            <i className="fas fa-user-circle"></i>
            <span>
              de <span className="font-medium text-brown">{recipe.author.firstName} {recipe.author.lastName}</span>
            </span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-brown/10">
          <span className="text-sm text-brown/70">Distribuie:</span>
          <button
            onClick={shareOnFacebook}
            className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Share on Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </button>
          <button
            onClick={shareOnTwitter}
            className="w-9 h-9 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Share on Twitter"
          >
            <i className="fab fa-twitter"></i>
          </button>
          <button
            onClick={shareOnDiscord}
            className="w-9 h-9 rounded-full bg-[#5865F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Share on Discord"
          >
            <i className="fab fa-discord"></i>
          </button>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="bg-theme-card rounded-2xl shadow-rustic p-6 mt-6">
        <h2 className="text-2xl font-bold text-brown mb-4 flex items-center gap-2">
          <i className="fas fa-carrot text-peach"></i>
          Ingrediente
        </h2>
        
        {recipe.ingredients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brown/10">
                  <th className="text-left py-2 text-brown/70 font-medium">Ingredient</th>
                  <th className="text-right py-2 text-brown/70 font-medium">Cantitate</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((item) => (
                  <tr key={item.id} className="border-b border-brown/5 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {item.ingredient.iconClass && (
                          <i className={`${item.ingredient.iconClass} text-brown/50`}></i>
                        )}
                        <span className="text-brown font-medium">{item.ingredient.name}</span>
                        {item.notes && (
                          <span className="text-brown/50 text-sm">({item.notes})</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right text-brown/80">
                      {item.quantity} {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-brown/60 italic">Nu sunt ingrediente specificate.</p>
        )}
      </div>

      {/* Preparation Steps Section */}
      <div className="bg-theme-card rounded-2xl shadow-rustic p-6 mt-6">
        <h2 className="text-2xl font-bold text-brown mb-4 flex items-center gap-2">
          <i className="fas fa-list-ol text-mint"></i>
          Mod de preparare
        </h2>

        {recipe.steps.length > 0 ? (
          <ol className="space-y-6">
            {recipe.steps
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((step, index) => (
                <li key={step.id} className="flex gap-4">
                  {/* Step number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brown text-cream flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1">
                    <p className="text-brown leading-relaxed">{step.instruction}</p>
                    
                    {/* Step duration if present */}
                    {step.duration && (
                      <p className="text-brown/50 text-sm mt-1 flex items-center gap-1">
                        <i className="fas fa-clock"></i>
                        {step.duration} minute
                      </p>
                    )}

                    {/* Step image if present */}
                    {step.imageUrl && (
                      <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden">
                        <Image
                          src={step.imageUrl}
                          alt={`Pasul ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ol>
        ) : (
          <p className="text-brown/60 italic">Nu sunt pași de preparare specificați.</p>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-theme-card rounded-2xl shadow-rustic p-6 mt-6">
        <h2 className="text-2xl font-bold text-brown mb-4 flex items-center gap-2">
          <i className="fas fa-comments text-pink"></i>
          Recenzii ({reviews.length})
        </h2>

        {/* Add review form (only if authenticated and hasn't reviewed yet) */}
        {isAuthenticated && !userReview ? (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-cream/50 rounded-xl">
            <h3 className="font-semibold text-brown mb-3">Lasă o recenzie</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-brown/70 mb-2">Rating-ul tău</label>
              <StarRating
                rating={newRating}
                size="lg"
                interactive
                onRate={setNewRating}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm text-brown/70 mb-2">
                Comentariu (opțional)
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Spune-ne ce părere ai despre această rețetă..."
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-brown/20 bg-white text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-brown/30 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview || newRating === 0}
              className="px-6 py-2 bg-brown text-cream rounded-full font-medium hover:bg-brown/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submittingReview ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Se publică...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Publică recenzia
                </>
              )}
            </button>
          </form>
        ) : isAuthenticated && userReview ? (
          <div className="mb-6 p-4 bg-mint/30 rounded-xl">
            <p className="text-brown/70 text-sm flex items-center gap-2">
              <i className="fas fa-check-circle text-green-600"></i>
              Ai lăsat deja o recenzie pentru această rețetă.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-cream/50 rounded-xl">
            <p className="text-brown/70 text-sm">
              <Link href="/login" className="text-brown font-medium hover:underline">
                Autentifică-te
              </Link>{' '}
              pentru a lăsa o recenzie.
            </p>
          </div>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Se încarcă recenziile..." />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 rounded-xl ${
                  review.userId === user?.id ? 'bg-mint/20 border border-mint' : 'bg-cream/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-brown/20 flex items-center justify-center overflow-hidden">
                      {review.user.avatar ? (
                        <Image
                          src={review.user.avatar}
                          alt={review.user.firstName}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <i className="fas fa-user text-brown/50"></i>
                      )}
                    </div>
                    
                    {/* Name & date */}
                    <div>
                      <p className="font-medium text-brown">
                        {review.user.firstName} {review.user.lastName}
                        {review.userId === user?.id && (
                          <span className="ml-2 text-xs text-mint font-normal">(tu)</span>
                        )}
                      </p>
                      <p className="text-xs text-brown/50">
                        {new Date(review.createdAt).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <StarRating rating={review.rating} size="sm" />
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-brown/80 mt-2 pl-13">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-comment-slash text-4xl text-brown/20 mb-3"></i>
            <p className="text-brown/60">
              Încă nu există recenzii pentru această rețetă.
              <br />
              Fii primul care lasă o părere!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
