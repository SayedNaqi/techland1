import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StarRatingWidgetProps {
  initialRating?: number;
  totalRatings?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

export default function StarRatingWidget({
  initialRating = 0,
  totalRatings = 0,
  onRate,
  readOnly = false,
  size = 'md',
}: StarRatingWidgetProps) {
  const [userRating, setUserRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const displayRating = userRating || initialRating;
  const activeRating = hovered || userRating;

  const labels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent', 'Amazing', 'Great', 'Fantastic', 'Superb', 'Masterpiece'];

  const handleRate = (rating: number) => {
    if (readOnly || submitted) return;
    setUserRating(rating);
    setSubmitted(true);
    onRate?.(rating);
    toast.success(`You rated this ${rating}/10 — ${labels[rating]}`);
  };

  const starCount = 10;
  const iconClass = SIZES[size];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: starCount }, (_, i) => {
          const val = i + 1;
          const filled = readOnly ? val <= Math.round(displayRating) : val <= (submitted ? userRating : activeRating);
          const half = !readOnly ? false : val - 0.5 <= displayRating && val > displayRating;
          return (
            <button
              key={val}
              disabled={readOnly || submitted}
              onClick={() => handleRate(val)}
              onMouseEnter={() => !readOnly && !submitted && setHovered(val)}
              onMouseLeave={() => !readOnly && !submitted && setHovered(0)}
              className={cn(
                'transition-transform',
                !readOnly && !submitted && 'hover:scale-110 cursor-pointer',
                (readOnly || submitted) && 'cursor-default'
              )}
              title={labels[val]}
            >
              <Star
                className={cn(
                  iconClass,
                  'transition-colors',
                  filled ? 'text-yellow-400 fill-yellow-400' :
                  half ? 'text-yellow-400 fill-yellow-400/50' :
                  'text-white/20 fill-transparent',
                  !readOnly && !submitted && !filled && 'hover:text-yellow-300'
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-black text-foreground">{displayRating.toFixed(1)}</span>
        <div>
          <p className="text-xs font-semibold text-yellow-400">{labels[Math.round(displayRating)] || 'Not rated'}</p>
          {totalRatings > 0 && <p className="text-[10px] text-muted-foreground">{totalRatings.toLocaleString()} ratings</p>}
        </div>
        {submitted && (
          <span className="ml-auto text-xs text-green-400 font-medium">Your rating: {userRating}/10</span>
        )}
        {!readOnly && !submitted && hovered > 0 && (
          <span className="ml-auto text-xs text-yellow-400 font-medium">{hovered}/10 — {labels[hovered]}</span>
        )}
      </div>
    </div>
  );
}
