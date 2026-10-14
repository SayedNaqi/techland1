import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgeInfo, BookOpenText, ChevronDown, ExternalLink, ShieldAlert } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import { visaTopics } from '@/data/visaTopics';
import { guides } from '@/data/guides';
import { OpportunityLegalNotice } from '@/components/opportunities/LegalNotices';

export default function VisaPage() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container"><p className="pathway-eyebrow">{copy.nav.visa}</p><h1>{copy.visa.title}</h1><p>{copy.visa.description}</p><aside className="visa-warning" role="note"><ShieldAlert size={21} aria-hidden="true" /><p>{copy.visa.warning}</p></aside></div></section>
    <section className="pathway-section"><div className="pathway-container">
      <div className="visa-topic-grid">{visaTopics.map((topic) => <details className="visa-topic" key={topic.slug}><summary><span><strong>{topic.title[language]}</strong><small>{copy.visa.purpose}</small></span><ChevronDown size={18} aria-hidden="true" /></summary><div className="visa-topic__body"><section><h3>{copy.visa.purpose}</h3><p>{topic.purpose[language]}</p></section><section><h3>{copy.visa.requirements}</h3><p>{topic.generalRequirements[language]}</p></section><section><h3>{copy.visa.documents}</h3><p>{topic.typicalDocuments[language]}</p></section><section><h3>{copy.visa.process}</h3><p>{topic.process[language]}</p></section><section className="visa-source"><h3>{copy.visa.official}</h3><p>{copy.common.sourceMissing} <ExternalLink size={14} aria-hidden="true" /></p></section></div></details>)}</div>
      <div className="visa-info-note"><BadgeInfo size={20} aria-hidden="true" /><p>{copy.visa.legal}</p></div><OpportunityLegalNotice compact />
      <div className="pathway-section__head" style={{ marginTop: 34 }}><div><p className="pathway-eyebrow">{copy.nav.guides}</p><h2 style={{ margin: 0 }}>{copy.guides.title}</h2><p>{copy.guides.description}</p></div></div>
      <div className="guide-grid">{guides.map((guide) => <article className="guide-card" key={guide.slug}><span className="guide-card__icon"><BookOpenText size={21} aria-hidden="true" /></span><p className="pathway-eyebrow">{guide.category[language]}</p><h2>{guide.title[language]}</h2><p>{guide.description[language]}</p><Link className="opp-link" to={localizedPath(`/guides/${guide.slug}/`, language)}>{copy.common.learn}<ArrowUpRight size={16} aria-hidden="true" /></Link></article>)}</div>
    </div></section>
  </div>;
}
