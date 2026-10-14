// Games catalog (Admin → Games). Posters are uploaded via
// POST /api/admin/upload/image and stored as thumbnail_url
// (https URL or /media/... path — the frontend resolves both).

export function gameRowToApi(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: { en: r.title_en, fa: r.title_fa },
    description: { en: r.description_en, fa: r.description_fa },
    thumbnailUrl: r.thumbnail_url || undefined,
    screenshots: r.screenshots || [],
    genre: r.genre || [],
    platform: r.platform || [],
    price: r.price != null ? Number(r.price) : undefined,
    currency: r.currency || 'USD',
    accessType: r.access_type,
    rating: r.rating != null ? Number(r.rating) : undefined,
    releaseYear: r.release_year ?? undefined,
    developer: r.developer || undefined,
    publisher: r.publisher || undefined,
    size: r.size || undefined,
    isFeatured: !!r.is_featured,
    isNew: !!r.is_new,
    isActive: r.is_active !== false,
  };
}

/**
 * Poster / screenshot URL: /media/... upload path or any http(s) image URL.
 * Deliberately lenient about file extensions: many real image services
 * (google thumbnails, dynamic CDNs) serve images from extensionless URLs.
 * Mistakes are still visible — the admin form renders a live preview with a
 * red outline when the image fails to load.
 */
export function normalizeImageUrl(input) {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();
  if (!clean) return '';
  if (clean.startsWith('/media/')) return clean;
  let url;
  try {
    url = new URL(clean);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  return url.toString();
}
