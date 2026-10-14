import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpenText } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import { guides } from '@/data/guides';
import { DemoDataNotice, OpportunityLegalNotice } from '@/components/opportunities/LegalNotices';

export default function GuideDetailPage({ slug }: { slug?: string }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return <div className="pathway-container pathway-not-found"><h1>{copy.common.notFound}</h1><Link to={localizedPath('/visa/', language)}>{copy.common.goHome}</Link></div>;
  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container"><Link className="back-link" to={localizedPath('/visa/', language)}><ArrowLeft size={16} aria-hidden="true" />{copy.common.back}</Link><p className="pathway-eyebrow">{guide.category[language]}</p><h1>{guide.title[language]}</h1><p>{guide.description[language]}</p><div className="guide-detail-meta"><span><BookOpenText size={16} aria-hidden="true" />{guide.readTimeMinutes} {copy.common.read}</span><span>{copy.guides.author}: {guide.author[language]}</span><span>{copy.guides.date}: {guide.publicationDate ?? copy.guides.dateUnset}</span></div><DemoDataNotice /></div></section>
    <section className="pathway-section"><div className="pathway-container article-layout"><article className="guide-article">{guide.sections.map((section) => <section key={section.heading.en}><h2>{section.heading[language]}</h2><p>{section.body[language]}</p></section>)}</article><OpportunityLegalNotice compact /></div></section>
  </div>;
}
