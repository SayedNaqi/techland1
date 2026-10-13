import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { localizedPath } from '@/constants/opportunityRoutes';
import type { VideoRecord } from '@/lib/videos';

/** "Suggested for you" rail — same-kind videos ranked by shared genres, flags, rating. */
export function rankSuggestions(all: VideoRecord[], currentSlug?: string, limit = 8): VideoRecord[] {
  const current = currentSlug ? all.find((v) => v.slug === currentSlug) : undefined;
  return all
    .filter((v) => v.slug !== currentSlug)
    .filter((v) => !current || v.kind === current.kind)
    .map((v) => {
      let score = 0;
      if (current) {
        const shared = v.genre.filter((g) => current.genre.includes(g)).length;
        score += shared * 10;
      }
      if (v.isFeatured) score += 5;
      if (v.isTrending) score += 4;
      if (v.isNew) score += 3;
      score += (v.rating ?? 0) / 2;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.v);
}

export default function SuggestedRow({
  videos, currentSlug, title,
}: {
  videos: VideoRecord[];
  currentSlug?: string;
  title: string;
}) {
  const { language } = useLanguage();
  const items = rankSuggestions(videos, currentSlug);
  if (items.length === 0) return null;

  return (
    <div>
      <h3 style={{ color: '#07114f', margin: '26px 0 12px' }}>{title}</h3>
      <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(150px, 180px)', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
        {items.map((v) => {
          const name = v.title[language] || v.title.en;
          return (
            <Link
              key={v.slug}
              to={localizedPath(`/watch/${v.slug}/`, language)}
              className="opp-card"
              style={{ textDecoration: 'none', overflow: 'hidden', padding: 0, minWidth: 0 }}
            >
              <div style={{ position: 'relative', aspectRatio: '2/3', background: '#0b1230' }}>
                {v.posterUrl && <img src={v.posterUrl} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,8,24,.25)' }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={15} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                  </span>
                </span>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#07114f', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#65718a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {v.year && <span>{v.year}</span>}
                  {v.rating != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#b8860b' }}><Star size={11} fill="currentColor" />{v.rating}</span>}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
