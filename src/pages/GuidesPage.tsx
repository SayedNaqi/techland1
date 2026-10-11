import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpenText } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { guides } from '@/data/guides';
import { DemoDataNotice } from '@/components/opportunities/LegalNotices';

export default function GuidesPage() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => [...new Set(guides.map((guide) => guide.category[language]))], [language]);
  const filtered = category === 'all' ? guides : guides.filter((guide) => guide.category[language] === category);
  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container"><p className="pathway-eyebrow">{copy.nav.guides}</p><h1>{copy.guides.title}</h1><p>{copy.guides.description}</p><DemoDataNotice /></div></section>
    <section className="pathway-section"><div className="pathway-container">
      <div className="guide-filters"><button type="button" className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}>{copy.guides.all}</button>{categories.map((item) => <button type="button" className={category === item ? 'is-active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="guide-grid">{filtered.map((guide) => <article className="guide-card" key={guide.slug}><span className="guide-card__icon"><BookOpenText size={21} aria-hidden="true" /></span><p className="pathway-eyebrow">{guide.category[language]}</p><h2>{guide.title[language]}</h2><p>{guide.description[language]}</p><dl className="guide-meta"><div><dt>{copy.guides.author}</dt><dd>{guide.author[language]}</dd></div><div><dt>{copy.guides.date}</dt><dd>{guide.publicationDate ?? copy.guides.dateUnset}</dd></div><div><dt>{copy.common.read}</dt><dd>{guide.readTimeMinutes}</dd></div></dl><Link className="opp-link" to={localizedPath(`/guides/${guide.slug}/`, language)}>{copy.common.learn}<ArrowUpRight size={16} aria-hidden="true" /></Link></article>)}</div>
    </div></section>
  </div>;
}
