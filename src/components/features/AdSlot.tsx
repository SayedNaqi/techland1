import { useEffect, useMemo, useState } from 'react';
import { API_BASE, isBackendEnabled, type ApiAd } from '@/lib/api';

/** Banner slot on Movies / Series / Watch pages. Admin-managed (Admin → Ads). */
export default function AdSlot({ slot, label }: { slot: 'movies_hero' | 'series_hero' | 'watch_top' | 'watch_bottom'; label?: string }) {
  const [ads, setAds] = useState<ApiAd[]>([]);

  useEffect(() => {
    if (!isBackendEnabled) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/public/ads?slot=${slot}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ads?: ApiAd[] } | null) => {
        if (!cancelled && d?.ads && d.ads.length > 0) setAds(d.ads);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slot]);

  const ad = useMemo(() => {
    if (ads.length === 0) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  }, [ads]);

  if (!ad) return null;

  return (
    <div className="directory-filters" style={{ overflow: 'hidden', padding: 0 }} aria-label={label ?? ad.title}>
      {ad.html ? (
        <div dangerouslySetInnerHTML={{ __html: ad.html }} style={{ display: 'block' }} />
      ) : ad.imageUrl ? (
        <a
          href={ad.linkUrl || '#'}
          target={ad.linkUrl ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => { if (!ad.linkUrl) e.preventDefault(); }}
          style={{ display: 'block' }}
        >
          <img src={ad.imageUrl} alt={ad.title} loading="lazy" style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover' }} />
        </a>
      ) : ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="opp-link" style={{ display: 'block', padding: '14px 18px' }}>
          {ad.title}
        </a>
      ) : (
        <p style={{ margin: 0, padding: '14px 18px', fontSize: 13, color: '#41506b' }}>{ad.title}</p>
      )}
    </div>
  );
}
