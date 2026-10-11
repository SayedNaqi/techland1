import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { platformCopy } from '@/constants/platformCopy';
import { scholarships } from '@/data/opportunities';
import { filterOpportunities } from '@/lib/filterOpportunities';
import type { OpportunityFilters } from '@/lib/filterOpportunities';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { DemoDataNotice } from '@/components/opportunities/LegalNotices';

const emptyFilters = (): OpportunityFilters => ({ query: '', country: '', organization: '', degreeLevel: '', field: '', fundingType: '' });

export default function EligibilityPage() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const [filters, setFilters] = useState<OpportunityFilters>(emptyFilters);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { setFilters(emptyFilters()); setSubmitted(false); }, [language]);
  const countryOptions = [...new Set(scholarships.map((item) => item.country[language]))];
  const levelOptions = [...new Set(scholarships.map((item) => item.degreeLevel[language]))];
  const fieldOptions = [...new Set(scholarships.map((item) => item.field[language]))];
  const fundingOptions = [...new Set(scholarships.map((item) => item.fundingType[language]))];
  const results = useMemo(() => filterOpportunities(scholarships, filters), [filters]);
  const change = (key: keyof OpportunityFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container"><p className="pathway-eyebrow">{copy.nav.scholarships}</p><h1>{copy.eligibility.title}</h1><p>{copy.eligibility.description}</p><DemoDataNotice /></div></section>
    <section className="pathway-section"><div className="pathway-container quick-match-layout">
      <form className="quick-match-form" onSubmit={submit}><h2>{copy.eligibility.title}</h2><p>{copy.eligibility.privacy}</p>
        <label className="pathway-field"><span>{copy.eligibility.studyLevel}</span><select value={filters.degreeLevel} onChange={(event) => change('degreeLevel', event.target.value)}><option value="">{copy.directory.all}</option>{levelOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="pathway-field"><span>{copy.eligibility.country}</span><select value={filters.country} onChange={(event) => change('country', event.target.value)}><option value="">{copy.directory.all}</option>{countryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="pathway-field"><span>{copy.eligibility.field}</span><select value={filters.field} onChange={(event) => change('field', event.target.value)}><option value="">{copy.directory.all}</option>{fieldOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="pathway-field"><span>{copy.eligibility.funding}</span><select value={filters.fundingType} onChange={(event) => change('fundingType', event.target.value)}><option value="">{copy.directory.all}</option>{fundingOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <button className="pathway-button" type="submit">{copy.eligibility.submit}</button>
      </form>
      <aside className="quick-match-note"><h2>{copy.common.disclaimerHeading}</h2><p>{copy.eligibility.notice}</p><p>{copy.common.sourceMissing}</p><p>{copy.common.privacy}</p></aside>
    </div></section>
    {submitted && <section className="pathway-section pathway-section--tint"><div className="pathway-container"><h2>{copy.eligibility.matches}</h2>{results.length ? <div className="opp-grid">{results.map((record) => <OpportunityCard key={record.id} record={record} />)}</div> : <p className="pathway-empty">{copy.eligibility.noMatches}</p>}<p className="quick-match-note">{copy.eligibility.notice}</p></div></section>}
  </div>;
}
