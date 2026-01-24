'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { recipesApi } from '../../lib/api/recipes';
import type { Recipe } from '../../lib/api/types';

const filterOptions = [
  { label: 'Mâncăruri cu carne', value: 'carne', icon: 'fa-drumstick-bite' },
  { label: 'Salate', value: 'salate', icon: 'fa-leaf' },
  { label: 'Mâncăruri dietice', value: 'dietice', icon: 'fa-heart' },
  { label: 'Plăcinte', value: 'placinte', icon: 'fa-circle' },
];

const difficultyColors: Record<string, string> = {
  usor: 'bg-mint text-brown',
  mediu: 'bg-peach text-brown',
  greu: 'bg-pink text-brown',
};

// Partial Recipe type for display purposes
type RecipeDisplay = Pick<Recipe, 'id' | 'title' | 'slug' | 'difficulty' | 'likesCount' | 'imageUrl'> & {
  prepTime: number;
  category: { id: number; name: string; slug: string } | null;
};

const placeholderRecipes: RecipeDisplay[] = [
  {
    id: 1,
    title: 'Plăcintă cu brânză',
    slug: 'placinta-cu-branza',
    difficulty: 'usor',
    prepTime: 45,
    likesCount: 124,
    imageUrl: '/images/placeholders/recipe-placeholder-2.png',
    category: { id: 1, name: 'Plăcinte', slug: 'placinte' },
  },
  {
    id: 2,
    title: 'Plăcintă cu mere',
    slug: 'placinta-cu-mere',
    difficulty: 'mediu',
    prepTime: 60,
    likesCount: 98,
    imageUrl: '/images/placeholders/recipe-placeholder-2.png',
    category: { id: 1, name: 'Plăcinte', slug: 'placinte' },
  },
  {
    id: 3,
    title: 'Plăcintă cu cartofi',
    slug: 'placinta-cu-cartofi',
    difficulty: 'usor',
    prepTime: 50,
    likesCount: 87,
    imageUrl: '/images/placeholders/recipe-placeholder-2.png',
    category: { id: 1, name: 'Plăcinte', slug: 'placinte' },
  },
  {
    id: 4,
    title: 'Plăcintă cu dovleac',
    slug: 'placinta-cu-dovleac',
    difficulty: 'mediu',
    prepTime: 55,
    likesCount: 76,
    imageUrl: '/images/placeholders/recipe-placeholder-2.png',
    category: { id: 1, name: 'Plăcinte', slug: 'placinte' },
  },
  {
    id: 5,
    title: 'Plăcintă cu varză',
    slug: 'placinta-cu-varza',
    difficulty: 'usor',
    prepTime: 40,
    likesCount: 65,
    imageUrl: '/images/placeholders/recipe-placeholder-2.png',
    category: { id: 1, name: 'Plăcinte', slug: 'placinte' },
  },
  {
    id: 6,
    title: 'Plăcintă cu cireșe',
    slug: 'placinta-cu-cirese',
    difficulty: 'greu',
    prepTime: 70,
    likesCount: 112,
    imageUrl: '/images/placeholders/recipe-placeholder-2.png',
    category: { id: 1, name: 'Plăcinte', slug: 'placinte' },
  },
];

interface RecipeCardProps {
  recipe: RecipeDisplay;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="bg-theme-card rounded-2xl overflow-hidden shadow-rustic transition-all duration-300 hover:-translate-y-2 hover:shadow-rustic-lg cursor-pointer">
      <div className="relative">
        <Image
          src={recipe.imageUrl || '/images/placeholders/recipe-placeholder-2.png'}
          alt={recipe.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        {/* Difficulty badge - top left */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty] || 'bg-mint text-brown'}`}
          >
            {recipe.difficulty}
          </span>
        </div>
        {/* Favorite button - top right */}
        <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-pink transition-colors">
          <i className="fas fa-heart text-brown"></i>
        </button>
      </div>
      <div className="p-5">
        {/* Meta info */}
        <div className="flex items-center text-sm text-theme-secondary mb-2">
          <span className="flex items-center">
            <i className="fas fa-clock mr-1"></i>
            {recipe.prepTime} min
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <i className="fas fa-heart mr-1"></i>
            {recipe.likesCount || 0}
          </span>
        </div>
        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-theme-primary mb-2">
          {recipe.title}
        </h3>
        {/* Category */}
        <p className="text-sm text-theme-secondary">
          {recipe.category?.name || 'Categorie'}
        </p>
      </div>
    </article>
  );
}

export default function FeaturedRecipesSection() {
  const [activeFilter, setActiveFilter] = useState('placinte');
  const [recipes, setRecipes] = useState<RecipeDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      try {
        const response = await recipesApi.getByCategory(activeFilter, {
          limit: 6,
          sort: 'created_at:desc',
        });
        if (response.data && response.data.items.length > 0) {
          // Transform Recipe to RecipeDisplay
          const displayRecipes: RecipeDisplay[] = response.data.items.map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            difficulty: r.difficulty,
            prepTime: r.prepTime,
            likesCount: r.likesCount,
            imageUrl: r.imageUrl,
            category: r.category,
          }));
          setRecipes(displayRecipes);
        } else {
          setRecipes(placeholderRecipes);
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setRecipes(placeholderRecipes);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [activeFilter]);

  return (
    <section className="py-16 bg-theme-secondary">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <span className="inline-block px-4 py-1 rounded-full bg-pink text-brown text-sm font-medium mb-4">
            <i className="fas fa-fire mr-2"></i>Populare acum
          </span>
          {/* Title */}
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-theme-primary mb-4">
            Rețete Recomandate
          </h2>
          {/* Description */}
          <p className="text-theme-secondary max-w-2xl mx-auto">
            Descoperă cele mai apreciate rețete din colecția noastră, pregătite
            cu ingrediente proaspete și rețete tradiționale transmise din
            generație în generație.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filterOptions.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                activeFilter === filter.value
                  ? 'bg-brown text-white shadow-rustic'
                  : 'bg-theme-card text-theme-primary border border-theme hover:border-peach'
              }`}
            >
              <i className={`fas ${filter.icon} mr-2`}></i>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-theme-card rounded-2xl overflow-hidden shadow-rustic animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.slice(0, 6).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/retete"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brown text-white rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Vezi toate rețetele
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
