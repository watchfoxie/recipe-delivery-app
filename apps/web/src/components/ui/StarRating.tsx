'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };
  
  const displayRating = hoverRating ?? rating;
  
  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalf = !isFilled && starValue - 0.5 <= displayRating;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`
                ${sizeClasses[size]} 
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-transform duration-100
                ${isFilled ? 'text-peach' : isHalf ? 'text-peach/50' : 'text-cream-dark'}
              `}
              disabled={!interactive}
            >
              <i className={`${isFilled || isHalf ? 'fas' : 'far'} fa-star`}></i>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-brown/70 ml-1`}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
