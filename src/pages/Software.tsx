import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchModal from '@/components/features/SearchModal';
import SoftwareCard from '@/components/features/SoftwareCard';
import { useLanguage } from '@/hooks/useLanguage';
import { SOFTWARE_LIST } from '@/constants/mockData';
import { AppWindow } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Design', 'Productivity', 'Media', 'Utilities', 'Streaming'];
const ACCESS_TYPES = ['All', 'free', 'paid', 'vip'];

export default function SoftwarePage() {
  const { t, language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [access, setAccess] = useState('All');

  const filtered = SOFTWARE_LIST.filter(
    sw => (category === 'All' || sw.category === category)
      && (access === 'All' || sw.accessType === access)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="pt-16">
        <div className="relative h-48 circuit-bg border-b border-white/5 flex items-center">
          <div className="container mx-auto px-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <AppWindow className="w-8 h-8 text-brand-blue" />
              <div className={isRTL ? 'text-right' : ''}>
                <h1 className="text-3xl font-black">
                  <span className="bg-gradient-to-r from-brand-blue to-primary bg-clip-text text-transparent">{t.nav.software}</span>
                </h1>
                <p className="text-muted-foreground">{SOFTWARE_LIST.length}+ {t.stats.software}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className={cn('flex flex-wrap items-center gap-4 mb-8', isRTL && 'flex-row-reverse')}>
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                    category === c
                      ? 'bg-brand-blue text-white'
                      : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className={cn('flex items-center gap-2', isRTL ? 'mr-auto' : 'ml-auto')}>
              {ACCESS_TYPES.map(a => (
                <button
                  key={a}
                  onClick={() => setAccess(a)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize',
                    access === a
                      ? 'gradient-brand text-white'
                      : 'glass border border-white/10 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {a === 'All' ? 'All' : t.badges[a as keyof typeof t.badges] || a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(sw => (
              <SoftwareCard key={sw.id} software={sw} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
