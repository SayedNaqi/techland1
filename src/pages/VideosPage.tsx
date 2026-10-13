import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Play, Star, Tv } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useVideos, type VideoKind } from '@/lib/videos';
import AdSlot from '@/components/features/AdSlot';
import SuggestedRow from '@/components/features/SuggestedRow';

export default function VideosPage({ kind }: { kind: VideoKind }) {
  const { language } = useLanguage();
  const { videos, backend } = useVideos(kind);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');

  const isFilm = kind === 'movie';
  const genres = useMemo(
    () => ['all', ...Array.from(new Set(videos.flatMap((v) => v.genre))).slice(0, 20)],
    [videos],
  );
  const filtered = videos.filter((v) => {
    if (genre !== 'all' && !v.genre.includes(genre)) return false;
    if (!query.trim()) return true;
    const q = query.toLocaleLowerCase();
    return (
      v.title.en.toLowerCase().includes(q) ||
      v.title.fa.includes(query.trim()) ||
      v.slug.includes(q)
    );
  });

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p className="pathway-eyebrow">
            {language === 'fa' ? (isFilm ? 'فیلم‌ها' : 'سریال‌ها') : isFilm ? 'Movies' : 'TV Series'}
          </p>
          <h1>{language === 'fa' ? (isFilm ? 'تماشای فیلم' : 'تماشای سریال') : isFilm ? 'Watch movies' : 'Watch series'}</h1>
          <p>
            {backend
              ? language === 'fa'
                ? 'فهرست واقعی با پخش‌کن تک‌لند — بدون نمایش برند پلتفرم منبع.'
                : 'Real catalog with the TechLand player — no source-platform branding shown.'
              : language === 'fa'
                ? 'نمونه‌های نمایشی برای آشنایی با رابط کاربری؛ پخش واقعی پس از اتصال بک‌اند فعال می‌شود.'
                : 'Demo samples showing the interface; real playback activates once the backend is connected.'}
          </p>
        </div>
      </section>

      <section className="pathway-section">
        <div className="pathway-container">
          <AdSlot slot={isFilm ? 'movies_hero' : 'series_hero'} />
          <div style={{ height: 4 }} />
          <div className="directory-filters" style={{ marginBottom: 18 }}>
            <div className="quick-search-form" style={{ gridTemplateColumns: 'minmax(0,1fr) 180px' }}>
              <label className="quick-search-form__query">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={language === 'fa' ? 'جستجوی عنوان…' : 'Search titles…'}
                  aria-label={language === 'fa' ? 'جستجو' : 'Search'}
                />
              </label>
              <label className="quick-search-form__kind">
                <select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Genre">
                  {genres.map((g) => (
                    <option key={g} value={g}>{g === 'all' ? (language === 'fa' ? 'همه' : 'All') : g}</option>
                  ))}
                </select>
              </label>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#65718a' }}>
              {language === 'fa' ? `${filtered.length} مورد` : `${filtered.length} items`}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="opp-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {filtered.map((v) => {
                const title = v.title[language] || v.title.en;
                return (
                  <Link
                    key={v.slug}
                    to={localizedPath(`/watch/${v.slug}/`, language)}
                    className="opp-card"
                    style={{ textDecoration: 'none', overflow: 'hidden', padding: 0 }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '2/3', background: '#0b1230' }}>
                      {v.posterUrl ? (
                        <img src={v.posterUrl} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5b6b8c' }}>
                          {isFilm ? <Clapperboard size={36} /> : <Tv size={36} />}
                        </div>
                      )}
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,8,24,.35)', opacity: 0 }}
                        className="opp-card__play"
                      >
                        <span style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                        </span>
                      </span>
                      {v.isNew && <span style={{ position: 'absolute', top: 8, insetInlineStart: 8, fontSize: 10, fontWeight: 800, background: '#16a34a', color: '#fff', borderRadius: 6, padding: '2px 6px' }}>{language === 'fa' ? 'جدید' : 'NEW'}</span>}
                      <span style={{ position: 'absolute', bottom: 8, insetInlineEnd: 8, fontSize: 10, fontWeight: 700, background: v.accessType === 'free' ? 'rgba(22,163,74,.9)' : 'rgba(40,89,168,.9)', color: '#fff', borderRadius: 6, padding: '2px 6px' }}>
                        {v.accessType === 'free' ? (language === 'fa' ? 'رایگان' : 'Free') : (language === 'fa' ? 'اشتراک' : 'Sub')}
                      </span>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#07114f', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#65718a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {v.year && <span>{v.year}</span>}
                        {v.rating != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#b8860b' }}><Star size={12} fill="currentColor" />{v.rating}</span>}
                        {v.kind === 'series' && (v.episodes || v.parts.length > 0) && (
                          <span>{v.episodes ?? v.parts.length} {language === 'fa' ? 'قسمت' : 'eps'}</span>
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="legal-notice">
              <div>
                <h2>{language === 'fa' ? 'موردی یافت نشد' : 'Nothing here yet'}</h2>
                <p>
                  {backend
                    ? language === 'fa'
                      ? 'هنوز ویدیویی اضافه نشده است؛ از پنل ادمین → ویدیوها اضافه کنید.'
                      : 'No videos added yet; add them from Admin → Videos.'
                    : language === 'fa'
                      ? 'در حالت نمایشی بدون بک‌اند، فهرست نمونه نمایش داده می‌شود.'
                      : 'In preview mode without a backend, sample listings are shown.'}
                </p>
              </div>
            </div>
          )}
          <SuggestedRow
            videos={videos}
            title={language === 'fa' ? 'پیشنهاد تک‌لند' : 'Suggested by TechLand'}
          />
        </div>
      </section>
    </div>
  );
}
