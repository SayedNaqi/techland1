import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Star, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn, formatDuration } from '@/lib/utils';
import type { Movie, Series } from '@/types';

interface MovieCardProps {
  item: Movie | Series;
  type?: 'movie' | 'series';
}

export default function MovieCard({ item, type = 'movie' }: MovieCardProps) {
  const { t, language, isRTL } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const title = language === 'fa' ? item.titleFa : item.title;
  const href = `/${language}/${type === 'movie' ? 'movies' : 'series'}/${'id' in item ? item.id : ''}`;

  const fallbackPoster = `https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop&q=80`;

  return (
    <div
      className="relative shrink-0 w-[160px] sm:w-[180px] cursor-pointer card-hover rounded-xl overflow-hidden"
      style={{ scrollSnapAlign: 'start' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={href}>
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted">
          <img
            src={imgError ? fallbackPoster : item.poster}
            alt={title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              hovered && 'scale-105'
            )}
            onError={() => setImgError(true)}
          />

          {/* Overlay on hover */}
          <div className={cn(
            'absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2 transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center glow-cyan">
              <Play className="w-5 h-5 fill-white text-white" />
            </button>
            <button className="flex items-center gap-1 text-xs text-white/80 glass px-3 py-1.5 rounded-lg border border-white/10">
              <Plus className="w-3 h-3" />
              {t.hero.addToList}
            </button>
          </div>

          {/* Badges */}
          <div className={cn('absolute top-2 flex flex-col gap-1', isRTL ? 'right-2 items-end' : 'left-2 items-start')}>
            {'isNew' in item && item.isNew && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500 text-white rounded uppercase">{t.badges.new}</span>
            )}
            {'isTrending' in item && item.isTrending && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-orange-500 text-white rounded uppercase">{t.badges.trending}</span>
            )}
          </div>

          {/* Access badge */}
          <div className={cn('absolute bottom-2', isRTL ? 'left-2' : 'right-2')}>
            <span className={cn(
              'px-1.5 py-0.5 text-[9px] font-bold rounded uppercase',
              item.accessType === 'free'
                ? 'bg-green-500/80 text-white'
                : 'bg-primary/80 text-primary-foreground'
            )}>
              {item.accessType === 'free' ? t.badges.free : t.badges.subscription}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="pt-2 px-0.5">
          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{title}</h3>
          <div className={cn('flex items-center gap-2 mt-1', isRTL && 'flex-row-reverse')}>
            <span className={cn('flex items-center gap-0.5 text-xs text-yellow-400', isRTL && 'flex-row-reverse')}>
              <Star className="w-3 h-3 fill-yellow-400" />
              {item.rating}
            </span>
            <span className="text-xs text-muted-foreground">{item.year}</span>
            {type === 'movie' && 'duration' in item && (
              <span className={cn('flex items-center gap-0.5 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                <Clock className="w-3 h-3" />
                {formatDuration((item as Movie).duration)}
              </span>
            )}
            {type === 'series' && 'seasons' in item && (
              <span className="text-xs text-muted-foreground">
                {(item as Series).seasons} {t.common.seasons}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
