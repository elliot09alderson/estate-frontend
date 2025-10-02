import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalRatings = 0,
  showCount = true,
  size = 'md',
  className,
  interactive = false,
  onRatingChange
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(0);
    }
  };

  const displayRating = interactive ? (hoveredRating || rating) : rating;
  const roundedRating = Math.round(displayRating * 2) / 2; // Round to nearest 0.5

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(roundedRating);
          const isHalfFilled = star === Math.ceil(roundedRating) && roundedRating % 1 !== 0;

          return (
            <div
              key={star}
              className={cn(
                'relative',
                interactive && 'cursor-pointer'
              )}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-muted-foreground',
                  interactive && 'hover:text-yellow-400 transition-colors'
                )}
              />

              {/* Filled star */}
              {(isFilled || isHalfFilled) && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute top-0 left-0 text-yellow-400 fill-yellow-400',
                    isHalfFilled && 'clip-path-half'
                  )}
                  style={
                    isHalfFilled
                      ? {
                          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
                        }
                      : undefined
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Rating text and count */}
      {!interactive && (
        <div className={cn('flex items-center gap-1', textSizeClasses[size])}>
          <span className="font-medium text-foreground">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          {showCount && totalRatings > 0 && (
            <span className="text-muted-foreground">
              ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}

      {/* Interactive rating display */}
      {interactive && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {hoveredRating > 0 ? hoveredRating : rating || 0} star{(hoveredRating || rating) !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default StarRating;