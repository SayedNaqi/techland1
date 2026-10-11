import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { cn, formatPrice, formatNumber } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, language, isRTL } = useLanguage();
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const name = language === 'fa' ? product.nameFa : product.name;
  const fallback = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80';

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      type: 'product',
      name,
      price: product.price,
      currency: product.currency,
      thumbnail: product.thumbnail,
    });
  };

  return (
    <div
      className="relative shrink-0 w-[180px] sm:w-[210px] card-hover rounded-xl overflow-hidden glass border border-white/5"
      style={{ scrollSnapAlign: 'start' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/${language}/shop`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imgError ? fallback : product.thumbnail}
            alt={name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              hovered && 'scale-105'
            )}
            onError={() => setImgError(true)}
          />

          {/* Discount badge */}
          {discount > 0 && (
            <div className={cn('absolute top-2', isRTL ? 'right-2' : 'left-2')}>
              <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-white rounded">
                -{discount}%
              </span>
            </div>
          )}

          {/* New badge */}
          {product.isNew && !discount && (
            <div className={cn('absolute top-2', isRTL ? 'right-2' : 'left-2')}>
              <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded">
                {t.badges.new}
              </span>
            </div>
          )}

          {/* Quick add */}
          <div className={cn(
            'absolute bottom-2 right-2 transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button
              onClick={handleAddToCart}
              className="p-2 gradient-brand rounded-lg text-white shadow-lg hover:opacity-90 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5 leading-tight">{name}</h3>

          <div className={cn('flex items-center gap-1 mt-1', isRTL && 'flex-row-reverse')}>
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({formatNumber(product.reviewCount)})</span>
          </div>

          <div className={cn('flex items-center gap-2 mt-2', isRTL && 'flex-row-reverse')}>
            <span className="text-base font-bold text-primary">{formatPrice(product.price, product.currency)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice, product.currency)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
