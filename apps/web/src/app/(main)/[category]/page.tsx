import { notFound } from 'next/navigation';
import Link from 'next/link';
import RecipeCard from '../../../components/recipe/RecipeCard';
import RecipeGrid from '../../../components/recipe/RecipeGrid';
import type { RecipeCategory, Recipe } from '../../../lib/api/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function getCategory(slug: string): Promise<RecipeCategory | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/recipe-categories/slug/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getRecipesByCategory(categorySlug: string, page = 1, sort = 'created_at:desc'): Promise<{ recipes: Recipe[]; total: number; totalPages: number }> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/recipes?filter=category.slug:eq:${categorySlug}&page=${page}&limit=12&sort=${sort}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return { recipes: [], total: 0, totalPages: 0 };
    const data = await res.json();
    return {
      recipes: data.data || [],
      total: data.meta?.total || 0,
      totalPages: data.meta?.totalPages || 0,
    };
  } catch {
    return { recipes: [], total: 0, totalPages: 0 };
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = await getCategory(category);
  
  return {
    title: categoryData ? `${categoryData.name} - Culinaria` : 'Categorie - Culinaria',
    description: categoryData?.description || 'Descoperă rețete delicioase',
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const { page = '1', sort = 'created_at:desc' } = await searchParams;
  
  const categoryData = await getCategory(category);
  
  if (!categoryData) {
    notFound();
  }
  
  const currentPage = parseInt(page, 10) || 1;
  const { recipes, total, totalPages } = await getRecipesByCategory(category, currentPage, sort);
  
  const sortOptions = [
    { value: 'created_at:desc', label: 'Cele mai noi' },
    { value: 'rating_avg:desc', label: 'Cele mai apreciate' },
    { value: 'prep_time:asc', label: 'Timp de preparare' },
    { value: 'title:asc', label: 'Alfabetic (A-Z)' },
  ];
  
  return (
    <main className="min-h-screen">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-cream via-cream-light to-peach/30 py-12">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-brown/60 mb-4">
            <Link href="/" className="hover:text-brown">Acasă</Link>
            <span className="mx-2">/</span>
            <span className="text-brown">{categoryData.name}</span>
          </nav>
          
          <h1 className="font-heading text-3xl md:text-4xl text-brown font-bold mb-3">
            {categoryData.name}
          </h1>
          
          {categoryData.description && (
            <p className="text-brown/70 max-w-2xl">{categoryData.description}</p>
          )}
          
          <p className="text-brown/50 mt-4">
            {total} {total === 1 ? 'rețetă' : 'rețete'} în această categorie
          </p>
        </div>
      </section>
      
      {/* Filters & Recipes */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Sort controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-brown/70">Sortează după:</span>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <Link
                    key={option.value}
                    href={`/${category}?sort=${option.value}&page=1`}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      sort === option.value
                        ? 'bg-brown text-white'
                        : 'bg-cream-dark text-brown hover:bg-cream'
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recipe Grid */}
          {recipes.length > 0 ? (
            <>
              <RecipeGrid columns={3}>
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    slug={recipe.slug}
                    title={recipe.title}
                    imageUrl={recipe.imageUrl || undefined}
                    difficulty={recipe.difficulty}
                    prepTime={recipe.prepTime}
                    rating={recipe.ratingAvg}
                    author={`${recipe.author.firstName} ${recipe.author.lastName}`}
                    category={recipe.category?.name}
                  />
                ))}
              </RecipeGrid>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {currentPage > 1 && (
                    <Link
                      href={`/${category}?page=${currentPage - 1}&sort=${sort}`}
                      className="px-4 py-2 rounded-lg bg-cream-dark text-brown hover:bg-cream"
                    >
                      <i className="fas fa-chevron-left mr-2"></i>
                      Anterior
                    </Link>
                  )}
                  
                  <span className="px-4 py-2 text-brown/70">
                    Pagina {currentPage} din {totalPages}
                  </span>
                  
                  {currentPage < totalPages && (
                    <Link
                      href={`/${category}?page=${currentPage + 1}&sort=${sort}`}
                      className="px-4 py-2 rounded-lg bg-cream-dark text-brown hover:bg-cream"
                    >
                      Următor
                      <i className="fas fa-chevron-right ml-2"></i>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-book-open text-5xl text-brown/20 mb-4"></i>
              <p className="text-brown/60">Nu există rețete în această categorie încă.</p>
              <Link href="/" className="text-brown hover:text-brown-dark font-medium mt-4 inline-block">
                ← Înapoi la pagina principală
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
