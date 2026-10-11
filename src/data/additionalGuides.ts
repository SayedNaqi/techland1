import type { GuideRecord } from '@/types/opportunity';

const sampleAuthor = { en: 'TechLand guide sample', fa: 'نمونهٔ راهنمای تک‌لند' };

export const additionalGuides: GuideRecord[] = [
  {
    slug: 'scholarship-application-planning',
    category: { en: 'Scholarship planning', fa: 'برنامه‌ریزی بورسیه' },
    title: { en: 'Planning a Scholarship Search', fa: 'برنامه‌ریزی برای جستجوی بورسیه' },
    description: { en: 'Build a careful search plan from official programme pages, real requirements, and published deadlines.', fa: 'بر بنیاد صفحه‌های رسمی برنامه، شرایط واقعی و مهلت‌های نشرشده یک برنامهٔ دقیق جستجو بسازید.' },
    readTimeMinutes: 4, publicationDate: null, author: sampleAuthor,
    searchTerms: { en: 'scholarship planning application funding search deadlines', fa: 'برنامه‌ریزی بورسیه درخواست کمک مالی جستجو مهلت' },
    sections: [
      { heading: { en: 'Start with a clear shortlist', fa: 'با فهرست کوتاه روشن آغاز کنید' }, body: { en: 'Use the official programme criteria to identify the study level, subject, destination, and funding scope that fit your goals. This guide does not identify a real award.', fa: 'از معیارهای رسمی برنامه برای تعیین مقطع، رشته، مقصد و دامنهٔ تأمین مالی متناسب با هدف خود استفاده کنید. این راهنما بورسیهٔ واقعی معرفی نمی‌کند.' } },
      { heading: { en: 'Record the source and date', fa: 'منبع و تاریخ را یادداشت کنید' }, body: { en: 'For every real listing, save the official URL, the responsible organization, the stated deadline, and the date you checked it. Recheck the official page before applying.', fa: 'برای هر فهرست واقعی، نشانی رسمی، نهاد مسئول، مهلت اعلام‌شده و تاریخ بررسی را ثبت کنید. پیش از درخواست، صفحهٔ رسمی را دوباره ببینید.' } },
    ],
  },
  {
    slug: 'study-abroad-planning',
    category: { en: 'Study abroad', fa: 'تحصیل در خارج' },
    title: { en: 'A Practical Study-Abroad Planning Checklist', fa: 'فهرست کاربردی برنامه‌ریزی تحصیل در خارج' },
    description: { en: 'Organize your research without assuming that any destination, university, or programme is available to you.', fa: 'پژوهش خود را سامان دهید، بی‌آن‌که مقصد، دانشگاه یا برنامه‌ای را برای خود قطعی فرض کنید.' },
    readTimeMinutes: 4, publicationDate: null, author: sampleAuthor,
    searchTerms: { en: 'study abroad international education planning university costs dates', fa: 'تحصیل خارج آموزش بین‌المللی برنامه‌ریزی دانشگاه هزینه تاریخ' },
    sections: [
      { heading: { en: 'Compare official programme information', fa: 'اطلاعات رسمی برنامه‌ها را مقایسه کنید' }, body: { en: 'Check the institution’s official page for programme content, admission requirements, tuition and funding information, and application dates. Details differ by institution and year.', fa: 'محتوای برنامه، شرایط پذیرش، شهریه و کمک مالی، و تاریخ‌های درخواست را در صفحهٔ رسمی مؤسسه ببینید. جزئیات بر اساس مؤسسه و سال فرق می‌کند.' } },
      { heading: { en: 'Check related requirements separately', fa: 'شرایط مرتبط را جداگانه بررسی کنید' }, body: { en: 'Admission, scholarship, and immigration decisions have different rules and decision-makers. Confirm each through the responsible institution or authority; this guide does not determine eligibility.', fa: 'پذیرش، بورسیه و مهاجرت شرایط و تصمیم‌گیرندگان جداگانه دارند. هرکدام را از مؤسسه یا مرجع مسئول تأیید کنید؛ این راهنما واجدشرایط بودن را تعیین نمی‌کند.' } },
    ],
  },
  {
    slug: 'visa-information-basics',
    category: { en: 'Visa information', fa: 'اطلاعات ویزا' },
    title: { en: 'Finding Current Visa Information', fa: 'یافتن اطلاعات تازهٔ ویزا' },
    description: { en: 'A source-checking routine for general visa research; it is not immigration or legal advice.', fa: 'روش بررسی منبع برای پژوهش عمومی ویزا؛ این مشورهٔ مهاجرتی یا حقوقی نیست.' },
    readTimeMinutes: 3, publicationDate: null, author: sampleAuthor,
    searchTerms: { en: 'visa information immigration requirements official government source', fa: 'اطلاعات ویزا مهاجرت شرایط منبع رسمی دولت' },
    sections: [
      { heading: { en: 'Find the responsible authority', fa: 'مرجع مسئول را پیدا کنید' }, body: { en: 'Locate the immigration or consular authority responsible for the destination and navigate to its site independently. Requirements vary by country, visa type, and individual circumstances.', fa: 'مرجع مهاجرتی یا کنسولی مسئول مقصد را پیدا کنید و خودتان وارد وب‌سایت آن شوید. شرایط بر اساس کشور، نوع ویزا و وضعیت فردی فرق می‌کند.' } },
      { heading: { en: 'Confirm every current instruction', fa: 'هر دستورالعمل تازه را تأیید کنید' }, body: { en: 'Use the authority’s current page for eligibility, forms, fees, supporting documents, appointments, and processing information. Seek qualified advice for questions about your circumstances.', fa: 'برای واجدشرایط بودن، فرم‌ها، هزینه‌ها، اسناد، وقت و روند بررسی از صفحهٔ تازهٔ مرجع استفاده کنید. برای وضعیت شخصی از مشورهٔ متخصص واجد صلاحیت کمک بگیرید.' } },
    ],
  },
  {
    slug: 'humanitarian-information-basics',
    category: { en: 'Humanitarian pathways', fa: 'مسیرهای بشردوستانه' },
    title: { en: 'How to Research Humanitarian Pathway Information', fa: 'چگونه اطلاعات مسیرهای بشردوستانه را بررسی کنیم' },
    description: { en: 'Learn how to find the responsible authority and distinguish general information from personal legal guidance.', fa: 'شیوهٔ یافتن مرجع مسئول و فرق اطلاعات عمومی با راهنمایی حقوقی شخصی را بیاموزید.' },
    readTimeMinutes: 4, publicationDate: null, author: sampleAuthor,
    searchTerms: { en: 'humanitarian pathway refugee resettlement family protection official authority', fa: 'مسیر بشردوستانه پناهندگی اسکان مجدد خانواده حمایت مرجع رسمی' },
    sections: [
      { heading: { en: 'Identify the program owner', fa: 'مالک برنامه را شناسایی کنید' }, body: { en: 'A humanitarian pathway may be administered by a government, an international organization, or another responsible body. Verify the programme and application route directly with that body.', fa: 'مسیر بشردوستانه ممکن است توسط دولت، سازمان بین‌المللی یا نهاد مسئول دیگری اداره شود. برنامه و مسیر درخواست را مستقیماً از همان نهاد بررسی کنید.' } },
      { heading: { en: 'Avoid assumptions and promises', fa: 'از فرض و وعده پرهیز کنید' }, body: { en: 'Eligibility, registration, referral, and timing differ across programs and locations. No general page can determine a person’s protection claim or guarantee a result. This is general information, not legal advice.', fa: 'واجدشرایط بودن، ثبت‌نام، معرفی و زمان‌بندی میان برنامه‌ها و مکان‌ها فرق می‌کند. هیچ صفحهٔ عمومی نمی‌تواند ادعای حفاظتی یک فرد را تعیین یا نتیجه را تضمین کند. این اطلاعات عمومی است، نه مشورهٔ حقوقی.' } },
    ],
  },
  {
    slug: 'language-test-preparation',
    category: { en: 'Language tests', fa: 'آزمون‌های زبان' },
    title: { en: 'Planning for a Language Test', fa: 'برنامه‌ریزی برای آزمون زبان' },
    description: { en: 'Check which language tests an institution accepts before choosing a preparation plan.', fa: 'پیش از انتخاب برنامهٔ آمادگی، ببینید مؤسسه کدام آزمون‌های زبان را می‌پذیرد.' },
    readTimeMinutes: 3, publicationDate: null, author: sampleAuthor,
    searchTerms: { en: 'language test IELTS English test TOEFL preparation requirements', fa: 'آزمون زبان آیلتس انگلیسی تافل آمادگی شرایط' },
    sections: [
      { heading: { en: 'Check the institution’s accepted tests', fa: 'آزمون‌های پذیرفته‌شدهٔ مؤسسه را بررسی کنید' }, body: { en: 'Use the current official admissions page to check accepted tests, minimum scores, score validity periods, and any exemption rules. These vary by programme and year.', fa: 'آزمون‌های پذیرفته‌شده، نمرهٔ حداقل، مدت اعتبار نمره و معافیت‌ها را در صفحهٔ رسمی پذیرش ببینید. این موارد بر اساس برنامه و سال فرق می‌کند.' } },
      { heading: { en: 'Use official test-provider guidance', fa: 'از راهنمای رسمی برگزارکننده استفاده کنید' }, body: { en: 'Check the test provider’s official preparation and booking information. Do not rely on an unofficial score promise or pay an unverified agent.', fa: 'راهنمای آمادگی و ثبت‌نام را از برگزارکنندهٔ رسمی آزمون ببینید. به وعدهٔ نمرهٔ غیررسمی اعتماد نکنید و به نمایندهٔ بررسی‌نشده پول ندهید.' } },
    ],
  },
];
