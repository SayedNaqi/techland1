import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchModal from '@/components/features/SearchModal';
import GameCard from '@/components/features/GameCard';
import { useLanguage } from '@/hooks/useLanguage';
import { GAMES } from '@/constants/mockData';
import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS = ['All', 'PC', 'Android', 'iOS', 'PlayStation', 'Xbox', 'Console'];

export default function GamesPage() {
  const { t, language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [platform, setPlatform] = useState('All');

  const filtered = GAMES.filter(g => platform === 'All' || g.platform.includes(platform));

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="pt-16">
        <div className="relative h-48 circuit-bg border-b border-white/5 flex items-center">
          <div className="container mx-auto px-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <Gamepad2 className="w-8 h-8 text-brand-purple" />
              <div className={isRTL ? 'text-right' : ''}>
                <h1 className="text-3xl font-black text-foreground">
                  <span className="bg-gradient-to-r from-brand-purple to-primary bg-clip-text text-transparent">{t.nav.games}</span>
                </h1>
                <p className="text-muted-foreground">{GAMES.length}+ {t.stats.games}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Platform Filters */}
          <div className={cn('flex items-center gap-2 flex-wrap mb-8', isRTL && 'flex-row-reverse')}>
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                  platform === p
                    ? 'bg-brand-purple text-white'
                    : 'glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
