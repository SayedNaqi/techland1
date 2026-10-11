import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, ChevronRight, Play, Maximize2,
  Info, List, Star, CheckCircle, Lock, Crown,
  SkipBack, SkipForward, Volume2, VolumeX
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { MOVIES, SERIES } from '@/constants/mockData';
import { cn } from '@/lib/utils';

const MOCK_EPISODES: Record<number, { ep: number; title: string; duration: string }[]> = {
  1: [
    { ep: 1, title: 'Pilot', duration: '58 min' },
    { ep: 2, title: "Cat's in the Bag", duration: '48 min' },
    { ep: 3, title: "...and the Bag's in the River", duration: '48 min' },
    { ep: 4, title: 'Cancer Man', duration: '48 min' },
    { ep: 5, title: 'Gray Matter', duration: '48 min' },
    { ep: 6, title: 'Crazy Handful of Nothin', duration: '48 min' },
    { ep: 7, title: 'A No-Rough-Stuff-Type Deal', duration: '48 min' },
  ],
  2: [
    { ep: 1, title: 'Seven Thirty-Seven', duration: '47 min' },
    { ep: 2, title: 'Grilled', duration: '47 min' },
    { ep: 3, title: 'Bit by a Dead Bee', duration: '47 min' },
    { ep: 4, title: 'Down', duration: '47 min' },
    { ep: 5, title: 'Breakage', duration: '47 min' },
  ],
  3: [
    { ep: 1, title: 'No Más', duration: '47 min' },
    { ep: 2, title: 'Caballo Sin Nombre', duration: '48 min' },
    { ep: 3, title: 'IFT', duration: '48 min' },
    { ep: 4, title: 'Green Light', duration: '47 min' },
    { ep: 5, title: 'Mas', duration: '48 min' },
  ],
};

const MOCK_SUBSCRIPTION_ACTIVE = false;

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { saveProgress, getProgress } = useWatchProgress();

  // Determine if movie or series
  const movie = MOVIES.find(m => m.id === id);
  const series = !movie ? SERIES.find(s => s.id === id) : null;
  const content = movie || series;

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [progress, setProgress] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved progress
  useEffect(() => {
    if (!id) return;
    const saved = getProgress(id);
    if (saved) {
      setProgress(saved.progress);
      if (saved.season) setSelectedSeason(saved.season);
      if (saved.episode) setSelectedEpisode(saved.episode);
    }
  }, [id, getProgress]);

  // Save progress every 10 seconds when playing
  useEffect(() => {
    if (!playing || !id || !content) return;
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(100, prev + 0.5);
        saveProgress({
          id,
          type: movie ? 'movie' : 'series',
          progress: next,
          season: selectedSeason,
          episode: selectedEpisode,
        });
        return next;
      });
    }, 10000);
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [playing, id, content, movie, selectedSeason, selectedEpisode, saveProgress]);

  // Auto-hide overlay
  const resetOverlayTimer = useCallback(() => {
    setShowOverlay(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (playing && !showEpisodes && !showInfo) {
      overlayTimerRef.current = setTimeout(() => setShowOverlay(false), 3500);
    }
  }, [playing, showEpisodes, showInfo]);

  useEffect(() => {
    resetOverlayTimer();
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [resetOverlayTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(p => !p);
          resetOverlayTimer();
          break;
        case 'KeyF':
          if (containerRef.current) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              containerRef.current.requestFullscreen?.();
            }
          }
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            navigate(-1);
          }
          break;
        case 'KeyM':
          setMuted(m => !m);
          break;
        case 'KeyI':
          setShowInfo(v => !v);
          setShowOverlay(true);
          break;
        case 'KeyE':
          if (series) {
            setShowEpisodes(v => !v);
            setShowOverlay(true);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, series, resetOverlayTimer]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Content not found</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 gradient-brand text-white rounded-xl text-sm font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isLocked = content.accessType === 'subscription' && !MOCK_SUBSCRIPTION_ACTIVE;
  const displayTitle = language === 'fa' ? content.titleFa : content.title;
  const embedUrl = movie?.embedUrl || '';
  const seasons = series ? Array.from({ length: series.seasons }, (_, i) => i + 1) : [];
  const currentEpisodes = MOCK_EPISODES[selectedSeason] || MOCK_EPISODES[1];
  const currentEp = currentEpisodes.find(e => e.ep === selectedEpisode) || currentEpisodes[0];

  const handlePlayEpisode = (season: number, ep: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(ep);
    setPlaying(true);
    setShowEpisodes(false);
  };

  const handleNextEpisode = () => {
    const nextEp = currentEpisodes.find(e => e.ep === selectedEpisode + 1);
    if (nextEp) {
      setSelectedEpisode(nextEp.ep);
    } else {
      // next season
      const nextSeasonEps = MOCK_EPISODES[selectedSeason + 1];
      if (nextSeasonEps) {
        setSelectedSeason(s => s + 1);
        setSelectedEpisode(1);
      }
    }
  };

  const handlePrevEpisode = () => {
    const prevEp = currentEpisodes.find(e => e.ep === selectedEpisode - 1);
    if (prevEp) setSelectedEpisode(prevEp.ep);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      onMouseMove={resetOverlayTimer}
      onClick={() => {
        if (!showEpisodes && !showInfo) {
          setPlaying(p => !p);
        }
        resetOverlayTimer();
      }}
    >
      {/* ── VIDEO LAYER ── */}
      {playing && !isLocked && !iframeError && embedUrl ? (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          frameBorder="0"
          title={displayTitle}
          onError={() => setIframeError(true)}
        />
      ) : (
        <div className="absolute inset-0">
          <img
            src={content.poster}
            alt={displayTitle}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              isLocked ? 'blur-md scale-105 opacity-40' : 'opacity-60'
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        </div>
      )}

      {/* ── LOCK OVERLAY ── */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="text-center px-6 max-w-md">
            <div className="w-20 h-20 rounded-3xl glass-strong border border-white/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-9 h-9 text-white/50" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Subscription Required</h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Subscribe to TechLand to unlock unlimited access to all movies, series, and downloads.
            </p>
            <Link
              to={`/${language}/subscriptions`}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white font-bold rounded-2xl hover:opacity-90 transition-all text-sm shadow-xl shadow-primary/30"
            >
              <Crown className="w-5 h-5" /> Get Subscription
            </Link>
          </div>
        </div>
      )}

      {/* ── TOP OVERLAY ── */}
      <div className={cn(
        'absolute top-0 left-0 right-0 z-30 transition-all duration-300',
        showOverlay || !playing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      )}>
        <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 sm:px-6 pt-4 pb-10">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <button
              onClick={e => { e.stopPropagation(); navigate(-1); }}
              className="flex items-center gap-2 px-3 py-2 glass-strong border border-white/10 rounded-xl text-sm text-white/80 hover:text-white hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-black text-base sm:text-lg line-clamp-1">{displayTitle}</h1>
              {series && (
                <p className="text-white/50 text-xs mt-0.5">
                  Season {selectedSeason} · Episode {selectedEpisode} — {currentEp?.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={e => { e.stopPropagation(); setShowInfo(v => !v); setShowEpisodes(false); }}
                className={cn(
                  'p-2 rounded-xl border transition-all text-sm',
                  showInfo ? 'glass-strong border-primary/40 text-primary' : 'glass-strong border-white/10 text-white/60 hover:text-white'
                )}
              >
                <Info className="w-4 h-4" />
              </button>
              {series && (
                <button
                  onClick={e => { e.stopPropagation(); setShowEpisodes(v => !v); setShowInfo(false); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-sm',
                    showEpisodes ? 'glass-strong border-primary/40 text-primary' : 'glass-strong border-white/10 text-white/60 hover:text-white'
                  )}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:block text-xs font-medium">Episodes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTER PLAY BUTTON ── */}
      {(!playing || showOverlay) && !isLocked && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-all duration-300',
            showOverlay || !playing ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="w-20 h-20 rounded-full glass-strong border-2 border-white/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <Play className={cn('w-9 h-9 text-white fill-white', playing && 'ml-1')} />
          </div>
        </div>
      )}

      {/* ── BOTTOM CONTROLS OVERLAY ── */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 z-30 transition-all duration-300',
        showOverlay || !playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      )}>
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 sm:px-6 pb-5 pt-12">
          <div className="max-w-7xl mx-auto space-y-3">
            {/* Progress Bar */}
            <div
              className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
              onClick={e => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(Math.max(0, Math.min(100, pct)));
              }}
            >
              <div
                className="h-full gradient-brand rounded-full transition-all relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -mr-1.5" />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 sm:gap-3">
                {series && (
                  <button
                    onClick={handlePrevEpisode}
                    disabled={selectedEpisode <= 1 && selectedSeason <= 1}
                    className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setPlaying(p => !p)}
                  className="w-10 h-10 rounded-full glass-strong border border-white/20 flex items-center justify-center hover:border-white/40 transition-all"
                >
                  {playing
                    ? <div className="flex gap-1"><div className="w-1 h-4 bg-white rounded" /><div className="w-1 h-4 bg-white rounded" /></div>
                    : <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  }
                </button>
                {series && (
                  <button
                    onClick={handleNextEpisode}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setMuted(m => !m)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-white/50 text-xs hidden sm:block">
                  {Math.round(progress)}% watched
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-1 text-xs text-white/50">
                  <span className="px-1.5 py-0.5 glass-strong border border-white/10 rounded text-[10px]">Space</span>
                  <span className="text-white/30">play</span>
                  <span className="px-1.5 py-0.5 glass-strong border border-white/10 rounded text-[10px] ml-2">F</span>
                  <span className="text-white/30">fullscreen</span>
                  {series && <>
                    <span className="px-1.5 py-0.5 glass-strong border border-white/10 rounded text-[10px] ml-2">E</span>
                    <span className="text-white/30">episodes</span>
                  </>}
                </div>
                <button
                  onClick={() => containerRef.current?.requestFullscreen?.()}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO PANEL ── */}
      {showInfo && (
        <div
          className="absolute top-16 right-4 sm:right-6 bottom-20 z-40 w-80 glass-strong border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-bold text-white">Info</span>
            <button onClick={() => setShowInfo(false)} className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <img src={content.poster} alt={displayTitle} className="w-full h-40 object-cover rounded-xl" />
            <div>
              <h2 className="font-black text-white text-base">{displayTitle}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400">{content.rating}</span>
                </div>
                <span className="text-xs text-white/50">{content.year}</span>
                {movie && <span className="text-xs text-white/50">{movie.duration} min</span>}
                {series && <span className="text-xs text-white/50">{series.seasons}S · {series.episodes}E</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {content.genre.map(g => (
                <span key={g} className="px-2 py-0.5 text-[10px] font-semibold glass border border-white/10 text-white/60 rounded-lg">{g}</span>
              ))}
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {language === 'fa' ? content.descriptionFa : content.description}
            </p>

            {/* Progress */}
            <div className="glass border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Your Progress</span>
                <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full gradient-brand rounded-full" style={{ width: `${progress}%` }} />
              </div>
              {progress === 100 && (
                <div className="flex items-center gap-1.5 mt-2 text-green-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Completed
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                to={`/${language}/${movie ? 'movies' : 'series'}/${content.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 glass border border-white/10 text-xs font-semibold text-white/70 hover:text-white rounded-xl transition-all"
                onClick={e => e.stopPropagation()}
              >
                <Info className="w-3.5 h-3.5" /> Full Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── EPISODE LIST PANEL ── */}
      {showEpisodes && series && (
        <div
          className="absolute top-16 right-4 sm:right-6 bottom-20 z-40 w-80 glass-strong border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-bold text-white">Episodes</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {seasons.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={cn(
                      'px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all',
                      selectedSeason === s ? 'gradient-brand text-white' : 'glass border border-white/10 text-white/50 hover:text-white'
                    )}
                  >
                    S{s}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowEpisodes(false)} className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {currentEpisodes.map(ep => {
              const isCurrentEp = ep.ep === selectedEpisode && selectedSeason === selectedSeason;
              return (
                <button
                  key={ep.ep}
                  onClick={() => handlePlayEpisode(selectedSeason, ep.ep)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group',
                    isCurrentEp && 'bg-primary/10'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                    isCurrentEp ? 'gradient-brand text-white' : 'glass border border-white/10 text-white/50'
                  )}>
                    {isCurrentEp && playing ? (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-white rounded animate-pulse" />
                        <div className="w-0.5 h-3 bg-white rounded animate-pulse delay-75" />
                        <div className="w-0.5 h-3 bg-white rounded animate-pulse delay-150" />
                      </div>
                    ) : ep.ep}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-semibold line-clamp-1', isCurrentEp ? 'text-primary' : 'text-white/80')}>
                      {ep.title}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">{ep.duration}</p>
                  </div>
                  {isCurrentEp && (
                    <span className="text-[10px] text-primary font-bold shrink-0">Playing</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Auto-advance indicator */}
          <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-white/40">Auto-advance enabled</span>
          </div>
        </div>
      )}
    </div>
  );
}
