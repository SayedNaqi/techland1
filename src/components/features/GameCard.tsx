import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { cn, formatPrice } from '@/lib/utils';
import type { Game } from '@/types';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const { t, language, isRTL } = useLanguage();
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const title = language === 'fa' ? game.titleFa : game.title;
  const fallback = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (game.accessType === 'paid' && game.price) {
      addItem({
        id: game.id,
        type: 'game',
        name: title,
        price: game.price,
        currency: game.currency || 'USD',
        thumbnail: game.thumbnail,
      });
    }
  };

  return (
    <div
      className="relative shrink-0 w-[220px] sm:w-[260px] card-hover rounded-xl overflow-hidden glass border border-white/5"
      style={{ scrollSnapAlign: 'start' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/${language}/games`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={imgError ? fallback : game.thumbnail}
            alt={title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              hovered && 'scale-105'
            )}
            onError={() => setImgError(true)}
          />
          <div className={cn(
            'absolute inset-0 bg-background/60 flex items-center justify-center transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center glow-cyan">
              <Play className="w-5 h-5 fill-white text-white" />
            </button>
          </div>

          {/* Platforms */}
          <div className={cn('absolute top-2 flex flex-wrap gap-1', isRTL ? 'right-2' : 'left-2')}>
            {game.platform.slice(0, 3).map(p => (
              <span key={p} className="px-1.5 py-0.5 text-[9px] font-bold glass text-white rounded border border-white/10">
                {p}
              </span>
            ))}
          </div>

          {/* Access */}
          <div className={cn('absolute bottom-2', isRTL ? 'left-2' : 'right-2')}>
            <span className={cn(
              'px-2 py-0.5 text-[9px] font-bold rounded uppercase',
              game.accessType === 'free' ? 'bg-green-500/80 text-white' : 'bg-primary/80 text-white'
            )}>
              {game.accessType === 'free' ? t.badges.free : game.accessType === 'vip' ? t.badges.vip : t.badges.paid}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{game.developer}</p>

          <div className={cn('flex items-center justify-between mt-2', isRTL && 'flex-row-reverse')}>
            <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">{game.rating}</span>
            </div>

            {game.accessType === 'paid' && game.price ? (
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <span className="text-sm font-bold text-primary">{formatPrice(game.price, game.currency)}</span>
                <button
                  onClick={handleAddToCart}
                  className="p-1.5 glass rounded-lg border border-white/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-sm font-bold text-green-400">{t.common.free}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
