import { guides } from '@/data/guides';
import { humanitarianPrograms, scholarships } from '@/data/opportunities';
import { visaTopics } from '@/data/visaTopics';
import type { OpportunityKind, OpportunityRecord } from '@/types/opportunity';

export interface OpportunityRepository {
  list(kind?: OpportunityKind): Promise<OpportunityRecord[]>;
  getBySlug(kind: OpportunityKind, slug: string): Promise<OpportunityRecord | undefined>;
}

export const demoRepository: OpportunityRepository = {
  async list(kind) {
    const records = [...scholarships, ...humanitarianPrograms];
    return kind ? records.filter((record) => record.kind === kind) : records;
  },
  async getBySlug(kind, slug) {
    return [...scholarships, ...humanitarianPrograms].find((record) => record.kind === kind && record.slug === slug);
  },
};

function opportunitySearchTerms(record: OpportunityRecord) {
  return {
    en: [record.title.en, record.organization.en, record.country.en, record.degreeLevel.en, record.field.en, record.fundingType.en, record.eligibilitySummary.en, record.details.searchTerms.en].join(' '),
    fa: [record.title.fa, record.organization.fa, record.country.fa, record.degreeLevel.fa, record.field.fa, record.fundingType.fa, record.eligibilitySummary.fa, record.details.searchTerms.fa].join(' '),
  };
}

export const searchIndex = [
  ...[...scholarships, ...humanitarianPrograms].map((item) => ({
    title: item.title,
    description: item.description,
    terms: opportunitySearchTerms(item),
    href: `/${item.kind === 'scholarship' ? 'scholarships' : 'humanitarian'}/${item.slug}/`,
    type: item.kind,
  })),
  ...guides.map((guide) => ({ title: guide.title, description: guide.description, terms: guide.searchTerms, href: `/guides/${guide.slug}/`, type: 'guide' as const })),
  ...visaTopics.map((topic) => ({
    title: topic.title,
    description: topic.purpose,
    terms: { en: `${topic.title.en} ${topic.generalRequirements.en} ${topic.typicalDocuments.en}`, fa: `${topic.title.fa} ${topic.generalRequirements.fa} ${topic.typicalDocuments.fa}` },
    href: '/visa/',
    type: 'visa' as const,
  })),
  { title: { en: 'Scholarship scam alert', fa: 'هشدار کلاهبرداری بورسیه' }, description: { en: 'Check warning signs before you pay or share information', fa: 'پیش از پرداخت یا شریک‌سازی اطلاعات نشانه‌های هشدار را بررسی کنید' }, terms: { en: 'scam fraud fake guarantee fee agent', fa: 'کلاهبرداری تقلب تضمین هزینه نماینده' }, href: '/scam-alert/', type: 'guide' as const },
];
