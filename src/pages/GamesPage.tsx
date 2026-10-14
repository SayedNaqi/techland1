import { useMemo, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useGames } from '@/lib/games';

export default function GamesPage() {
  const { language } = useLanguage();
  const { games, backend } = useGames();
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('all');

  const platforms = useMemo(
    () => ['all', ...Array.from(new Set(games.flatMap((g) => g.platform))).slice(0, 20)],
    [games],
  );
  const filtered = games.filter((g) => {
    if (platform !== 'all' && !g.platform.includes(platform)) return false;
    if (!query.trim()) return true;
    const q = query.toLocaleLowerCase();
    return (
      g.title.en.toLowerCase().includes(q) ||
      g.title.fa.includes(query.trim()) ||
      g.slug.includes(q)
    );
  });

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p className="pathway-eyebrow">{language === 'fa' ? 'بازی‌ها' : 'Games'}</p>
          <h1>{language === 'fa' ? 'فروشگاه بازی' : 'Game store'}</h1>
          <p>
            {backend
              ? language === 'fa'
                ? 'تازه‌ترین بازی‌ها با پوستر — موارد جدید با نشان «جدید» مشخص می‌شوند.'
                : 'Latest games with posters — new arrivals are marked NEW.'
              : language === 'fa'
                ? 'نمونه‌های نمایشی؛ با اتصال بک‌اند، بازی‌هایی که ادمین اضافه می‌کند نمایش داده می‌شود.'
                : 'Demo samples; with the backend connected, admin-added games appear here.'}
          </p>
        </div>
      </section>

      <section className="pathway-section">
        <div className="pathway-container">
          <div className="directory-filters" style={{ marginBottom: 18 }}>
            <div className="quick-search-form" style={{ gridTemplateColumns: 'minmax(0,1fr) 180px' }}>
              <label className="quick-search-form__query">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={language === 'fa' ? 'جستجوی بازی…' : 'Search games…'}
                  aria-label={language === 'fa' ? 'جستجو' : 'Search'}
                />
              </label>
              <label className="quick-search-form__kind">
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Platform">
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p === 'all' ? (language === 'fa' ? 'همه' : 'All') : p}</option>
                  ))}
                </select>
              </label>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#65718a' }}>
              {language === 'fa' ? `${filtered.length} مورد` : `${filtered.length} items`}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="opp-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {filtered.map((g) => {
                const title = g.title[language] || g.title.en;
                const tags = [...g.genre.slice(0, 2), ...g.platform.slice(0, 2)].slice(0, 3);
                return (
                  <article key={g.slug} className="opp-card" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ position: 'relative', aspectRatio: '4/3', background: '#0b1230' }}>
                      {g.thumbnailUrl ? (
                        <img src={g.thumbnailUrl} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5b6b8c' }}>
                          <Gamepad2 size={36} />
                        </div>
                      )}
                      {g.isNew && <span style={{ position: 'absolute', top: 8, insetInlineStart: 8, fontSize: 10, fontWeight: 800, background: '#16a34a', color: '#fff', borderRadius: 6, padding: '2px 6px' }}>{language === 'fa' ? 'جدید' : 'NEW'}</span>}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#07114f', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
                      {tags.length > 0 && (
                        <p style={{ margin: '6px 0 0', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {tags.map((tag) => (
                            <span key={tag} style={{ fontSize: 10, background: '#eef2f8', color: '#41506b', borderRadius: 6, padding: '1px 6px' }}>{tag}</span>
                          ))}
                        </p>
                      )}
                    </div>
                  </article>
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
                      ? 'هنوز بازی اضافه نشده است؛ از پنل ادمین → بازی‌ها اضافه کنید.'
                      : 'No games added yet; add them from Admin → Games.'
                    : language === 'fa'
                      ? 'در حالت نمایشی بدون بک‌اند، فهرست نمونه نمایش داده می‌شود.'
                      : 'In preview mode without a backend, sample listings are shown.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
