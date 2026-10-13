import { useState } from 'react';
import { Play, Lock, Crown, ExternalLink, AlertCircle, Maximize2, Clapperboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { detectSource, type VideoSource } from '@/lib/videos';

interface VideoPlayerProps {
  embedUrl?: string;
  thumbnail: string;
  title: string;
  contentId?: string;
  isLocked?: boolean;
  language?: string;
  /** Detected automatically from the embed URL when omitted. */
  source?: VideoSource;
  /** Cover the source platform's corner logos with neutral masks (default true). */
  hideBrand?: boolean;
}

/**
 * Neutral corner masks that cover the OK.ru / VK player logos and badges.
 * pointer-events-none so all player controls stay clickable. They are rendered
 * inside the player container, so they also stay visible in our own fullscreen
 * mode. Note: watermarks burned into the video file itself cannot be covered.
 * Bunny Stream and custom embeds are our own videos — no masks needed.
 */
function BrandMasks({ source }: { source: VideoSource }) {
  if (source === 'custom' || source === 'bunny') return null;
  return (
    <>
      {/* top-left: OK.ru logo area */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 h-11 w-32 bg-black" />
      {/* top-right: share / "open in app" buttons */}
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-10 h-11 w-28 bg-black" />
      {/* bottom-right: VK watermark / quality badges */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 z-10 h-12 w-40 bg-black" />
    </>
  );
}

export default function VideoPlayer({
  embedUrl,
  thumbnail,
  title,
  contentId,
  isLocked = false,
  language = 'en',
  source,
  hideBrand = true,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const defaultEmbed = 'https://ok.ru/videoembed/';
  const src = embedUrl || defaultEmbed;
  const platform: VideoSource = source ?? detectSource(src);
  // Bunny Stream is our own video: allow its fullscreen / PiP features.
  // OK/VK keep the restricted policy so the platform's own fullscreen button
  // can't escape our brand masks.
  const isOwnVideo = platform === 'bunny' || platform === 'custom';

  if (isLocked) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-white/60" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-1">Subscription Required</p>
            <p className="text-white/60 text-sm mb-4 max-w-xs">Get a TechLand subscription to watch this content</p>
            <Link
              to={`/${language}/subscriptions`}
              className="inline-flex items-center gap-2 px-6 py-2.5 gradient-brand text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
            >
              <Crown className="w-4 h-4" /> Get Subscription
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (playing && !error) {
    return (
      <div
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
      >
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full"
          // Bunny/custom (own videos): full player features allowed.
          // OK/VK: no allowFullScreen on purpose — the platform's own fullscreen
          // button would escape our brand masks.
          {...(isOwnVideo
            ? {
                allowFullScreen: true,
                allow: 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;',
              }
            : { allow: 'autoplay' })}
          frameBorder="0"
          title={title}
          onError={() => setError(true)}
        />
        {hideBrand && <BrandMasks source={platform} />}
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 group cursor-pointer"
      onClick={() => !error && setPlaying(true)}
    >
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
          <AlertCircle className="w-8 h-8 text-orange-400" />
          <p className="text-white/80 text-sm text-center px-4">
            Video unavailable. The embed URL may not be configured.
          </p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 glass border border-white/20 text-white text-xs font-medium rounded-xl hover:bg-white/10 transition-all"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" /> {language === 'fa' ? 'باز کردن ویدیو' : 'Open video'}
          </a>
        </div>
      ) : (
        <>
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110',
                'bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-xl shadow-black/40'
              )}
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Full-screen watch link */}
          {contentId && (
            <Link
              to={`/${language}/watch/${contentId}`}
              onClick={e => e.stopPropagation()}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 glass-strong border border-white/20 rounded-lg text-[10px] font-semibold text-white/80 hover:text-white hover:border-white/40 transition-all opacity-0 group-hover:opacity-100"
            >
              <Maximize2 className="w-3 h-3" /> Full Screen
            </Link>
          )}

          {/* Neutral player badge (no platform branding) */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
            <Clapperboard className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[10px] text-white/70 font-medium">TechLand</span>
          </div>

          <div className="absolute bottom-4 left-4">
            <p className="text-white text-sm font-semibold drop-shadow line-clamp-1 max-w-[280px]">{title}</p>
          </div>
        </>
      )}
    </div>
  );
}
