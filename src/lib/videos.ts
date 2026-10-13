/**
 * Movies & Series catalog — OK.ru / VK / Bunny Stream embeds.
 *
 * When VITE_API_URL is set, the catalog comes from PostgreSQL (Admin → Videos).
 * Otherwise it falls back to the fictional mock samples (browse-only, no playback).
 */
import { useEffect, useState } from 'react';
import { MOVIES, SERIES } from '@/constants/mockData';
import { API_BASE, isBackendEnabled } from './api';

export type VideoKind = 'movie' | 'series';
export type VideoSource = 'ok' | 'vk' | 'bunny' | 'custom';

export interface VideoPart {
  label: { en: string; fa: string };
  embedUrl: string;
  /** Self-hosted file (MP4/HLS). The native TechLand player uses this first. */
  directUrl: string;
  source: VideoSource;
}

export interface VideoRecord {
  id: string;
  slug: string;
  kind: VideoKind;
  title: { en: string; fa: string };
  description: { en: string; fa: string };
  posterUrl?: string;
  backdropUrl?: string;
  year?: number;
  genre: string[];
  durationMin?: number;
  country?: string;
  rating?: number;
  seasons?: number;
  episodes?: number;
  parts: VideoPart[];
  accessType: 'free' | 'subscription';
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
}

const ALLOWED_HOSTS = [
  'ok.ru', 'www.ok.ru', 'm.ok.ru',
  'vk.com', 'www.vk.com', 'm.vk.com',
  'vkvideo.ru', 'www.vkvideo.ru',
  'vk.ru', 'www.vk.ru',
  'player.mediadelivery.net',
];

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUNNY_PATH_RE = /^\/(embed|play)\/(\d+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

function isBunnyHost(host: string): boolean {
  return host === 'player.mediadelivery.net' || host.endsWith('.mediadelivery.net');
}

export function detectSource(embedUrl: string): VideoSource {
  try {
    const h = new URL(embedUrl).hostname.toLowerCase();
    if (h.includes('ok.ru')) return 'ok';
    if (h.includes('vk')) return 'vk';
    if (h.includes('mediadelivery.net') || h.includes('b-cdn.net') || h.includes('bunny')) return 'bunny';
  } catch { /* invalid */ }
  return 'custom';
}

/**
 * Normalize a pasted OK.ru / VK / Bunny watch (or embed) link into the canonical
 * player URL. Returns null for unsupported links — the admin form rejects those.
 *
 * Accepted Bunny formats (all → https://player.mediadelivery.net/embed/{library}/{guid}):
 *  - full iframe snippet from the Bunny dashboard
 *  - embed link:  https://player.mediadelivery.net/embed/777612/<guid>[?query]
 *  - share link:  https://player.mediadelivery.net/play/777612/<guid>
 *  - shorthand:   777612/<guid>
 * Rejected (paste elsewhere instead):
 *  - bare GUID alone — library ID is required, paste the full embed link
 *  - HLS URL (https://vz-….b-cdn.net/<guid>/playlist.m3u8) — that's a direct file,
 *    paste it into the direct-file field (NativePlayer plays it via hls.js)
 */
export function normalizeEmbedUrl(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // 1) Full <iframe src="…"> snippet pasted straight from Bunny.
  if (raw.includes('<iframe')) {
    const m = raw.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!m) return null;
    return normalizeEmbedUrl(m[1]);
  }

  // 2) Shorthand "libraryId/guid".
  const short = raw.match(/^(\d+)\s*\/\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (short) {
    return `https://player.mediadelivery.net/embed/${short[1]}/${short[2].toLowerCase()}`;
  }

  // 3) Bare GUID alone cannot be resolved (library ID unknown).
  if (GUID_RE.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();

  // 4) Bunny Stream player links.
  if (isBunnyHost(host)) {
    const m = url.pathname.match(BUNNY_PATH_RE);
    if (!m) return null;
    return `https://player.mediadelivery.net/embed/${m[2]}/${m[3].toLowerCase()}`;
  }

  if (!ALLOWED_HOSTS.includes(host)) return null;

  if (host.includes('ok.ru')) {
    const m = url.pathname.match(/\/video(?:embed)?\/(\d+)/);
    if (!m) return null;
    return `https://ok.ru/videoembed/${m[1]}`;
  }

  if (url.pathname.includes('video_ext.php')) {
    url.hostname = 'vk.com';
    url.protocol = 'https:';
    if (!url.searchParams.get('hd')) url.searchParams.set('hd', '2');
    return url.toString();
  }
  const m = (url.pathname + url.search).match(/video(-?\d+)_(\d+)/);
  if (!m) return null;
  return `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2`;
}

// ---------- Mock fallback (browse-only samples, no real playback) ----------
export interface MovieLike {
  id: string; title: string; titleFa: string; year: number; genre: string[]; rating: number; poster: string; backdrop: string; country: string; description: string; descriptionFa: string; accessType: 'free' | 'subscription'; isFeatured?: boolean; isNew?: boolean; isTrending?: boolean; duration?: string; embedUrl?: string; directUrl?: string;
}

function mockToRecord(m: MovieLike, kind: VideoKind, seasons?: number, episodes?: number): VideoRecord {
  return {
    id: m.id,
    slug: m.id,
    kind,
    title: { en: m.title, fa: m.titleFa },
    description: { en: m.description, fa: m.descriptionFa },
    posterUrl: m.poster,
    backdropUrl: m.backdrop,
    year: m.year,
    genre: m.genre,
    durationMin: m.duration ? parseInt(m.duration, 10) || undefined : undefined,
    country: m.country,
    rating: m.rating,
    seasons,
    episodes,
    parts: m.embedUrl || m.directUrl
      ? [{ label: { en: 'Main', fa: 'اصلی' }, embedUrl: m.embedUrl ?? '', directUrl: m.directUrl ?? '', source: detectSource(m.embedUrl ?? m.directUrl ?? '') }]
      : [],
    accessType: m.accessType,
    isFeatured: m.isFeatured,
    isNew: m.isNew,
    isTrending: m.isTrending,
    isActive: true,
  };
}

export const MOCK_VIDEO_FALLBACK: VideoRecord[] = [
  ...MOVIES.map((m) => mockToRecord(m, 'movie')),
  ...SERIES.map((s) => mockToRecord(
    { ...s, duration: undefined, embedUrl: undefined }, 'series', s.seasons, s.episodes,
  )),
];

async function fetchVideos(kind?: VideoKind): Promise<VideoRecord[] | null> {
  if (!isBackendEnabled) return null;
  try {
    const res = await fetch(`${API_BASE}/api/public/videos${kind ? `?kind=${kind}` : ''}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { videos?: VideoRecord[] };
    return data.videos ?? [];
  } catch {
    return null;
  }
}

export function useVideos(kind: VideoKind): { videos: VideoRecord[]; backend: boolean; live: boolean } {
  const [videos, setVideos] = useState<VideoRecord[]>(() =>
    MOCK_VIDEO_FALLBACK.filter((v) => v.kind === kind),
  );
  // live === true only when the list actually came from the server catalog.
  const [live, setLive] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void fetchVideos(kind).then((list) => {
      if (!cancelled && list) {
        setVideos(list);
        setLive(true);
      }
    });
    return () => { cancelled = true; };
  }, [kind]);
  return { videos, backend: isBackendEnabled, live };
}

export function useVideo(slug: string | undefined): { video: VideoRecord | null | undefined; backend: boolean } {
  const [video, setVideo] = useState<VideoRecord | null | undefined>(() =>
    slug ? (MOCK_VIDEO_FALLBACK.find((v) => v.slug === slug) ?? null) : null,
  );
  useEffect(() => {
    if (!slug) return;
    if (!isBackendEnabled) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/public/videos/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { video?: VideoRecord } | null) => {
        if (!cancelled) setVideo(d?.video ?? null);
      })
      .catch(() => { if (!cancelled) setVideo(null); });
    return () => { cancelled = true; };
  }, [slug]);
  return { video, backend: isBackendEnabled };
}
