import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { opportunityRecords } from '@/data/opportunities';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import type { OpportunityKind, OpportunityRecord } from '@/types/opportunity';
import OpportunityCard from '@/components/opportunities/OpportunityCard';

const PAGE_SIZE = 2;
type FilterKey = 'country' | 'organization' | 'degreeLevel' | 'field' | 'fundingType' | 'eligibleNationalities' | 'languageRequirements' | 'ieltsMinimum' | 'ageRequirement' | 'deadline' | 'applicationFee';

export default function DirectoryPage({ kind }: { kind: OpportunityKind }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const location = useLocation();
  const previousLanguage = useRef(language);
  const records = useMemo(() => opportunityRecords.filter((record) => record.kind === kind), [kind]);
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') ?? '');
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ country: '', organization: '', degreeLevel: '', field: '', fundingType: '', eligibleNationalities: '', languageRequirements: '', ieltsMinimum: '', ageRequirement: '', deadline: '', applicationFee: '' });
  const [sort, setSort] = useState<'relevance' | 'title' | 'deadline'>('relevance');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') ?? '');
    setPage(1);
  }, [location.search]);

  useEffect(() => {
    if (previousLanguage.current === language) return;
    previousLanguage.current = language;
    setFilters({ country: '', organization: '', degreeLevel: '', field: '', fundingType: '', eligibleNationalities: '', languageRequirements: '', ieltsMinimum: '', ageRequirement: '', deadline: '', applicationFee: '' });
    setSort('relevance');
    setPage(1);
  }, [language]);

  const fields: Array<{ key: FilterKey; label: string; values: Array<{ value: string; label: string }> }> = [
    { key: 'country', label: copy.directory.country, values: [...new Set(records.map((record) => record.country[language]))].map((label) => ({ value: label, label })) },
    { key: 'organization', label: copy.directory.university, values: [...new Set(records.map((record) => record.organization[language]))].map((label) => ({ value: label, label })) },
    { key: 'degreeLevel', label: copy.directory.degree, values: [...new Set(records.map((record) => record.degreeLevel[language]))].map((label) => ({ value: label, label })) },
    { key: 'field', label: copy.directory.field, values: [...new Set(records.map((record) => record.field[language]))].map((label) => ({ value: label, label })) },
    { key: 'fundingType', label: copy.directory.funding, values: [...new Set(records.map((record) => record.fundingType[language]))].map((label) => ({ value: label, label })) },
    { key: 'eligibleNationalities', label: copy.directory.nationality, values: [{ value: 'not-provided', label: copy.common.notProvided }] },
    { key: 'languageRequirements', label: copy.directory.language, values: [{ value: 'not-provided', label: copy.common.notProvided }] },
    { key: 'ieltsMinimum', label: copy.directory.ielts, values: [{ value: 'not-provided', label: copy.common.notProvided }] },
    { key: 'ageRequirement', label: copy.directory.age, values: [{ value: 'not-provided', label: copy.common.notProvided }] },
    { key: 'deadline', label: copy.directory.deadline, values: [{ value: 'not-provided', label: copy.common.notProvided }] },
    { key: 'applicationFee', label: copy.directory.fee, values: [{ value: 'not-provided', label: copy.common.notProvided }] },
  ];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language === 'fa' ? 'fa' : 'en');
    const matches = records.filter((record) => {
      const searchable = [...Object.values(record.title), ...Object.values(record.organization), ...Object.values(record.country), ...Object.values(record.field), ...Object.values(record.degreeLevel), ...Object.values(record.description), ...Object.values(record.details.searchTerms)].join(' ').toLocaleLowerCase(language === 'fa' ? 'fa' : 'en');
      if (normalized && !searchable.includes(normalized)) return false;
      return Object.entries(filters).every(([rawKey, selected]) => {
        if (!selected) return true;
        const key = rawKey as FilterKey;
        const value = record[key as keyof OpportunityRecord];
        if (selected === 'not-provided') return value === null;
        if (value && typeof value === 'object' && 'en' in value) return value[language] === selected;
        return String(value ?? '') === selected;
      });
    });
    if (sort === 'title') matches.sort((a, b) => a.title[language].localeCompare(b.title[language]));
    if (sort === 'deadline') matches.sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'));
    return matches;
  }, [records, query, filters, sort, language]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const title = kind === 'scholarship' ? copy.directory.scholarshipTitle : copy.directory.humanitarianTitle;
  const description = kind === 'scholarship' ? copy.directory.scholarshipDesc : copy.directory.humanitarianDesc;

  function updateFilter(key: FilterKey, value: string) { setFilters((current) => ({ ...current, [key]: value })); setPage(1); }
  function clearFilters() { setQuery(''); setFilters({ country: '', organization: '', degreeLevel: '', field: '', fundingType: '', eligibleNationalities: '', languageRequirements: '', ieltsMinimum: '', ageRequirement: '', deadline: '', applicationFee: '' }); setSort('relevance'); setPage(1); }

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p className="pathway-eyebrow">{kind === 'scholarship' ? copy.nav.scholarships : copy.nav.humanitarian}</p>
          <h1>{title}</h1><p>{description}</p>
          <p className="pathway-demo-callout"><strong>{copy.common.demo}</strong> {copy.common.dataNotice}</p>
        </div>
      </section>
      <section className="pathway-section"><div className="pathway-container directory-layout">
        <aside className="directory-filters" aria-labelledby="filters-title">
          <div className="directory-filters__head"><h2 id="filters-title"><SlidersHorizontal size={18} aria-hidden="true" />{copy.directory.filters}</h2><button type="button" onClick={clearFilters}>{copy.common.clear}</button></div>
          <label className="pathway-field"><span>{copy.common.search}</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={copy.directory.searchPlaceholder} /></label>
          {fields.map(({ key, label, values }) => <label className="pathway-field" key={key}><span>{label}</span><select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}><option value="">{copy.directory.all}</option>{values.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>)}
          <label className="pathway-field"><span>{copy.directory.sort}</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="relevance">{copy.directory.sortRelevance}</option><option value="title">{copy.directory.sortTitle}</option><option value="deadline">{copy.directory.sortDeadline}</option></select></label>
          <p className="directory-local-note">{copy.common.savedLocal}</p>
        </aside>
        <div className="directory-results">
          <div className="directory-results__heading"><p><strong>{filtered.length}</strong> {copy.directory.results}</p><Link to={localizedPath('/compare/', language)}>{copy.common.comparison}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
          {visible.length ? <div className="opp-grid">{visible.map((record: OpportunityRecord) => <OpportunityCard key={record.id} record={record} />)}</div> : <div className="pathway-empty"><h2>{copy.common.noResults}</h2><button className="pathway-button pathway-button--secondary" type="button" onClick={clearFilters}>{copy.common.reset}</button></div>}
          {pageCount > 1 && <nav className="pagination" aria-label={`${copy.directory.page} ${currentPage} ${copy.directory.of} ${pageCount}`}><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{copy.directory.previous}</button><span>{copy.directory.page} {currentPage} {copy.directory.of} {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>{copy.directory.next}</button></nav>}
        </div>
      </div></section>
    </div>
  );
}
