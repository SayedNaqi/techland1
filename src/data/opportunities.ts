import type { OpportunityRecord } from '@/types/opportunity';

const notProvided = { en: 'Not provided in demo data', fa: 'در دادهٔ نمونه ارائه نشده است' };
const demoCountry = { en: 'Example destination (demo only)', fa: 'مقصد نمونه (فقط برای نمایش)' };

export const opportunityRecords: OpportunityRecord[] = [
  {
    id: 'demo-scholarship-1', slug: 'demo-scholarship', kind: 'scholarship', status: 'demo',
    title: { en: 'Demo Scholarship — Graduate Study', fa: 'بورسیهٔ نمونه — تحصیلات کارشناسی ارشد' },
    organization: { en: 'Illustrative Institution (demo)', fa: 'مؤسسهٔ فرضی (نمونه)' }, country: demoCountry,
    degreeLevel: { en: 'Master’s (demo)', fa: 'کارشناسی ارشد (نمونه)' }, field: { en: 'Open field (demo)', fa: 'رشتهٔ نمونه (نمونه)' },
    fundingType: { en: 'Funding details not provided', fa: 'جزئیات تأمین مالی ارائه نشده است' },
    description: { en: 'A clearly fictional record showing how a sourced scholarship listing will be presented after verification.', fa: 'یک رکورد کاملاً فرضی برای نمایش شیوهٔ معرفی بورسیه پس از بررسی منابع.' },
    eligibilitySummary: notProvided, eligibleNationalities: null, languageRequirements: null, ieltsMinimum: null, ageRequirement: null, applicationFee: null, deadline: null,
    officialSourceName: null, officialSourceUrl: null, verifiedAt: null,
    details: {
      about: { en: 'This is a sample record only. It does not describe an available scholarship.', fa: 'این فقط یک رکورد نمونه است و بورسیهٔ موجودی را معرفی نمی‌کند.' },
      funding: notProvided, eligibleCountries: notProvided, academicRequirements: notProvided, languageRequirements: notProvided,
      ageRequirements: notProvided, requiredDocuments: notProvided, applicationProcess: notProvided, importantDates: notProvided, selectionProcess: notProvided,
      faqs: { en: 'No programme-specific answers are available in this demo.', fa: 'در این نمونه پاسخ اختصاصی برای برنامه‌ای وجود ندارد.' },
      searchTerms: { en: 'demo scholarship graduate masters study funding example', fa: 'بورسیه نمونه تحصیلات ارشد کمک مالی فرضی' },
    },
  },
  {
    id: 'demo-scholarship-2', slug: 'demo-scholarship-research', kind: 'scholarship', status: 'demo',
    title: { en: 'Demo Scholarship — Research Track', fa: 'بورسیهٔ نمونه — مسیر پژوهش' },
    organization: { en: 'Sample University (demo)', fa: 'دانشگاه نمونه (نمونه)' }, country: { en: 'Sample destination B (demo)', fa: 'مقصد نمونه ب (نمونه)' },
    degreeLevel: { en: 'Doctoral (demo)', fa: 'دکترا (نمونه)' }, field: { en: 'Research (demo)', fa: 'پژوهش (نمونه)' },
    fundingType: { en: 'Funding details not provided', fa: 'جزئیات تأمین مالی ارائه نشده است' },
    description: { en: 'A fictional example record for testing directory search, filters, save, and compare controls.', fa: 'رکورد فرضی برای نمایش جستجو، فیلتر و مقایسهٔ فهرست.' },
    eligibilitySummary: notProvided, eligibleNationalities: null, languageRequirements: null, ieltsMinimum: null, ageRequirement: null, applicationFee: null, deadline: null,
    officialSourceName: null, officialSourceUrl: null, verifiedAt: null,
    details: {
      about: { en: 'This is a sample record only. It does not describe an available scholarship.', fa: 'این فقط یک رکورد نمونه است و بورسیهٔ موجودی را معرفی نمی‌کند.' },
      funding: notProvided, eligibleCountries: notProvided, academicRequirements: notProvided, languageRequirements: notProvided,
      ageRequirements: notProvided, requiredDocuments: notProvided, applicationProcess: notProvided, importantDates: notProvided, selectionProcess: notProvided,
      faqs: { en: 'No programme-specific answers are available in this demo.', fa: 'در این نمونه پاسخ اختصاصی برای برنامه‌ای وجود ندارد.' },
      searchTerms: { en: 'demo scholarship doctoral research sample university example', fa: 'بورسیه نمونه دکترا پژوهش دانشگاه نمونه' },
    },
  },
  {
    id: 'demo-scholarship-3', slug: 'demo-scholarship-undergraduate', kind: 'scholarship', status: 'demo',
    title: { en: 'Demo Scholarship — Undergraduate Pathway', fa: 'بورسیهٔ نمونه — مسیر کارشناسی' },
    organization: { en: 'Example Education Organization (demo)', fa: 'سازمان آموزشی فرضی (نمونه)' }, country: { en: 'Sample destination C (demo)', fa: 'مقصد نمونه ج (نمونه)' },
    degreeLevel: { en: 'Bachelor’s (demo)', fa: 'کارشناسی (نمونه)' }, field: { en: 'Education (demo)', fa: 'آموزش (نمونه)' },
    fundingType: { en: 'Funding details not provided', fa: 'جزئیات تأمین مالی ارائه نشده است' },
    description: { en: 'A fictional undergraduate sample used to demonstrate how filters work; not an application opportunity.', fa: 'نمونهٔ فرضی کارشناسی برای نمایش فیلترها؛ فرصت درخواست واقعی نیست.' },
    eligibilitySummary: notProvided, eligibleNationalities: null, languageRequirements: null, ieltsMinimum: null, ageRequirement: null, applicationFee: null, deadline: null,
    officialSourceName: null, officialSourceUrl: null, verifiedAt: null,
    details: {
      about: { en: 'This is a sample record only. It does not describe an available scholarship.', fa: 'این فقط یک رکورد نمونه است و بورسیهٔ موجودی را معرفی نمی‌کند.' },
      funding: notProvided, eligibleCountries: notProvided, academicRequirements: notProvided, languageRequirements: notProvided,
      ageRequirements: notProvided, requiredDocuments: notProvided, applicationProcess: notProvided, importantDates: notProvided, selectionProcess: notProvided,
      faqs: { en: 'No programme-specific answers are available in this demo.', fa: 'در این نمونه پاسخ اختصاصی برای برنامه‌ای وجود ندارد.' },
      searchTerms: { en: 'demo scholarship undergraduate bachelor education example', fa: 'بورسیه نمونه کارشناسی آموزش فرضی' },
    },
  },
  {
    id: 'demo-humanitarian-1', slug: 'demo-humanitarian-program', kind: 'humanitarian', status: 'demo',
    title: { en: 'Demo Humanitarian Program — General Information', fa: 'برنامهٔ بشردوستانهٔ نمونه — اطلاعات عمومی' },
    organization: { en: 'Illustrative Authority (not real)', fa: 'نهاد فرضی (واقعی نیست)' }, country: demoCountry,
    degreeLevel: { en: 'Not applicable', fa: 'قابل تطبیق نیست' }, field: { en: 'Humanitarian information (demo)', fa: 'اطلاعات بشردوستانه (نمونه)' },
    fundingType: notProvided,
    description: { en: 'A fictional record showing the layout for humanitarian-pathway information; no active programme is represented.', fa: 'رکورد فرضی برای نمایش اطلاعات مسیر بشردوستانه؛ برنامهٔ فعال را نشان نمی‌دهد.' },
    eligibilitySummary: notProvided, eligibleNationalities: null, languageRequirements: null, ieltsMinimum: null, ageRequirement: null, applicationFee: null, deadline: null,
    officialSourceName: null, officialSourceUrl: null, verifiedAt: null,
    details: {
      about: { en: 'This fictional sample is not an active humanitarian programme and is not an application route.', fa: 'این نمونهٔ فرضی برنامهٔ بشردوستانهٔ فعال یا مسیر درخواست نیست.' },
      funding: notProvided, eligibleCountries: notProvided, academicRequirements: notProvided, languageRequirements: notProvided,
      ageRequirements: notProvided, requiredDocuments: notProvided, applicationProcess: notProvided, importantDates: notProvided, selectionProcess: notProvided,
      faqs: { en: 'No authority, country, eligibility rule, or route is provided in this demo.', fa: 'در این نمونه هیچ نهاد، کشور، معیار واجدشرایط بودن یا مسیری ارائه نشده است.' },
      searchTerms: { en: 'demo humanitarian program pathway protection family sample', fa: 'برنامه بشردوستانه نمونه مسیر حمایت خانواده' },
    },
  },
  {
    id: 'demo-humanitarian-2', slug: 'demo-humanitarian-community', kind: 'humanitarian', status: 'demo',
    title: { en: 'Demo Humanitarian Program — Community Support', fa: 'برنامهٔ بشردوستانهٔ نمونه — پشتیبانی اجتماعی' },
    organization: { en: 'Sample Organization (demo)', fa: 'سازمان نمونه (نمونه)' }, country: { en: 'Sample destination B (demo)', fa: 'مقصد نمونه ب (نمونه)' },
    degreeLevel: { en: 'Not applicable', fa: 'قابل تطبیق نیست' }, field: { en: 'Community support (demo)', fa: 'پشتیبانی اجتماعی (نمونه)' }, fundingType: notProvided,
    description: { en: 'A fictional example for testing the humanitarian directory and comparison layout.', fa: 'نمونهٔ فرضی برای نمایش فهرست و مقایسهٔ اطلاعات بشردوستانه.' },
    eligibilitySummary: notProvided, eligibleNationalities: null, languageRequirements: null, ieltsMinimum: null, ageRequirement: null, applicationFee: null, deadline: null,
    officialSourceName: null, officialSourceUrl: null, verifiedAt: null,
    details: {
      about: { en: 'This fictional sample is not an active humanitarian programme and is not an application route.', fa: 'این نمونهٔ فرضی برنامهٔ بشردوستانهٔ فعال یا مسیر درخواست نیست.' },
      funding: notProvided, eligibleCountries: notProvided, academicRequirements: notProvided, languageRequirements: notProvided,
      ageRequirements: notProvided, requiredDocuments: notProvided, applicationProcess: notProvided, importantDates: notProvided, selectionProcess: notProvided,
      faqs: { en: 'No authority, country, eligibility rule, or route is provided in this demo.', fa: 'در این نمونه هیچ نهاد، کشور، معیار واجدشرایط بودن یا مسیری ارائه نشده است.' },
      searchTerms: { en: 'demo humanitarian community support sample', fa: 'نمونه بشردوستانه پشتیبانی اجتماعی' },
    },
  },
];

export const scholarships = opportunityRecords.filter((record) => record.kind === 'scholarship');
export const humanitarianPrograms = opportunityRecords.filter((record) => record.kind === 'humanitarian');
export const availableOpportunityIds = new Set(opportunityRecords.map((record) => record.id));
