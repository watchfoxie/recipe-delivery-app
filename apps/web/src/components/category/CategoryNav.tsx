'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  slug: string;
  name: string;
  icon: string;
}

interface CategoryNavProps {
  categories: Category[];
  variant?: 'horizontal' | 'vertical';
}

export default function CategoryNav({ categories, variant = 'horizontal' }: CategoryNavProps) {
  const pathname = usePathname();
  
  const containerClasses = variant === 'horizontal'
    ? 'flex flex-wrap gap-2'
    : 'flex flex-col gap-2';
  
  return (
    <nav className={containerClasses}>
      {categories.map((category) => {
        const isActive = pathname.startsWith(`/${category.slug}`);
        
        return (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              flex items-center gap-2
              ${isActive 
                ? 'bg-brown text-white' 
                : 'bg-cream-dark text-brown hover:bg-cream hover:shadow-rustic'}
            `}
          >
            <i className={`fas ${category.icon}`}></i>
            <span>{category.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
