import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Info, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { MOVIES } from '@/constants/mockData';
import { cn, formatDuration } from '@/lib/utils';

export default function HeroSection() {
  const { t, language, isRTL } = useLanguage();
  const featured = MOVIES.filter(m => m.isFeatured || m.isTrending).slice(0, 4);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const movie = featured[current];

  const prev = () => setCurrent(c => (c - 1 + featured.length) % featured.length);
  const next = () => setCurrent(c => (c + 1) % featured.length);

  return (
    <section className="relative w-full h-[90vh] min-h-[560px] max-h-[820px] overflow-hidden">
      {/* Background */}
      {featured.map((m, i) => (
        <div
          key={m.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === current ? 'opacity-100' : 'opacity-0'
          )}
        >
          <img
            src={m.backdrop}
            alt={m.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          {/* Circuit overlay */}
          <div className="absolute inset-0 circuit-bg opacity-50" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className={cn('max-w-xl', isRTL && 'mr-auto ml-0 text-right')}>
          {/* Badges */}
          <div className={cn('flex items-center gap-2 mb-4', isRTL && 'flex-row-reverse justify-end')}>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
              {t.hero.badge}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold glass text-foreground/70 border border-white/10 uppercase tracking-widest">
              {movie?.genre?.[0]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 animate-fade-in">
            {language === 'fa' ? movie?.titleFa : movie?.title}
          </h1>

          {/* Meta */}
          <div className={cn('flex items-center gap-4 mb-4 text-sm text-foreground/70', isRTL && 'flex-row-reverse')}>
            <span className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold">{movie?.rating}</span>
            </span>
            <span>{movie?.year}</span>
            <span className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
              <Clock className="w-4 h-4" />
              {formatDuration(movie?.duration || '')}
            </span>
            <span className="px-2 py-0.5 glass rounded text-xs font-bold text-primary border border-primary/20">
              {movie?.accessType === 'free' ? t.badges.free : t.badges.subscription}
            </span>
          </div>

          {/* Description */}
          <p className="text-base text-foreground/70 leading-relaxed mb-8 line-clamp-3">
            {language === 'fa' ? movie?.descriptionFa : movie?.description}
          </p>

          {/* CTA Buttons */}
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <Link
              to={`/${language}/movies`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-all glow-cyan"
            >
              <Play className="w-4 h-4 fill-white" />
              {t.hero.watchNow}
            </Link>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all">
              <Plus className="w-4 h-4" />
              {t.hero.addToList}
            </button>
            <Link
              to={`/${language}/movies`}
              className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl text-foreground/60 hover:text-foreground text-sm font-medium transition-all"
            >
              <Info className="w-4 h-4" />
              {t.hero.moreInfo}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={isRTL ? next : prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 glass rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={isRTL ? prev : next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 glass rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            )}
          />
        ))}
      </div>

      {/* Stats strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 divide-x divide-white/5">
            {[
              { value: '2,400+', label: t.stats.movies },
              { value: '860+', label: t.stats.series },
              { value: '1,200+', label: t.stats.games },
              { value: '3,500+', label: t.stats.software },
              { value: '500K+', label: t.stats.users },
            ].map((stat, i) => (
              <div key={i} className={cn('py-3 px-4 text-center glass', isRTL && 'flex flex-col items-center')}>
                <p className="text-sm sm:text-base font-black gradient-text">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
