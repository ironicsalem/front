import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  starSize?: string;
  showValue?: boolean;
  valueClassName?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  className = '',
  starSize = 'w-4 h-4',
  showValue = false,
  valueClassName = 'ml-1 text-xs font-medium'
}) => {
  const handleStarClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <button
          key={index}
          type="button"
          className={`focus:outline-none ${
            interactive 
              ? 'cursor-pointer hover:scale-110 transition-transform' 
              : 'cursor-default'
          }`}
          onClick={() => handleStarClick(index)}
          disabled={!interactive}
          aria-label={`${index + 1} star${index > 0 ? 's' : ''}`}
        >
          <Star
            className={`${starSize} ${
              index < Math.floor(rating)
                ? 'text-amber-400 fill-current'
                : index < rating
                ? 'text-amber-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className={valueClassName}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;