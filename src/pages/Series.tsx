import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchModal from '@/components/features/SearchModal';
import { useLanguage } from '@/hooks/useLanguage';
import { SERIES } from '@/constants/mockData';
import { Star, Play, Plus, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SeriesPage() {
  const { t, language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="pt-16">
        <div className="relative h-48 circuit-bg border-b border-white/5 flex items-center">
          <div className="container mx-auto px-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <Tv className="w-8 h-8 text-primary" />
              <div className={isRTL ? 'text-right' : ''}>
                <h1 className="text-3xl font-black">
                  <span className="gradient-text">{t.nav.series}</span>
                </h1>
                <p className="text-muted-foreground">{SERIES.length}+ {t.stats.series}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {SERIES.map(series => {
              const title = language === 'fa' ? series.titleFa : series.title;
              return (
                <div key={series.id} className="group cursor-pointer card-hover rounded-xl overflow-hidden">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted">
                    <img src={series.poster} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </button>
                      <button className="flex items-center gap-1 text-xs text-white glass px-3 py-1.5 rounded-lg border border-white/10">
                        <Plus className="w-3 h-3" /> {t.hero.addToList}
                      </button>
                    </div>
                    {series.isNew && (
                      <div className={cn('absolute top-2', isRTL ? 'right-2' : 'left-2')}>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500 text-white rounded">{t.badges.new}</span>
                      </div>
                    )}
                    <div className={cn('absolute bottom-2', isRTL ? 'left-2' : 'right-2')}>
                      <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', series.accessType === 'free' ? 'bg-green-500/80 text-white' : 'bg-primary/80 text-white')}>
                        {series.accessType === 'free' ? t.badges.free : t.badges.subscription}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
                    <div className={cn('flex items-center gap-2 mt-0.5', isRTL && 'flex-row-reverse')}>
                      <span className={cn('flex items-center gap-0.5 text-xs text-yellow-400', isRTL && 'flex-row-reverse')}>
                        <Star className="w-3 h-3 fill-yellow-400" />{series.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">{series.seasons} {t.common.seasons}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
