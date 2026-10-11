import { useMemo, useState } from 'react';
import { Film, Search, Tv } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { entertainmentSamples, type SampleKind } from '@/data/brand';
import { useLanguage } from '@/hooks/useLanguage';

export default function EntertainmentSection() {
  const { brand, language } = useLanguage();
  const copy = brand.entertainment;
  const [filter, setFilter] = useState<'all' | SampleKind>('all');
  const [query, setQuery] = useState('');
  const filteredSamples = useMemo(() => {
    const search = query.trim().toLocaleLowerCase(language === 'fa' ? 'fa' : 'en');
    return entertainmentSamples.filter((sample) => {
      const matchesType = filter === 'all' || sample.kind === filter;
      const matchesQuery = !search || `${sample.title[language]} ${sample.category[language]} ${sample.searchTerms[language]}`
        .toLocaleLowerCase(language === 'fa' ? 'fa' : 'en').includes(search);
      return matchesType && matchesQuery;
    });
  }, [filter, language, query]);

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
        <div className="sample-listing-note"><span className="sample-listing-note__mark" aria-hidden="true">i</span>{copy.titleNote}</div>
        {filteredSamples.length > 0 ? (
          <div className="entertainment-grid">
            {filteredSamples.map((sample) => {
              const KindIcon = sample.kind === 'film' ? Film : Tv;
              return (
                <article className="entertainment-card" key={sample.id}>
                  <div className="entertainment-card__art-wrap">
                    <img className="entertainment-card__art" src={sample.image} alt={sample.imageAlt[language]} loading="lazy" decoding="async" width="480" height="424" />
                    <span className="sample-badge"><KindIcon size={13} aria-hidden="true" />{copy.sample}</span>
                  </div>
                  <div className="entertainment-card__body">
                    <p className="entertainment-card__category">{sample.category[language]}</p>
                    <h3>{sample.title[language]}</h3>
                    <p>{sample.summary[language]}</p>
                    <span className="entertainment-card__note">{copy.cardNote}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-state" role="status">{copy.noResults}</p>
        )}
      </div>
    </section>
  );
}
