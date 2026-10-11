import type { Language } from '@/types';

export type SampleKind = 'film' | 'series';

export interface EntertainmentSample {
  id: string;
  kind: SampleKind;
  title: Record<Language, string>;
  category: Record<Language, string>;
  summary: Record<Language, string>;
  image: string;
  imageAlt: Record<Language, string>;
  searchTerms: Record<Language, string>;
}

export const entertainmentSamples: EntertainmentSample[] = [
  {
    id: 'blue-meridian',
    kind: 'film',
    title: { en: 'The Blue Meridian', fa: 'مدار آبی' },
    category: { en: 'Science fiction · Sample film', fa: 'داستان علمی‌خیالی · فیلم نمونه' },
    summary: {
      en: 'A fictional sample about a quiet signal at the edge of a distant horizon.',
      fa: 'نمونه‌ای خیالی درباره یک پیام آرام در افق دوردست.',
    },
    image: '/assets/sample-blue-meridian-v2.svg',
    imageAlt: { en: 'Original fictional coastal observatory artwork', fa: 'اثر هنری اصلی و خیالی از رصدخانه ساحلی' },
    searchTerms: { en: 'blue meridian science fiction film coast', fa: 'مدار آبی علمی خیالی فیلم ساحل' },
  },
  {
    id: 'signal-garden',
    kind: 'series',
    title: { en: 'Signal Garden', fa: 'باغ سیگنال' },
    category: { en: 'Mystery · Sample series', fa: 'رازآلود · سریال نمونه' },
    summary: {
      en: 'A fictional sample series set among rain-lit rooftops and a distant signal.',
      fa: 'سریالی خیالی در میان بام‌های بارانی و یک پیام دوردست.',
    },
    image: '/assets/sample-signal-garden-v2.svg',
    imageAlt: { en: 'Original fictional rain-swept city artwork', fa: 'اثر هنری اصلی و خیالی از شهری باران‌خورده' },
    searchTerms: { en: 'signal garden mystery city series', fa: 'باغ سیگنال رازآلود شهر سریال' },
  },
  {
    id: 'glass-horizon',
    kind: 'film',
    title: { en: 'Glass Horizon', fa: 'افق شیشه‌ای' },
    category: { en: 'Discovery · Sample film', fa: 'اکتشاف · فیلم نمونه' },
    summary: {
      en: 'A fictional documentary-style sample about light, reflection, and discovery.',
      fa: 'نمونه‌ای خیالی با حال‌وهوای مستند درباره نور، بازتاب و کشف.',
    },
    image: '/assets/sample-glass-horizon-v2.svg',
    imageAlt: { en: 'Original fictional glass-light garden artwork', fa: 'اثر هنری اصلی و خیالی از باغی با نورهای شیشه‌ای' },
    searchTerms: { en: 'glass horizon discovery documentary film', fa: 'افق شیشه‌ای اکتشاف مستند فیلم' },
  },
];
