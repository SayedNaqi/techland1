import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchModal from '@/components/features/SearchModal';
import ProductCard from '@/components/features/ProductCard';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { PRODUCTS } from '@/constants/mockData';
import { ShoppingBag, ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Audio', 'Computer Accessories', 'Monitors', 'Accessories', 'Networking'];

export default function ShopPage() {
  const { t, language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const { items, removeItem, updateQuantity, clearCart, total, count } = useCart();

  const filtered = PRODUCTS.filter(p => category === 'All' || p.category === category);

  const handleCheckout = () => {
    toast.success('Redirecting to checkout...');
    clearCart();
    setCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="pt-16">
        <div className="relative h-48 circuit-bg border-b border-white/5 flex items-center">
          <div className="container mx-auto px-4">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                <ShoppingBag className="w-8 h-8 text-brand-gold" />
                <div className={isRTL ? 'text-right' : ''}>
                  <h1 className="text-3xl font-black">
                    <span className="gradient-text-gold">{t.nav.shop}</span>
                  </h1>
                  <p className="text-muted-foreground">{PRODUCTS.length}+ {language === 'fa' ? 'محصول' : 'Products'}</p>
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 glass rounded-xl border border-white/10 text-foreground hover:border-primary/30 transition-all"
              >
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium hidden sm:block">{language === 'fa' ? 'سبد خرید' : 'Cart'}</span>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 text-[10px] font-bold gradient-brand text-white rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Categories */}
          <div className={cn('flex items-center gap-2 flex-wrap mb-8', isRTL && 'flex-row-reverse')}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                  category === c
                    ? 'bg-brand-gold text-background'
                    : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className={cn('w-full max-w-sm bg-card border-l border-white/5 flex flex-col h-full animate-slide-in-right', isRTL && 'order-first border-l-0 border-r border-white/5')}>
            {/* Header */}
            <div className={cn('flex items-center justify-between p-4 border-b border-white/5', isRTL && 'flex-row-reverse')}>
              <h2 className="font-bold text-foreground">{language === 'fa' ? 'سبد خرید' : 'Shopping Cart'} ({count})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 glass rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{language === 'fa' ? 'سبد خرید خالی است' : 'Your cart is empty'}</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className={cn('flex items-center gap-3 glass rounded-xl p-3 border border-white/5', isRTL && 'flex-row-reverse')}>
                    <img src={item.thumbnail} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-primary font-bold">{formatPrice(item.price * item.quantity, item.currency)}</p>
                    </div>
                    <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 glass rounded border border-white/10 text-muted-foreground hover:text-foreground">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 glass rounded border border-white/10 text-muted-foreground hover:text-foreground">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded ml-1">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-white/5 space-y-3">
                <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                  <span className="text-sm text-muted-foreground">{language === 'fa' ? 'جمع کل' : 'Total'}</span>
                  <span className="text-lg font-black text-primary">{formatPrice(total, 'USD')}</span>
                </div>
                <button onClick={handleCheckout} className="w-full py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                  {language === 'fa' ? 'پرداخت' : 'Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
