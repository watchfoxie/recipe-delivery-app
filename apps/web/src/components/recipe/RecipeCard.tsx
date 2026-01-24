import Link from 'next/link';
import Image from 'next/image';
import Card from '../ui/Card';
import StarRating from '../ui/StarRating';

const RECIPE_PLACEHOLDER = '/images/placeholders/recipe-placeholder-2.png';

interface RecipeCardProps {
  id: number;
  slug: string;
  title: string;
  imageUrl?: string;
  difficulty: 'usor' | 'mediu' | 'greu';
  prepTime: number;
  rating: number;
  author: string;
  category?: string;
}

const difficultyLabels = {
  usor: { label: 'Ușor', color: 'bg-mint text-brown' },
  mediu: { label: 'Mediu', color: 'bg-peach text-brown' },
  greu: { label: 'Dificil', color: 'bg-pink text-brown' },
};

export default function RecipeCard({
  slug,
  title,
  imageUrl,
  difficulty,
  prepTime,
  rating,
  author,
  category,
}: RecipeCardProps) {
  const difficultyInfo = difficultyLabels[difficulty];
  
  return (
    <Link href={`/recipes/${slug}`} className="block h-full touch-manipulation">
      <Card hoverable padding="none" className="h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] sm:aspect-[4/3] bg-cream-dark overflow-hidden">
          <Image
            src={imageUrl || RECIPE_PLACEHOLDER}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Difficulty badge */}
          <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${difficultyInfo.color}`}>
            {difficultyInfo.label}
          </span>
        </div>
        
        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col min-h-0">
          {category && (
            <span className="text-[10px] sm:text-xs text-brown/60 uppercase tracking-wide mb-1 truncate">
              {category}
            </span>
          )}
          
          <h3 className="font-heading text-base sm:text-lg text-brown font-semibold mb-2 line-clamp-2 leading-tight">
            {title}
          </h3>
          
          <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-3 text-brown/70 flex-wrap">
              <span className="flex items-center whitespace-nowrap">
                <i className="fas fa-clock mr-1"></i>
                {prepTime} min
              </span>
              <StarRating rating={rating} size="sm" />
            </div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-brown/50 mt-2 truncate">
            de {author}
          </p>
        </div>
      </Card>
    </Link>
  );
}
