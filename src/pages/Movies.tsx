import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchModal from '@/components/features/SearchModal';
import { useLanguage } from '@/hooks/useLanguage';
import { MOVIES } from '@/constants/mockData';
import { Star, Filter, ChevronDown, Play, Clock, Plus } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

const GENRES = ['All', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Thriller', 'Crime', 'Fantasy', 'Biography', 'Horror'];

export default function Movies() {
  const { t, language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeGenre, setActiveGenre] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const filtered = MOVIES
    .filter(m => activeGenre === 'All' || m.genre.includes(activeGenre))
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : b.year - a.year);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="pt-16">
        {/* Page Hero */}
        <div className="relative h-48 circuit-bg border-b border-white/5 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-black text-foreground mb-2">
              <span className="gradient-text">{t.nav.movies}</span>
            </h1>
            <p className="text-muted-foreground">{MOVIES.length}+ {t.stats.movies}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className={cn('flex flex-wrap items-center gap-4 mb-8', isRTL && 'flex-row-reverse')}>
            {/* Genre Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                    activeGenre === g
                      ? 'gradient-brand text-white'
                      : 'glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className={cn('flex items-center gap-2 ml-auto', isRTL && 'mr-auto ml-0')}>
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="glass border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground bg-transparent outline-none"
              >
                <option value="rating" className="bg-card">Top Rated</option>
                <option value="year" className="bg-card">Newest</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(movie => {
              const title = language === 'fa' ? movie.titleFa : movie.title;
              return (
                <div key={movie.id} className="group cursor-pointer card-hover rounded-xl overflow-hidden">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted">
                    <img
                      src={movie.poster}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center glow-cyan">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </button>
                      <button className="flex items-center gap-1 text-xs text-white/80 glass px-3 py-1.5 rounded-lg border border-white/10">
                        <Plus className="w-3 h-3" /> {t.hero.addToList}
                      </button>
                    </div>
                    <div className={cn('absolute top-2', isRTL ? 'right-2' : 'left-2')}>
                      {movie.isNew && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500 text-white rounded block mb-1">{t.badges.new}</span>}
                      {movie.isTrending && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-orange-500 text-white rounded block">{t.badges.trending}</span>}
                    </div>
                    <div className={cn('absolute bottom-2', isRTL ? 'left-2' : 'right-2')}>
                      <span className={cn(
                        'px-1.5 py-0.5 text-[9px] font-bold rounded',
                        movie.accessType === 'free' ? 'bg-green-500/80 text-white' : 'bg-primary/80 text-white'
                      )}>
                        {movie.accessType === 'free' ? t.badges.free : t.badges.subscription}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
                    <div className={cn('flex items-center gap-2 mt-0.5', isRTL && 'flex-row-reverse')}>
                      <span className={cn('flex items-center gap-0.5 text-xs text-yellow-400', isRTL && 'flex-row-reverse')}>
                        <Star className="w-3 h-3 fill-yellow-400" />{movie.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">{movie.year}</span>
                      <span className={cn('flex items-center gap-0.5 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                        <Clock className="w-3 h-3" />{formatDuration(movie.duration)}
                      </span>
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
