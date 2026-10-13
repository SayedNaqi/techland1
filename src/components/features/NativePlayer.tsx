import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle, Loader2, Maximize2, Minimize2, Pause, Play,
  RotateCcw, RotateCw, Settings, Volume2, VolumeX,
} from 'lucide-react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';

interface NativePlayerProps {
  src: string;
  poster?: string;
  title: string;
  language?: string;
  autoPlay?: boolean;
  /** Unique key for resume-position memory (e.g. video slug + part index). */
  storageKey?: string;
  onEnded?: () => void;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function hashKey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return `p${Math.abs(h).toString(36)}`;
}

/**
 * TechLand native player — our own chrome over a plain <video> element.
 * No third-party branding, no external scripts: MP4/WebM/MOV natively,
 * HLS (.m3u8) via hls.js. Used whenever a part has a self-hosted direct URL.
 */
export default function NativePlayer({
  src, poster, title, language = 'en', autoPlay = false, storageKey, onEnded,
}: NativePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(() => {
    try { return Number(localStorage.getItem('techland_player_volume') ?? 0.9); } catch { return 0.9; }
  });
  const [rate, setRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resumeAt, setResumeAt] = useState<number | null>(null);

  const posKey = storageKey ? `techland_native_pos_${hashKey(storageKey)}` : null;

  // ---- source attach (native vs HLS) ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    setError(false);
    setTime(0);
    setDuration(0);
    setBuffered(0);
    hlsRef.current?.destroy();
    hlsRef.current = null;

    const isHls = /\.m3u8(\?|#|$)/i.test(src);
    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 30 });
        hlsRef.current = hls;
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError(true);
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        setError(true);
        setLoading(false);
      }
    } else {
      video.src = src;
    }
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  // ---- resume memory ----
  useEffect(() => {
    if (!posKey) return;
    try {
      const saved = Number(localStorage.getItem(posKey) ?? 0);
      if (saved > 10) setResumeAt(saved);
    } catch { /* ignore */ }
  }, [posKey, src]);

  useEffect(() => {
    if (!posKey || time < 5) return;
    const t = window.setTimeout(() => {
      try {
        if (duration - time > 15) localStorage.setItem(posKey, String(Math.floor(time)));
        else localStorage.removeItem(posKey);
      } catch { /* ignore */ }
    }, 2000);
    return () => window.clearTimeout(t);
  }, [time, duration, posKey]);

  // ---- controls auto-hide ----
  const poke = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3200);
  }, []);
  useEffect(() => {
    poke();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [poke]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration)) v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration);
  };

  const seekTo = (clientX: number, rect: DOMRect) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = ((clientX - rect.left) / rect.width) * v.duration;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current?.requestFullscreen?.();
  };

  const cycleRate = () => {
    const steps = [1, 1.25, 1.5, 2];
    const next = steps[(steps.indexOf(rate) + 1) % steps.length];
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  // ---- keyboard ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); poke(); break;
        case 'ArrowRight': seekBy(10); poke(); break;
        case 'ArrowLeft': seekBy(-10); poke(); break;
        case 'ArrowUp': e.preventDefault(); setVolume((x) => Math.min(1, x + 0.1)); poke(); break;
        case 'ArrowDown': e.preventDefault(); setVolume((x) => Math.max(0, x - 0.1)); poke(); break;
        case 'KeyF': toggleFullscreen(); break;
        case 'KeyM': setMuted((m) => !m); poke(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [togglePlay, poke, rate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
    try { localStorage.setItem('techland_player_volume', String(volume)); } catch { /* ignore */ }
  }, [volume, muted]);

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-9 h-9 text-orange-400" />
        <p className="text-white/80 text-sm px-6 text-center">
          {language === 'fa' ? 'پخش این ویدیو ممکن نشد. لینک مستقیم را بررسی کنید.' : 'This video could not be played. Check the direct link.'}
        </p>
      </div>
    );
  }

  const fa = language === 'fa';
  return (
    <div
      ref={containerRef}
      className="group/native relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 select-none"
      onMouseMove={poke}
      onClick={() => { togglePlay(); poke(); }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        poster={poster}
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        onPlay={() => { setPlaying(true); setLoading(false); }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (Number.isFinite(v.duration)) setDuration(v.duration);
        }}
        onEnded={() => { setPlaying(false); if (posKey) { try { localStorage.removeItem(posKey); } catch { /* ignore */ } } onEnded?.(); }}
        onError={() => setError(true)}
      />

      {/* TechLand top gradient + title */}
      <div className={cn(
        'absolute top-0 inset-x-0 z-20 transition-opacity duration-300 pointer-events-none',
        showControls || !playing ? 'opacity-100' : 'opacity-0',
      )}>
        <div className="bg-gradient-to-b from-black/80 to-transparent px-5 pt-4 pb-8">
          <p className="text-white text-sm font-bold line-clamp-1 flex items-center gap-2">
            <span className="inline-block w-2 h-4 rounded-sm gradient-brand" aria-hidden="true" />
            {title}
          </p>
        </div>
      </div>

      {/* Center state: loader / big play / resume */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
        </div>
      )}
      {!loading && !playing && resumeAt == null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-md border-2 border-white/50 shadow-2xl transition-transform group-hover/native:scale-105">
            <Play className="w-9 h-9 text-white fill-white ml-1" />
          </div>
        </div>
      )}
      {!loading && !playing && resumeAt != null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const v = videoRef.current;
              if (v && Number.isFinite(v.duration) && resumeAt < v.duration - 10) v.currentTime = resumeAt;
              setResumeAt(null);
              togglePlay();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold shadow-xl hover:opacity-90"
          >
            <Play className="w-4 h-4 fill-white" />
            {fa ? `ادامه از ${fmt(resumeAt)}` : `Resume from ${fmt(resumeAt)}`}
          </button>
        </div>
      )}

      {/* Bottom control bar */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 z-20 transition-all duration-300',
          showControls || !playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 sm:px-5 pb-4 pt-10">
          {/* Seek */}
          <div
            className="relative h-1.5 rounded-full bg-white/20 cursor-pointer group/bar mb-3"
            onClick={(e) => seekTo(e.clientX, e.currentTarget.getBoundingClientRect())}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: duration ? `${(buffered / duration) * 100}%` : 0 }} />
            <div className="absolute inset-y-0 left-0 rounded-full gradient-brand" style={{ width: duration ? `${(time / duration) * 100}%` : 0 }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex items-center justify-between" dir="ltr">
            <div className="flex items-center gap-1 sm:gap-2">
              <button type="button" onClick={() => seekBy(-10)} className="p-2 text-white/70 hover:text-white" aria-label={fa ? '۱۰ ثانیه عقب' : 'Back 10s'}>
                <RotateCcw className="w-[18px] h-[18px]" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shadow-lg hover:opacity-90"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing
                  ? <span className="flex gap-1"><span className="w-1 h-4 bg-white rounded" /><span className="w-1 h-4 bg-white rounded" /></span>
                  : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}
              </button>
              <button type="button" onClick={() => seekBy(10)} className="p-2 text-white/70 hover:text-white" aria-label={fa ? '۱۰ ثانیه جلو' : 'Forward 10s'}>
                <RotateCw className="w-[18px] h-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="p-2 text-white/70 hover:text-white"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted || volume === 0 ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                className="hidden sm:block w-20 accent-white/80"
                aria-label="Volume"
              />
              <span className="text-white/70 text-xs tabular-nums ml-1">{fmt(time)} / {fmt(duration)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={cycleRate}
                className="px-2 py-1 text-[11px] font-bold text-white/70 hover:text-white rounded-lg border border-white/15 flex items-center gap-1"
                aria-label="Playback speed"
              >
                <Settings className="w-3 h-3" />{rate}×
              </button>
              <button type="button" onClick={toggleFullscreen} className="p-2 text-white/70 hover:text-white" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <Minimize2 className="w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
