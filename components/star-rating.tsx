"use client"

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  readOnly?: boolean;
}

export function StarRating({ rating, setRating, readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => !readOnly && setRating && setRating(ratingValue)}
              className="hidden"
            />
            <Star
              className={`cursor-pointer transition-colors ${ratingValue <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              onMouseEnter={() => !readOnly && setHover(ratingValue)}
              onMouseLeave={() => !readOnly && setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
}
