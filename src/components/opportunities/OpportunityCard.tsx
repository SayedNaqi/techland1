import { ArrowUpRight, Bookmark, GitCompareArrows } from 'lucide-react';
import { Link } from 'react-router-dom';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import type { OpportunityRecord } from '@/types/opportunity';

export default function OpportunityCard({ record }: { record: OpportunityRecord }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const { savedIds, comparedIds, toggleSaved, toggleCompared } = useSavedOpportunities();
  const detailPath = `/${record.kind === 'scholarship' ? 'scholarships' : 'humanitarian'}/${record.slug}/`;
  const isSaved = savedIds.includes(record.id);
  const isCompared = comparedIds.includes(record.id);

  return (
    <article className="opp-card">
      <div className="opp-card__topline"><span className="opp-badge opp-badge--demo">{copy.common.demo}</span><span className="opp-card__kind">{record.kind === 'scholarship' ? copy.nav.scholarships : copy.nav.humanitarian}</span></div>
      <h3 className="opp-card__title"><Link to={localizedPath(detailPath, language)}>{record.title[language]}</Link></h3>
      <p className="opp-card__summary">{record.description[language]}</p>
      <dl className="opp-card__facts">
        <div><dt>{copy.directory.country}</dt><dd>{record.country[language]}</dd></div>
        <div><dt>{copy.directory.university}</dt><dd>{record.organization[language]}</dd></div>
        <div><dt>{copy.directory.degree}</dt><dd>{record.degreeLevel[language]}</dd></div>
        <div><dt>{copy.directory.funding}</dt><dd>{record.fundingType[language]}</dd></div>
        <div><dt>{copy.detail.eligibility}</dt><dd>{record.eligibilitySummary[language]}</dd></div>
        <div><dt>{copy.directory.deadline}</dt><dd>{record.deadline ?? copy.common.notProvided}</dd></div>
      </dl>
      <p className="opp-card__source"><span className="opp-source-dot" aria-hidden="true" />{record.officialSourceUrl && record.verifiedAt ? copy.common.official : copy.common.sourceMissing}</p>
      <div className="opp-card__actions">
        <Link className="opp-link" to={localizedPath(detailPath, language)}>{copy.common.details}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button className={`opp-icon-button ${isSaved ? 'is-active' : ''}`} type="button" aria-pressed={isSaved} onClick={() => toggleSaved(record.id)} aria-label={`${isSaved ? copy.common.removeSaved : copy.common.save}: ${record.title[language]}`}><Bookmark size={17} aria-hidden="true" />{isSaved ? copy.common.saved : copy.common.save}</button>
        <button className={`opp-icon-button ${isCompared ? 'is-active' : ''}`} type="button" aria-pressed={isCompared} disabled={!isCompared && comparedIds.length >= 4} onClick={() => toggleCompared(record.id)} aria-label={`${isCompared ? copy.common.removeCompare : copy.common.compare}: ${record.title[language]}`}><GitCompareArrows size={17} aria-hidden="true" />{isCompared ? copy.common.removeCompare : copy.common.compare}</button>
      </div>
    </article>
  );
}
