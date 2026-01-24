import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  recipeCount?: number;
  icon?: string;
}

export default function CategoryCard({
  slug,
  name,
  description,
  imageUrl,
  recipeCount,
  icon,
}: CategoryCardProps) {
  return (
    <Link 
      href={`/${slug}`}
      className="group block relative overflow-hidden rounded-[1.25rem] aspect-[3/2] shadow-rustic hover:shadow-rustic-lg transition-shadow duration-200"
    >
      {/* Background */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-cream to-peach"></div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brown/80 via-brown/40 to-transparent"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-brown">
              <i className={`fas ${icon}`}></i>
            </span>
          )}
          <div>
            <h3 className="font-heading text-xl text-white font-semibold">
              {name}
            </h3>
            {recipeCount !== undefined && (
              <p className="text-white/70 text-sm">
                {recipeCount} rețete
              </p>
            )}
          </div>
        </div>
        {description && (
          <p className="text-white/80 text-sm mt-2 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
