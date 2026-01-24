interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category, subcategory } = await params;

  return (
    <main className="min-h-screen container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-brown-dark mb-4">
        <span className="capitalize">{category.replace(/-/g, ' ')}</span>
        <span className="mx-2">/</span>
        <span className="capitalize font-semibold">{subcategory.replace(/-/g, ' ')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-brown mb-6 capitalize">
        {subcategory.replace(/-/g, ' ')}
      </h1>

      {/* Filters Section */}
      <section className="mb-8 flex flex-wrap gap-4">
        <select className="bg-cream px-4 py-2 rounded border border-brown-light">
          <option>Difficulty</option>
        </select>
        <select className="bg-cream px-4 py-2 rounded border border-brown-light">
          <option>Prep Time</option>
        </select>
      </section>

      {/* Recipes Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-cream p-4 rounded-lg shadow">Recipe Card Placeholder</div>
          <div className="bg-cream p-4 rounded-lg shadow">Recipe Card Placeholder</div>
          <div className="bg-cream p-4 rounded-lg shadow">Recipe Card Placeholder</div>
          <div className="bg-cream p-4 rounded-lg shadow">Recipe Card Placeholder</div>
        </div>
      </section>
    </main>
  );
}
