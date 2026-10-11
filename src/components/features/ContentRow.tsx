import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface ContentRowProps {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
  className?: string;
}

export default function ContentRow({ title, viewAllHref, children, className }: ContentRowProps) {
  const { t, isRTL } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={cn('py-6', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
          <h2 className={cn('text-xl font-bold text-foreground flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <span className="w-1 h-5 gradient-brand rounded-full inline-block" />
            {title}
          </h2>
          <Link
            to={viewAllHref}
            className={cn(
              'flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-all',
              isRTL && 'flex-row-reverse'
            )}
          >
            {t.sections.viewAll}
            <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
          </Link>
        </div>

        {/* Scroll Container */}
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 p-2 glass-strong rounded-full border border-white/10 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all',
              isRTL && 'left-auto right-0 translate-x-3'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {children}
          </div>

          <button
            onClick={() => scroll('right')}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 p-2 glass-strong rounded-full border border-white/10 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all',
              isRTL && 'right-auto left-0 -translate-x-3'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
