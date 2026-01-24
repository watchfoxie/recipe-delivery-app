import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Selecții Tematice | Culinaria Acasă',
  description: 'Descoperă selecții de rețete pentru ocazii speciale: Crăciun, Paști, Post și mâncăruri dietice.',
};

const selections = [
  { 
    name: 'Mâncăruri de Crăciun', 
    slug: 'craciun', 
    icon: 'fa-tree',
    color: 'bg-mint',
    description: 'Rețete festive pentru masa de Crăciun' 
  },
  { 
    name: 'Mâncăruri de Paști', 
    slug: 'pasti', 
    icon: 'fa-egg',
    color: 'bg-pink',
    description: 'Preparate tradiționale pentru Paști' 
  },
  { 
    name: 'Mâncăruri de Post', 
    slug: 'post', 
    icon: 'fa-seedling',
    color: 'bg-peach',
    description: 'Rețete delicioase pentru perioadele de post' 
  },
  { 
    name: 'Mâncăruri Dietice', 
    slug: 'dietice', 
    icon: 'fa-heart',
    color: 'bg-mint',
    description: 'Preparate sănătoase cu calorii reduse' 
  },
];

export default function SelectionsPage() {
  return (
    <main className="min-h-screen bg-theme-primary pt-20">
      <section className="py-12 bg-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-mint text-brown text-sm font-medium mb-4">
            <i className="fas fa-star mr-2"></i>Colecții Speciale
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-theme-primary mb-4">
            Selecții Tematice
          </h1>
          <p className="text-theme-secondary max-w-2xl mx-auto">
            Rețete grupate pe ocazii și preferințe alimentare pentru a te ajuta să găsești inspirație rapidă.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {selections.map((sel) => (
              <Link
                key={sel.slug}
                href={`/selectii/${sel.slug}`}
                className="group bg-theme-card rounded-2xl p-8 shadow-rustic hover:shadow-rustic-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-20 h-20 rounded-full ${sel.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${sel.icon} text-3xl text-brown`}></i>
                </div>
                <h2 className="font-heading text-2xl font-bold text-theme-primary mb-2">
                  {sel.name}
                </h2>
                <p className="text-theme-secondary mb-4">{sel.description}</p>
                <span className="text-peach font-medium flex items-center gap-2">
                  Explorează <i className="fas fa-arrow-right"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
