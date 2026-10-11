import { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Tv, Gamepad2, AppWindow, Clock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { MOVIES, SERIES, GAMES, SOFTWARE_LIST } from '@/constants/mockData';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'techland_recent_searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const { t, language, isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecent());
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecent());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFullSearch = () => {
    if (query.trim()) {
      const recent = getRecent().filter((s: string) => s !== query.trim());
      recent.unshift(query.trim());
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
      navigate(`/${language}/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    } else {
      navigate(`/${language}/search`);
      onClose();
    }
  };

  const q = query.toLowerCase().trim();

  const results = q.length < 2 ? [] : [
    ...MOVIES.filter(m => m.title.toLowerCase().includes(q) || m.titleFa.includes(q))
      .slice(0, 3).map(m => ({ id: m.id, type: 'movie' as const, title: language === 'fa' ? m.titleFa : m.title, thumbnail: m.poster, href: `/${language}/movies`, icon: Film, year: m.year })),
    ...SERIES.filter(s => s.title.toLowerCase().includes(q) || s.titleFa.includes(q))
      .slice(0, 2).map(s => ({ id: s.id, type: 'series' as const, title: language === 'fa' ? s.titleFa : s.title, thumbnail: s.poster, href: `/${language}/series`, icon: Tv, year: s.year })),
    ...GAMES.filter(g => g.title.toLowerCase().includes(q) || g.titleFa.includes(q))
      .slice(0, 2).map(g => ({ id: g.id, type: 'game' as const, title: language === 'fa' ? g.titleFa : g.title, thumbnail: g.thumbnail, href: `/${language}/games`, icon: Gamepad2, year: g.releaseYear })),
    ...SOFTWARE_LIST.filter(s => s.name.toLowerCase().includes(q) || s.nameFa.includes(q))
      .slice(0, 2).map(s => ({ id: s.id, type: 'software' as const, title: language === 'fa' ? s.nameFa : s.name, thumbnail: s.thumbnail, href: `/${language}/software`, icon: AppWindow, year: null })),
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-strong rounded-2xl border border-white/10 shadow-2xl">
        {/* Input */}
        <div className={cn('flex items-center gap-3 p-4 border-b border-white/5', isRTL && 'flex-row-reverse')}>
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFullSearch()}
            placeholder={t.search.placeholder}
            className={cn('flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base', isRTL && 'text-right font-rtl')}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 glass rounded-lg border border-white/10 text-muted-foreground hover:text-foreground transition-all text-xs px-2">ESC</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Recent Searches */}
          {q.length < 2 && recentSearches.length > 0 && (
            <div className="p-4 border-b border-white/5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 glass border border-white/10 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:border-white/20 transition-all"
                  >
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Results */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3 pt-2">Quick Results</p>
              {results.map(r => (
                <Link
                  key={`${r.type}-${r.id}`}
                  to={r.href}
                  onClick={onClose}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all', isRTL && 'flex-row-reverse')}
                >
                  <img src={r.thumbnail} alt={r.title} className="w-9 h-9 rounded-lg object-cover" onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop')} />
                  <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{r.type} {r.year && `• ${r.year}`}</p>
                  </div>
                  <r.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {q.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {t.search.noResults} "<span className="text-foreground">{query}</span>"
            </div>
          )}

          {q.length < 2 && recentSearches.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">{t.search.placeholder}</div>
          )}
        </div>

        {/* Footer: Advanced Search Link */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleFullSearch}
            className="flex items-center justify-center gap-2 w-full py-2.5 glass border border-white/10 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-all"
          >
            <Search className="w-4 h-4" />
            {query ? `Search for "${query}"` : 'Advanced Search & Filters'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
