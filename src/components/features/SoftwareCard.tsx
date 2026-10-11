import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Star, ShoppingCart, Monitor, Smartphone } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { cn, formatPrice, formatNumber } from '@/lib/utils';
import type { Software } from '@/types';

interface SoftwareCardProps {
  software: Software;
}

export default function SoftwareCard({ software }: SoftwareCardProps) {
  const { t, language, isRTL } = useLanguage();
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const name = language === 'fa' ? software.nameFa : software.name;
  const fallback = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (software.accessType === 'paid' && software.price) {
      addItem({
        id: software.id,
        type: 'software',
        name,
        price: software.price,
        currency: software.currency || 'USD',
        thumbnail: software.thumbnail,
      });
    }
  };

  const getPlatformIcon = () => {
    const hasMobile = software.platform.some(p => ['Android', 'iOS'].includes(p));
    const hasDesktop = software.platform.some(p => ['Windows', 'macOS', 'Linux'].includes(p));
    if (hasMobile && hasDesktop) return null;
    if (hasMobile) return <Smartphone className="w-3 h-3" />;
    return <Monitor className="w-3 h-3" />;
  };

  return (
    <div
      className="relative shrink-0 w-[200px] sm:w-[240px] card-hover rounded-xl overflow-hidden glass border border-white/5"
      style={{ scrollSnapAlign: 'start' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/${language}/software`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={imgError ? fallback : software.thumbnail}
            alt={name}
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
            <button className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Access badge */}
          <div className={cn('absolute top-2', isRTL ? 'right-2' : 'left-2')}>
            <span className={cn(
              'px-2 py-0.5 text-[9px] font-bold rounded uppercase',
              software.accessType === 'free' ? 'bg-green-500/80 text-white' :
              software.accessType === 'vip' ? 'bg-brand-purple/80 text-white' :
              'bg-primary/80 text-white'
            )}>
              {software.accessType === 'free' ? t.badges.free : software.accessType === 'vip' ? t.badges.vip : t.badges.paid}
            </span>
          </div>

          {/* Category */}
          <div className={cn('absolute bottom-2', isRTL ? 'left-2' : 'right-2')}>
            <span className="px-1.5 py-0.5 text-[9px] font-medium glass text-white/80 rounded border border-white/10">
              {software.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
          <div className={cn('flex items-center gap-2 mt-0.5', isRTL && 'flex-row-reverse')}>
            <span className="text-xs text-muted-foreground">{software.developer}</span>
            {getPlatformIcon() && (
              <span className="text-muted-foreground">{getPlatformIcon()}</span>
            )}
          </div>

          <div className={cn('flex items-center justify-between mt-2', isRTL && 'flex-row-reverse')}>
            <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <span className={cn('flex items-center gap-0.5', isRTL && 'flex-row-reverse')}>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-400">{software.rating}</span>
              </span>
              <span className={cn('flex items-center gap-0.5 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                <Download className="w-3 h-3" />
                {formatNumber(software.downloads)}
              </span>
            </div>

            {software.accessType === 'paid' && software.price ? (
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <span className="text-sm font-bold text-primary">{formatPrice(software.price, software.currency)}</span>
                <button
                  onClick={handleAddToCart}
                  className="p-1.5 glass rounded-lg border border-white/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button className="flex items-center gap-1 px-2.5 py-1 glass rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-all">
                <Download className="w-3 h-3" />
                {t.common.download}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
