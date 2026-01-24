import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rețete | Culinaria Acasă',
  description: 'Explorează colecția noastră de rețete tradiționale moldovenești pe categorii.',
};

const subcategories = [
  { name: 'Mâncăruri cu Carne', slug: 'carne', icon: 'fa-drumstick-bite', color: 'bg-peach' },
  { name: 'Mâncăruri cu Pește', slug: 'peste', icon: 'fa-fish', color: 'bg-mint' },
  { name: 'Salate', slug: 'salate', icon: 'fa-leaf', color: 'bg-pink' },
  { name: 'Mâncăruri cu Legume', slug: 'legume', icon: 'fa-carrot', color: 'bg-peach' },
  { name: 'Plăcinte', slug: 'placinte', icon: 'fa-circle', color: 'bg-mint' },
  { name: 'Pizza', slug: 'pizza', icon: 'fa-pizza-slice', color: 'bg-pink' },
];

export default function RecipesPage() {
  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      {/* Header Section */}
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-pink text-brown text-sm font-medium mb-4">
            <i className="fas fa-book-open mr-2"></i>Explorează
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-theme-primary mb-4">
            Categorii de Rețete
          </h1>
          <p className="text-theme-secondary max-w-2xl mx-auto">
            Alege o categorie pentru a descoperi rețete tradiționale moldovenești autentice.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/retete/${cat.slug}`}
                className="group bg-theme-card rounded-2xl p-8 shadow-rustic hover:shadow-rustic-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-full ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${cat.icon} text-2xl text-brown`}></i>
                </div>
                <h2 className="font-heading text-xl font-bold text-theme-primary mb-2">
                  {cat.name}
                </h2>
                <p className="text-theme-secondary text-sm">
                  Explorează rețetele din această categorie
                </p>
                <div className="mt-4 text-peach font-medium flex items-center gap-2">
                  Vezi rețete <i className="fas fa-arrow-right"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
