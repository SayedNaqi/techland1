import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BadgeInfo, ExternalLink } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import type { OpportunityRecord } from '@/types/opportunity';

export default function OpportunityDetailPage({ record }: { record?: OpportunityRecord }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  if (!record) return <div className="pathway-container pathway-not-found"><h1>{copy.common.notFound}</h1><Link to={localizedPath('/', language)}>{copy.common.goHome}</Link></div>;
  const scholarshipSections = [
    ['about', record.details.about[language]], ['funding', record.details.funding[language]],
    ['eligibleCountries', record.details.eligibleCountries[language]], ['academicRequirements', record.details.academicRequirements[language]],
    ['languageRequirements', record.details.languageRequirements[language]], ['ageRequirements', record.details.ageRequirements[language]],
    ['requiredDocuments', record.details.requiredDocuments[language]], ['applicationProcess', record.details.applicationProcess[language]],
    ['importantDates', record.details.importantDates[language]], ['selectionProcess', record.details.selectionProcess[language]],
  ] as const;
  const humanitarianSections = [
    [copy.humanitarian.whoMay, copy.common.notProvided], [copy.humanitarian.whoNot, copy.common.notProvided],
    [copy.humanitarian.works, record.details.applicationProcess[language]], [copy.detail.documents, record.details.requiredDocuments[language]],
    [copy.humanitarian.processing, copy.common.notProvided], [copy.humanitarian.authority, copy.common.notProvided],
    [copy.detail.source, copy.common.sourceMissing], [copy.detail.verified, copy.common.notVerified],
    [copy.humanitarian.notes, copy.common.notProvided],
  ] as const;
  const sections = record.kind === 'scholarship' ? scholarshipSections : humanitarianSections;
  const base = record.kind === 'scholarship' ? '/scholarships/' : '/humanitarian/';
  const canApply = record.status === 'published' && Boolean(record.officialSourceUrl && record.verifiedAt);

  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container">
      <Link className="back-link" to={localizedPath(base, language)}><ArrowLeft size={16} aria-hidden="true" />{copy.common.back} · {record.kind === 'scholarship' ? copy.nav.scholarships : copy.nav.humanitarian}</Link>
      <p className="pathway-eyebrow">{record.kind === 'scholarship' ? copy.nav.scholarships : copy.nav.humanitarian}</p>
      <h1>{record.title[language]}</h1><p>{record.description[language]}</p>
      <div className="detail-badges"><span className="opp-badge opp-badge--demo">{copy.common.demo}</span><span className="opp-badge opp-badge--neutral">{copy.common.notVerified}</span></div>
    </div></section>
    <section className="pathway-section"><div className="pathway-container detail-layout">
      <article className="detail-main">
        <section className="detail-panel"><h2>{copy.detail.overview}</h2><p>{record.eligibilitySummary[language]}</p><dl className="detail-facts"><div><dt>{copy.directory.country}</dt><dd>{record.country[language]}</dd></div><div><dt>{copy.directory.university}</dt><dd>{record.organization[language]}</dd></div><div><dt>{copy.directory.degree}</dt><dd>{record.degreeLevel[language]}</dd></div><div><dt>{copy.directory.deadline}</dt><dd>{record.deadline ?? copy.common.notProvided}</dd></div></dl></section>
        {sections.map(([key, content]) => {
          const heading = key in copy.detail ? copy.detail[key as keyof typeof copy.detail] : key;
          return <section className="detail-panel" key={key}><h2>{heading}</h2><p>{content}</p></section>;
        })}
        <section className="detail-panel"><h2>{copy.detail.faqs}</h2><details><summary>{language === 'fa' ? 'آیا این فرصت واقعی است؟' : 'Is this a real opportunity?'}</summary><p>{record.details.faqs[language]}</p></details></section>
        <section className="detail-panel detail-source"><h2>{copy.detail.source}</h2>
          {record.officialSourceUrl && canApply ? <a href={record.officialSourceUrl} target="_blank" rel="noreferrer">{record.officialSourceName ?? copy.common.official}<ExternalLink size={15} aria-hidden="true" /></a> : <p>{copy.detail.noSource}</p>}
          <p><strong>{copy.detail.verified}:</strong> {record.verifiedAt ?? copy.common.notVerified}</p>
          {canApply ? <a className="pathway-button" href={record.officialSourceUrl ?? '#'} target="_blank" rel="noreferrer">{copy.common.applyOfficial}<ArrowUpRight size={16} aria-hidden="true" /></a> : <p className="detail-muted">{copy.detail.noApply}</p>}
        </section>
      </article>
      <aside className="detail-aside"><div className="detail-warning"><BadgeInfo size={21} aria-hidden="true" /><h2>{copy.common.disclaimerHeading}</h2><p>{record.kind === 'humanitarian' ? copy.humanitarian.notLegal : copy.common.dataNotice}</p><p>{copy.common.verifyBefore}</p></div><p className="detail-notice">{copy.common.decisionNotice}</p><p className="detail-notice">{copy.common.genericGuidance}</p></aside>
    </div></section>
  </div>;
}
