import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ingrediente | Culinaria Acasă',
  description: 'Descoperă rețete bazate pe ingredientele tale preferate.',
};

const ingredientCategories = [
  { name: 'Cereale', slug: 'cereale', icon: 'fa-wheat-awn', color: 'bg-peach' },
  { name: 'Legume', slug: 'legume', icon: 'fa-carrot', color: 'bg-mint' },
  { name: 'Condimente și ierburi', slug: 'condimente', icon: 'fa-mortar-pestle', color: 'bg-pink' },
  { name: 'Fructe', slug: 'fructe', icon: 'fa-apple-whole', color: 'bg-peach' },
  { name: 'Dulciuri și zahăr', slug: 'dulciuri', icon: 'fa-candy-cane', color: 'bg-pink' },
  { name: 'Carne', slug: 'carne', icon: 'fa-drumstick-bite', color: 'bg-peach' },
  { name: 'Pește', slug: 'peste', icon: 'fa-fish', color: 'bg-mint' },
  { name: 'Lactate și ouă', slug: 'lactate', icon: 'fa-cheese', color: 'bg-cream' },
  { name: 'Grăsimi și uleiuri', slug: 'grasimi', icon: 'fa-oil-can', color: 'bg-peach' },
  { name: 'Nuci și semințe', slug: 'nuci', icon: 'fa-seedling', color: 'bg-mint' },
  { name: 'Băuturi', slug: 'bauturi', icon: 'fa-wine-glass', color: 'bg-pink' },
];

export default function IngredientsPage() {
  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-pink text-brown text-sm font-medium mb-4">
            <i className="fas fa-apple-whole mr-2"></i>Găsește Rețete
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-theme-primary mb-4">
            Ingrediente
          </h1>
          <p className="text-theme-secondary max-w-2xl mx-auto">
            Alege un ingredient pentru a descoperi rețetele care îl conțin.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ingredientCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/ingrediente/${cat.slug}`}
                className="group bg-theme-card rounded-xl p-6 shadow-rustic hover:shadow-rustic-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-full ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${cat.icon} text-xl text-brown`}></i>
                </div>
                <h2 className="font-heading text-lg font-semibold text-theme-primary">
                  {cat.name}
                </h2>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
