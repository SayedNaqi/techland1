// Embed-link handling for Movies & Series (OK.ru / VK / Bunny Stream).
// Admins paste a normal watch link, an embed link, or the full Bunny iframe
// snippet; we store the canonical player (embed) URL.
// Only these platforms are allowed — anything else is rejected (invalid_embed_host).
// Bunny HLS (.m3u8 on *.b-cdn.net) is NOT an embed — paste it into the
// direct-file field instead (normalizeDirectUrl accepts it, NativePlayer plays it).

const ALLOWED_HOSTS = new Set([
  'ok.ru', 'www.ok.ru', 'm.ok.ru',
  'vk.com', 'www.vk.com', 'm.vk.com',
  'vkvideo.ru', 'www.vkvideo.ru',
  'vk.ru', 'www.vk.ru',
  'player.mediadelivery.net',
]);

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUNNY_PATH_RE = /^\/(embed|play)\/(\d+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

function isBunnyHost(host) {
  return host === 'player.mediadelivery.net' || host.endsWith('.mediadelivery.net');
}

export function detectSource(embedUrl) {
  try {
    const h = new URL(embedUrl).hostname.toLowerCase();
    if (h.includes('ok.ru')) return 'ok';
    if (h.includes('vk')) return 'vk';
    if (h.includes('mediadelivery.net') || h.includes('b-cdn.net') || h.includes('bunny')) return 'bunny';
  } catch { /* invalid */ }
  return 'custom';
}

/**
 * Normalize a pasted OK.ru / VK / Bunny watch (or embed) link into a canonical embed URL.
 * Returns null when the link is not a supported platform URL.
 *
 * Accepted Bunny formats (all normalize to https://player.mediadelivery.net/embed/{library}/{guid}):
 *  - full iframe snippet: <iframe src="https://player.mediadelivery.net/embed/777612/<guid>?autoplay=..." ...>
 *  - embed link:          https://player.mediadelivery.net/embed/777612/<guid>[?query]
 *  - share/play link:     https://player.mediadelivery.net/play/777612/<guid>
 *  - shorthand:           777612/<guid>
 * Rejected (return null, paste elsewhere instead):
 *  - bare GUID alone (<guid>) — library ID is required, paste the full embed link
 *  - HLS URL (https://vz-....b-cdn.net/<guid>/playlist.m3u8) — that's a direct file,
 *    paste it into the direct-file field (NativePlayer plays it via hls.js)
 */
export function normalizeEmbedUrl(input) {
  if (!input || typeof input !== 'string') return null;
  let raw = input.trim();
  if (!raw) return null;

  // 1) Full <iframe ... src="..."> snippet pasted straight from Bunny dashboard.
  if (raw.includes('<iframe')) {
    const m = raw.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!m) return null;
    return normalizeEmbedUrl(m[1]);
  }

  // 2) Shorthand "libraryId/guid" (e.g. 777612/694ad1ef-d777-...).
  const short = raw.match(/^(\d+)\s*\/\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (short) {
    return `https://player.mediadelivery.net/embed/${short[1]}/${short[2].toLowerCase()}`;
  }

  // 3) Bare GUID alone cannot be resolved (library ID unknown) — reject with
  // invalid_embed_url so the admin knows to paste the full embed link.
  if (GUID_RE.test(raw)) return null;

  let url;
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

  if (!ALLOWED_HOSTS.has(host)) return null;

  if (host.includes('ok.ru')) {
    // https://ok.ru/video/123456  →  https://ok.ru/videoembed/123456
    const m = url.pathname.match(/\/video(?:embed)?\/(\d+)/);
    if (!m) return null;
    return `https://ok.ru/videoembed/${m[1]}`;
  }

  // VK watch links: https://vk.com/video-123_456 (also vkvideo.ru / m.vk.com)
  // → https://vk.com/video_ext.php?oid=-123&id=456&hd=2
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

export function videoRowToApi(r) {
  return {
    id: r.id,
    slug: r.slug,
    kind: r.kind,
    title: { en: r.title_en, fa: r.title_fa },
    description: { en: r.description_en, fa: r.description_fa },
    posterUrl: r.poster_url || undefined,
    backdropUrl: r.backdrop_url || undefined,
    year: r.year ?? undefined,
    genre: r.genre || [],
    durationMin: r.duration_min ?? undefined,
    country: r.country || undefined,
    rating: r.rating != null ? Number(r.rating) : undefined,
    seasons: r.seasons ?? undefined,
    episodes: r.episodes ?? undefined,
    parts: (r.parts || []).map((p) => ({
      label: { en: p.label_en || p.label || '', fa: p.label_fa || '' },
      embedUrl: p.embed_url || '',
      // Self-hosted file (MP4/HLS, incl. Bunny vz-*.b-cdn.net/…/playlist.m3u8).
      // The native TechLand player uses this first;
      // embed_url (OK/VK/Bunny iframe) is only the fallback.
      directUrl: p.direct_url || '',
      source: detectSource(p.embed_url || ''),
    })),
    accessType: r.access_type,
    isFeatured: !!r.is_featured,
    isNew: !!r.is_new,
    isTrending: !!r.is_trending,
    isActive: r.is_active !== false,
  };
}

/** Direct video file URL (self-hosted MP4/HLS). Any https host is allowed. */
export function normalizeDirectUrl(input) {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();
  if (!clean) return '';
  let url;
  try {
    url = new URL(clean);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(url.pathname)) return null;
  return url.toString();
}
