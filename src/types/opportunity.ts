import type { Language } from '@/types';

export type OpportunityKind = 'scholarship' | 'humanitarian';
export type OpportunityStatus = 'demo' | 'published' | 'expired';
export interface LocalizedText { en: string; fa: string }
export type OpportunityDetailKey =
  | 'overview' | 'about' | 'funding' | 'eligibility' | 'eligibleCountries'
  | 'academicRequirements' | 'languageRequirements' | 'ageRequirements'
  | 'requiredDocuments' | 'applicationProcess' | 'importantDates'
  | 'selectionProcess' | 'faqs' | 'officialSource' | 'lastVerified' | 'disclaimer';

export interface OpportunityRecord {
  id: string;
  slug: string;
  kind: OpportunityKind;
  status: OpportunityStatus;
  title: LocalizedText;
  organization: LocalizedText;
  country: LocalizedText;
  degreeLevel: LocalizedText;
  field: LocalizedText;
  fundingType: LocalizedText;
  description: LocalizedText;
  eligibilitySummary: LocalizedText;
  eligibleNationalities: LocalizedText | null;
  languageRequirements: LocalizedText | null;
  ieltsMinimum: number | null;
  ageRequirement: LocalizedText | null;
  applicationFee: LocalizedText | null;
  deadline: string | null;
  officialSourceName: string | null;
  officialSourceUrl: string | null;
  verifiedAt: string | null;
  details: Record<Exclude<OpportunityDetailKey, 'overview' | 'eligibility' | 'officialSource' | 'lastVerified' | 'disclaimer'>, LocalizedText> & { searchTerms: LocalizedText };
}

export interface GuideRecord {
  slug: string;
  category: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  readTimeMinutes: number;
  publicationDate: string | null;
  author: LocalizedText;
  searchTerms: LocalizedText;
  sections: Array<{ heading: LocalizedText; body: LocalizedText }>;
}

export interface VisaTopic {
  slug: string;
  title: LocalizedText;
  purpose: LocalizedText;
  generalRequirements: LocalizedText;
  typicalDocuments: LocalizedText;
  process: LocalizedText;
}

export interface RouteInfo {
  language: Language;
  basePath: string;
  page:
    | 'home' | 'scholarships' | 'scholarship-detail' | 'humanitarian'
    | 'humanitarian-detail' | 'visa' | 'eligibility' | 'guides'
    | 'guide-detail' | 'scam-alert' | 'compare' | 'services'
    | 'contact' | 'admin' | 'payment' | 'movies' | 'series'
    | 'video-detail' | 'not-found';
  slug?: string;
}
