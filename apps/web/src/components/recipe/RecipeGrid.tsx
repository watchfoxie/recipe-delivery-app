import { ReactNode } from 'react';

interface RecipeGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export default function RecipeGrid({ children, columns = 3 }: RecipeGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {children}
    </div>
  );
}
