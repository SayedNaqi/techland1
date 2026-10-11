import type { OpportunityRecord } from '@/types/opportunity';

export interface OpportunityFilters {
  query: string;
  country: string;
  organization: string;
  degreeLevel: string;
  field: string;
  fundingType: string;
}

export function filterOpportunities(records: OpportunityRecord[], filters: OpportunityFilters): OpportunityRecord[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const searchable = [
      ...Object.values(record.title), ...Object.values(record.organization), ...Object.values(record.country),
      ...Object.values(record.degreeLevel), ...Object.values(record.field), ...Object.values(record.fundingType),
      ...Object.values(record.description), ...Object.values(record.details.searchTerms),
    ].join(' ').toLocaleLowerCase();
    if (query && !searchable.includes(query)) return false;
    return (!filters.country || filters.country === record.country.en || filters.country === record.country.fa)
      && (!filters.organization || filters.organization === record.organization.en || filters.organization === record.organization.fa)
      && (!filters.degreeLevel || filters.degreeLevel === record.degreeLevel.en || filters.degreeLevel === record.degreeLevel.fa)
      && (!filters.field || filters.field === record.field.en || filters.field === record.field.fa)
      && (!filters.fundingType || filters.fundingType === record.fundingType.en || filters.fundingType === record.fundingType.fa);
  });
}
