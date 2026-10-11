import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Clock, Filter, Star, Film, Tv, Gamepad2, AppWindow, ChevronDown, SlidersHorizontal, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/hooks/useLanguage';
import { MOVIES, SERIES, GAMES, SOFTWARE_LIST } from '@/constants/mockData';
import { cn, formatDuration, formatPrice } from '@/lib/utils';

const RECENT_KEY = 'techland_recent_searches';
const MAX_RECENT = 8;

type ContentType = 'all' | 'movie' | 'series' | 'game' | 'software';
type AccessType = 'all' | 'free' | 'paid' | 'subscription';
type SortOption = 'relevance' | 'rating' | 'year' | 'title';

interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  titleFa: string;
  thumbnail: string;
  year: number;
  rating: number;
  genre?: string[];
  platform?: string[];
  accessType: string;
  description: string;
  href: string;
  price?: number;
  currency?: string;
}

const ALL_GENRES = Array.from(new Set([
  ...MOVIES.flatMap(m => m.genre),
  ...SERIES.flatMap(s => s.genre),
  ...GAMES.flatMap(g => g.genre),
])).sort();

const ALL_PLATFORMS = Array.from(new Set([
  ...GAMES.flatMap(g => g.platform),
  ...SOFTWARE_LIST.flatMap(s => s.platform),
])).sort();

const YEARS = Array.from({ length: 20 }, (_, i) => 2025 - i);

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(term: string) {
  const recent = getRecentSearches().filter(s => s !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function removeRecentSearch(term: string) {
  const recent = getRecentSearches().filter(s => s !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

function buildAllResults(language: string): SearchResult[] {
  return [
    ...MOVIES.map(m => ({
      id: m.id, type: 'movie' as const,
      title: m.title, titleFa: m.titleFa,
      thumbnail: m.poster, year: m.year, rating: m.rating,
      genre: m.genre, accessType: m.accessType,
      description: m.description, href: `/en/movies`,
    })),
    ...SERIES.map(s => ({
      id: s.id, type: 'series' as const,
      title: s.title, titleFa: s.titleFa,
      thumbnail: s.poster, year: s.year, rating: s.rating,
      genre: s.genre, accessType: s.accessType,
      description: s.description, href: `/en/series`,
    })),
    ...GAMES.map(g => ({
      id: g.id, type: 'game' as const,
      title: g.title, titleFa: g.titleFa,
      thumbnail: g.thumbnail, year: g.releaseYear, rating: g.rating,
      genre: g.genre, platform: g.platform, accessType: g.accessType,
      description: g.description, href: `/en/games`,
      price: g.price, currency: g.currency,
    })),
    ...SOFTWARE_LIST.map(s => ({
      id: s.id, type: 'software' as const,
      title: s.name, titleFa: s.nameFa,
      thumbnail: s.thumbnail, year: 2024, rating: s.rating,
      platform: s.platform, accessType: s.accessType,
      description: s.description, href: `/en/software`,
      price: s.price, currency: s.currency,
    })),
  ];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  movie: Film, series: Tv, game: Gamepad2, software: AppWindow,
};
const TYPE_LABELS: Record<string, string> = {
  movie: 'Movie', series: 'Series', game: 'Game', software: 'Software',
};
const TYPE_COLORS: Record<string, string> = {
  movie: 'text-blue-400 bg-blue-400/10',
  series: 'text-purple-400 bg-purple-400/10',
  game: 'text-orange-400 bg-orange-400/10',
  software: 'text-green-400 bg-green-400/10',
};

export default function SearchPage() {
  const { language, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [accessFilter, setAccessFilter] = useState<AccessType>('all');
  const [yearFrom, setYearFrom] = useState<number | ''>('');
  const [yearTo, setYearTo] = useState<number | ''>('');
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchOpen, setSearchOpen] = useState(false);

  const allResults = buildAllResults(language);

  const handleSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    setQuery(trimmed);
    setInputValue(trimmed);
    setShowSuggestions(false);
    if (trimmed) {
      addRecentSearch(trimmed);
      setRecentSearches(getRecentSearches());
      setSearchParams({ q: trimmed });
    }
  }, [setSearchParams]);

  // Auto-search on param change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputValue(q);
  }, [searchParams]);

  const filtered = allResults.filter(r => {
    const q = query.toLowerCase();
    const titleMatch = r.title.toLowerCase().includes(q) || r.titleFa.includes(q) || r.description.toLowerCase().includes(q);
    if (!titleMatch && q.length > 0) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (genreFilter && !r.genre?.includes(genreFilter)) return false;
    if (platformFilter && !r.platform?.includes(platformFilter)) return false;
    if (accessFilter !== 'all' && r.accessType !== accessFilter) return false;
    if (yearFrom !== '' && r.year < yearFrom) return false;
    if (yearTo !== '' && r.year > yearTo) return false;
    if (r.rating < ratingMin) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'year') return b.year - a.year;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    // relevance: exact title match first
    const qa = a.title.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
    const qb = b.title.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
    return qa - qb || b.rating - a.rating;
  });

  // Autocomplete suggestions
  const suggestions = query.length < 1 ? [] : allResults
    .filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.titleFa.includes(query))
    .slice(0, 6);

  const resetFilters = () => {
    setTypeFilter('all');
    setGenreFilter('');
    setPlatformFilter('');
    setAccessFilter('all');
    setYearFrom('');
    setYearTo('');
    setRatingMin(0);
    setSortBy('relevance');
  };

  const activeFilterCount = [
    typeFilter !== 'all', genreFilter, platformFilter, accessFilter !== 'all',
    yearFrom !== '', yearTo !== '', ratingMin > 0, sortBy !== 'relevance'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />

      <div className="pt-16">
        {/* Search Hero Bar */}
        <div className="bg-card/50 border-b border-white/5 py-8 circuit-bg">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="relative">
              <div className="relative flex items-center gap-3 glass-strong rounded-2xl border border-white/10 px-4 py-3.5 focus-within:border-primary/40 transition-colors">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setShowSuggestions(true); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(inputValue); if (e.key === 'Escape') setShowSuggestions(false); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search movies, series, games, software..."
                  className={cn(
                    'flex-1 bg-transparent text-foreground text-base placeholder:text-muted-foreground outline-none',
                    isRTL && 'text-right font-rtl'
                  )}
                  autoFocus
                />
                {inputValue && (
                  <button onClick={() => { setInputValue(''); setQuery(''); inputRef.current?.focus(); }} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSearch(inputValue)}
                  className="px-4 py-1.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && (inputValue.length > 0 || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && inputValue.length === 0 && (
                    <div className="p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Recent Searches
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map(term => (
                          <div key={term} className="flex items-center gap-1 glass border border-white/10 rounded-lg overflow-hidden">
                            <button
                              onMouseDown={() => handleSearch(term)}
                              className="pl-2.5 pr-1 py-1 text-xs text-foreground/80 hover:text-foreground transition-colors"
                            >
                              {term}
                            </button>
                            <button
                              onMouseDown={(e) => { e.stopPropagation(); removeRecentSearch(term); setRecentSearches(getRecentSearches()); }}
                              className="pr-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Autocomplete results */}
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      {inputValue.length > 0 && recentSearches.length > 0 && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Suggestions</p>
                      )}
                      {suggestions.map(s => {
                        const Icon = TYPE_ICONS[s.type] || Film;
                        return (
                          <button
                            key={`${s.type}-${s.id}`}
                            onMouseDown={() => handleSearch(language === 'fa' ? s.titleFa : s.title)}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                          >
                            <img src={s.thumbnail} alt={s.title} className="w-8 h-8 rounded-lg object-cover shrink-0" onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop')} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{language === 'fa' ? s.titleFa : s.title}</p>
                              <p className="text-xs text-muted-foreground">{TYPE_LABELS[s.type]} · {s.year}</p>
                            </div>
                            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0', TYPE_COLORS[s.type])}>
                              <Icon className="w-2.5 h-2.5" />
                              {TYPE_LABELS[s.type]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <aside className={cn('lg:w-60 shrink-0 space-y-4', !showFilters && 'hidden lg:block')}>
              <div className="glass border border-white/5 rounded-2xl p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">{activeFilterCount}</span>
                    )}
                  </h3>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-primary hover:underline">Reset</button>
                  )}
                </div>

                {/* Content Type */}
                <FilterSection label="Content Type">
                  {(['all', 'movie', 'series', 'game', 'software'] as ContentType[]).map(t => (
                    <FilterChip key={t} label={t === 'all' ? 'All' : TYPE_LABELS[t]} active={typeFilter === t} onClick={() => setTypeFilter(t)} icon={t !== 'all' ? TYPE_ICONS[t] : undefined} />
                  ))}
                </FilterSection>

                {/* Access Type */}
                <FilterSection label="Access Type">
                  {([['all', 'All'], ['free', 'Free'], ['subscription', 'Subscription'], ['paid', 'Paid']] as [AccessType, string][]).map(([v, l]) => (
                    <FilterChip key={v} label={l} active={accessFilter === v} onClick={() => setAccessFilter(v)} />
                  ))}
                </FilterSection>

                {/* Genre */}
                <FilterSection label="Genre">
                  <select
                    value={genreFilter}
                    onChange={e => setGenreFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-white/10 rounded-xl text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="" className="bg-card">All Genres</option>
                    {ALL_GENRES.map(g => <option key={g} value={g} className="bg-card">{g}</option>)}
                  </select>
                </FilterSection>

                {/* Platform */}
                <FilterSection label="Platform">
                  <select
                    value={platformFilter}
                    onChange={e => setPlatformFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-white/10 rounded-xl text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="" className="bg-card">All Platforms</option>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p} className="bg-card">{p}</option>)}
                  </select>
                </FilterSection>

                {/* Year Range */}
                <FilterSection label="Year Range">
                  <div className="flex items-center gap-2">
                    <select
                      value={yearFrom}
                      onChange={e => setYearFrom(e.target.value ? parseInt(e.target.value) : '')}
                      className="flex-1 px-2 py-1.5 bg-background border border-white/10 rounded-lg text-xs text-foreground outline-none focus:border-primary/50"
                    >
                      <option value="" className="bg-card">From</option>
                      {YEARS.map(y => <option key={y} value={y} className="bg-card">{y}</option>)}
                    </select>
                    <span className="text-muted-foreground text-xs">–</span>
                    <select
                      value={yearTo}
                      onChange={e => setYearTo(e.target.value ? parseInt(e.target.value) : '')}
                      className="flex-1 px-2 py-1.5 bg-background border border-white/10 rounded-lg text-xs text-foreground outline-none focus:border-primary/50"
                    >
                      <option value="" className="bg-card">To</option>
                      {YEARS.map(y => <option key={y} value={y} className="bg-card">{y}</option>)}
                    </select>
                  </div>
                </FilterSection>

                {/* Min Rating */}
                <FilterSection label={`Min Rating: ${ratingMin > 0 ? `${ratingMin}+` : 'Any'}`}>
                  <input
                    type="range" min="0" max="9" step="1" value={ratingMin}
                    onChange={e => setRatingMin(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Any</span><span>5+</span><span>9+</span>
                  </div>
                </FilterSection>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {query ? (
                      <><span className="text-foreground font-semibold">{sorted.length}</span> results for "<span className="text-primary">{query}</span>"</>
                    ) : (
                      <><span className="text-foreground font-semibold">{sorted.length}</span> items in library</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(f => !f)}
                    className={cn(
                      'lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl glass border border-white/10 transition-all',
                      showFilters ? 'text-primary border-primary/30' : 'text-muted-foreground'
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </button>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground hidden sm:block">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-1.5 bg-card border border-white/10 rounded-xl text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="relevance" className="bg-card">Relevance</option>
                      <option value="rating" className="bg-card">Top Rated</option>
                      <option value="year" className="bg-card">Newest</option>
                      <option value="title" className="bg-card">Title A–Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Type Tabs */}
              <div className="flex items-center gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-1">
                {(['all', 'movie', 'series', 'game', 'software'] as ContentType[]).map(t => {
                  const count = t === 'all' ? sorted.length : sorted.filter(r => r.type === t).length;
                  const Icon = t !== 'all' ? TYPE_ICONS[t] : Search;
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all',
                        typeFilter === t ? 'gradient-brand text-white shadow-lg' : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {t === 'all' ? 'All' : TYPE_LABELS[t]}
                      <span className={cn('ml-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold',
                        typeFilter === t ? 'bg-white/20' : 'bg-white/5'
                      )}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Results Grid */}
              {sorted.length === 0 ? (
                <div className="text-center py-20 glass border border-white/5 rounded-2xl">
                  <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-base font-semibold text-foreground mb-2">No results found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search terms or filters</p>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="mt-4 px-4 py-2 gradient-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all">
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sorted.map(result => {
                    const Icon = TYPE_ICONS[result.type] || Film;
                    const displayTitle = language === 'fa' ? result.titleFa : result.title;
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        to={result.href.replace('/en/', `/${language}/`)}
                        className="glass border border-white/5 rounded-2xl overflow-hidden card-hover flex gap-0"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-24 shrink-0">
                          <img
                            src={result.thumbnail}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                            onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=300&fit=crop')}
                          />
                          <div className={cn('absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold', TYPE_COLORS[result.type])}>
                            <Icon className="w-2.5 h-2.5" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-3.5 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">{displayTitle}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{result.description}</p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-0.5 text-yellow-400">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                <span className="text-xs font-semibold">{result.rating}</span>
                              </span>
                              <span className="text-xs text-muted-foreground">{result.year}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {result.price ? (
                                <span className="text-xs font-bold text-primary">{formatPrice(result.price, result.currency)}</span>
                              ) : (
                                <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded',
                                  result.accessType === 'free' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                                )}>
                                  {result.accessType === 'free' ? 'FREE' : 'SUB'}
                                </span>
                              )}
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>

                          {result.genre && result.genre.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {result.genre.slice(0, 2).map(g => (
                                <span key={g} className="px-1.5 py-0.5 text-[9px] glass rounded border border-white/10 text-muted-foreground">{g}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors">
        {label}
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="flex flex-wrap gap-1.5">{children}</div>}
    </div>
  );
}

function FilterChip({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon?: React.ElementType }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
        active ? 'gradient-brand text-white' : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
      )}
    >
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </button>
  );
}
