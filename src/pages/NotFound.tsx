import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background circuit-bg flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <span className="text-[120px] font-black gradient-text leading-none select-none">404</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to={`/${language}`}
            className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to={`/${language}/movies`}
            className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 text-foreground font-semibold text-sm rounded-xl hover:bg-white/5 transition-all"
          >
            <Search className="w-4 h-4" />
            Browse Content
          </Link>
        </div>
      </div>
    </div>
  );
}
