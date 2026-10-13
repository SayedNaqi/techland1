import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Film, Search, Tv } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { entertainmentSamples, type SampleKind } from '@/data/brand';
import { localizedPath } from '@/constants/opportunityRoutes';
import { platformCopy } from '@/constants/platformCopy';
import { useVideos } from '@/lib/videos';
import { useLanguage } from '@/hooks/useLanguage';

interface Card {
  key: string;
  kind: SampleKind;
  title: string;
  category: string;
  summary: string;
  image: string;
  imageAlt: string;
  search: string;
  sample: boolean;
  link?: string;
  isNew?: boolean;
  isTrending?: boolean;
  access?: string;
}

export default function EntertainmentSection() {
  const { brand, language } = useLanguage();
  const copy = brand.entertainment;
  const t = platformCopy[language];
  const [filter, setFilter] = useState<'all' | SampleKind>('all');
  const [query, setQuery] = useState('');

  // Real catalog (PostgreSQL via backend when connected). When the catalog is
  // empty/offline, the fictional samples below keep the section meaningful.
  const { videos: movies, live: moviesLive } = useVideos('movie');
  const { videos: series, live: seriesLive } = useVideos('series');
  const realCards: Card[] = useMemo(
    () =>
      [...movies, ...series].map((v) => ({
        key: `real-${v.slug}`,
        kind: (v.kind === 'movie' ? 'film' : 'series') as SampleKind,
        title: v.title[language] || v.title.en,
        category: v.genre.length > 0
          ? v.genre.slice(0, 2).join(' · ')
          : language === 'fa'
            ? v.kind === 'movie' ? 'فیلم' : 'سریال'
            : v.kind === 'movie' ? 'Film' : 'Series',
        summary: v.description[language] || v.description.en,
        image: v.posterUrl || v.backdropUrl || '/assets/sample-blue-meridian-v2.svg',
        imageAlt: v.title[language] || v.title.en,
        search: `${v.title.en} ${v.title.fa} ${v.genre.join(' ')}`,
        sample: false,
        link: localizedPath(`/watch/${v.slug}/`, language),
        isNew: v.isNew,
        isTrending: v.isTrending,
        access: v.accessType,
      })),
    [movies, series, language],
  );

  const sampleCards: Card[] = useMemo(
    () =>
      entertainmentSamples.map((sample) => ({
        key: sample.id,
        kind: sample.kind,
        title: sample.title[language],
        category: sample.category[language],
        summary: sample.summary[language],
        image: sample.image,
        imageAlt: sample.imageAlt[language],
        search: `${sample.title[language]} ${sample.category[language]} ${sample.searchTerms[language]}`,
        sample: true,
      })),
    [language],
  );

  // "Live" only when at least one list truly came from the server — mock
  // fallback samples must never be presented as real data.
  const live = (moviesLive || seriesLive) && realCards.length > 0;
  const cards = live ? realCards : sampleCards;

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase(language === 'fa' ? 'fa' : 'en');
    return cards.filter((card) => {
      const matchesType = filter === 'all' || card.kind === filter;
      const matchesQuery = !search || `${card.title} ${card.category} ${card.search}`
        .toLocaleLowerCase(language === 'fa' ? 'fa' : 'en').includes(search);
      return matchesType && matchesQuery;
    });
  }, [cards, filter, language, query]);

  return (
    <section id="entertainment" className="section section--ink section-anchor" aria-labelledby="entertainment-title">
      <div className="site-container">
        <div className="entertainment-heading">
          <SectionHeading titleId="entertainment-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} light />
          <div className="entertainment-controls">
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <span className="visually-hidden">{copy.searchLabel}</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} />
            </label>
            <div className="filter-row" role="group" aria-label={copy.searchLabel}>
              {([
                ['all', copy.all], ['film', copy.films], ['series', copy.series],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" className={`filter-button ${filter === value ? 'is-active' : ''}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!live && (
          <div className="sample-listing-note"><span className="sample-listing-note__mark" aria-hidden="true">i</span>{copy.titleNote}</div>
        )}
        {filtered.length > 0 ? (
          <div className="entertainment-grid">
            {filtered.map((card) => {
              const KindIcon = card.kind === 'film' ? Film : Tv;
              const body = (
                <>
                  <div className="entertainment-card__art-wrap">
                    <img className="entertainment-card__art" src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" width="480" height="424" />
                    {card.sample ? (
                      <span className="sample-badge"><KindIcon size={13} aria-hidden="true" />{copy.sample}</span>
                    ) : (
                      <span className="sample-badge" style={{ background: card.access === 'free' ? 'rgba(22,163,74,.92)' : 'rgba(40,89,168,.92)' }}>
                        <KindIcon size={13} aria-hidden="true" />
                        {card.access === 'free' ? (language === 'fa' ? 'رایگان' : 'Free') : (language === 'fa' ? 'اشتراکی' : 'Sub')}
                      </span>
                    )}
                  </div>
                  <div className="entertainment-card__body">
                    <p className="entertainment-card__category">{card.category}</p>
                    <h3>{card.title}</h3>
                    <p>{card.summary}</p>
                    {card.sample && <span className="entertainment-card__note">{copy.cardNote}</span>}
                  </div>
                </>
              );
              return card.link ? (
                <Link className="entertainment-card" key={card.key} to={card.link} style={{ textDecoration: 'none' }}>
                  {body}
                </Link>
              ) : (
                <article className="entertainment-card" key={card.key}>
                  {body}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-state" role="status">{copy.noResults}</p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
          <Link
            to={localizedPath('/movies/', language)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            <Film size={15} aria-hidden="true" />{t.common.browse} · {t.nav.movies}<ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link
            to={localizedPath('/series/', language)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            <Tv size={15} aria-hidden="true" />{t.common.browse} · {t.nav.series}<ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
