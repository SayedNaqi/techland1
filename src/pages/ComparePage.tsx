import { Link } from 'react-router-dom';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { opportunityRecords } from '@/data/opportunities';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import OpportunityCard from '@/components/opportunities/OpportunityCard';

export default function ComparePage() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const { savedIds, comparedIds, clearCompared } = useSavedOpportunities();
  const savedRecords = savedIds.map((id) => opportunityRecords.find((record) => record.id === id)).filter((record) => record !== undefined);
  const records = comparedIds.map((id) => opportunityRecords.find((record) => record.id === id)).filter((record) => record !== undefined);
  const fields = [
    { label: copy.compare.kind, value: (record: typeof records[number]) => record.kind === 'scholarship' ? copy.nav.scholarships : copy.nav.humanitarian },
    { label: copy.compare.organization, value: (record: typeof records[number]) => record.organization[language] },
    { label: copy.compare.country, value: (record: typeof records[number]) => record.country[language] },
    { label: copy.compare.level, value: (record: typeof records[number]) => record.degreeLevel[language] },
    { label: copy.compare.funding, value: (record: typeof records[number]) => record.fundingType[language] },
    { label: copy.compare.deadline, value: (record: typeof records[number]) => record.deadline ?? copy.common.notProvided },
    { label: copy.compare.source, value: (record: typeof records[number]) => record.officialSourceUrl ?? copy.common.sourceMissing },
    { label: copy.compare.verification, value: (record: typeof records[number]) => record.verifiedAt ?? copy.common.notVerified },
  ];
  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container"><p className="pathway-eyebrow">{copy.nav.saved}</p><h1>{copy.compare.title}</h1><p>{copy.compare.description}</p></div></section>
    <section className="pathway-section pathway-section--tint"><div className="pathway-container"><div className="pathway-section__head"><div><p className="pathway-eyebrow">{copy.nav.saved}</p><h2>{copy.common.saved}</h2></div></div>{savedRecords.length ? <div className="opp-grid">{savedRecords.map((record) => <OpportunityCard key={record.id} record={record} />)}</div> : <p className="pathway-empty">{language === 'fa' ? 'هنوز نمونه‌ای را در این دستگاه ذخیره نکرده‌اید.' : 'No sample opportunities are saved on this device yet.'}</p>}</div></section>
    <section className="pathway-section"><div className="pathway-container">
      {records.length === 0 ? <div className="pathway-empty"><h2>{copy.compare.empty}</h2><Link className="pathway-button" to={localizedPath('/scholarships/', language)}>{copy.common.browse}<ArrowUpRight size={16} aria-hidden="true" /></Link></div> : <>
        <p className="directory-local-note">{copy.common.savedLocal}</p>
        <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>{copy.compare.field}</th>{records.map((record) => <th key={record.id}><Link to={localizedPath(`/${record.kind === 'scholarship' ? 'scholarships' : 'humanitarian'}/${record.slug}/`, language)}>{record.title[language]}<ArrowUpRight size={14} aria-hidden="true" /></Link></th>)}</tr></thead><tbody>{fields.map((field) => <tr key={field.label}><th scope="row">{field.label}</th>{records.map((record) => <td key={record.id}>{field.value(record)}</td>)}</tr>)}</tbody></table></div>
        <button className="pathway-button pathway-button--secondary" type="button" onClick={clearCompared}><Trash2 size={16} aria-hidden="true" />{copy.compare.clear}</button>
      </>}
    </div></section>
  </div>;
}
