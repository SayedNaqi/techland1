import type { GuideRecord } from '@/types/opportunity';
import { additionalGuides } from '@/data/additionalGuides';

const baseGuides: GuideRecord[] = [
  {
    slug: 'avoid-scholarship-scams',
    category: { en: 'Scam prevention', fa: 'پیشگیری از کلاهبرداری' },
    title: { en: 'How to Check a Scholarship Offer Before You Apply', fa: 'چگونه پیش از درخواست، پیشنهاد بورسیه را بررسی کنیم' },
    description: { en: 'A practical checklist for confirming the source, terms, costs, and application route of an opportunity.', fa: 'فهرست کاربردی برای بررسی منبع، شرایط، هزینه‌ها و مسیر درخواست یک فرصت.' },
    readTimeMinutes: 4, publicationDate: null,
    author: { en: 'TechLand guide sample', fa: 'نمونهٔ راهنمای تک‌لند' },
    searchTerms: { en: 'scholarship scam check verify official source fees agents', fa: 'کلاهبرداری بورسیه بررسی منبع رسمی هزینه نماینده' },
    sections: [
      { heading: { en: 'Start with the official source', fa: 'از منبع رسمی آغاز کنید' }, body: { en: 'Find the programme on the official institution or authority website independently. Do not rely on a copied message, social-media post, or link supplied by an unknown agent.', fa: 'برنامه را مستقلاً در وب‌سایت رسمی مؤسسه یا نهاد پیدا کنید. به پیام کپی‌شده، پست شبکهٔ اجتماعی یا پیوند فرستاده‌شده از سوی نمایندهٔ ناشناس اتکا نکنید.' } },
      { heading: { en: 'Check the terms and costs', fa: 'شرایط و هزینه‌ها را بررسی کنید' }, body: { en: 'Compare eligibility, deadlines, funding, required documents, and application steps against the official instructions. Ask the official institution about any unclear charge before paying.', fa: 'معیارها، مهلت‌ها، تأمین مالی، اسناد و مراحل درخواست را با دستورالعمل رسمی مقایسه کنید. پیش از پرداخت هر هزینهٔ نامشخص، از مؤسسهٔ رسمی بپرسید.' } },
      { heading: { en: 'Protect your information', fa: 'از اطلاعات خود محافظت کنید' }, body: { en: 'Do not share passwords, verification codes, original identity documents, or bank details with unverified contacts. A request for sensitive information should be checked through a separately confirmed official channel.', fa: 'گذرواژه، رمز تأیید، اسناد اصلی هویتی یا اطلاعات بانکی را با تماس‌های بررسی‌نشده شریک نسازید. درخواست اطلاعات حساس را از راه رسمی و جداگانه بررسی کنید.' } },
      { heading: { en: 'Keep evidence', fa: 'مدارک را نگه دارید' }, body: { en: 'Save the original notice and correspondence. Report suspected fraud to the relevant platform or local authority. This guide is general information, not legal advice.', fa: 'اعلان اصلی و مکاتبات را نگه دارید. موارد مشکوک را به پلتفرم مربوط یا نهاد محلی گزارش دهید. این راهنما اطلاعات عمومی است، نه مشورهٔ حقوقی.' } },
    ],
  },
  {
    slug: 'verify-official-sources',
    category: { en: 'Application tips', fa: 'نکات درخواست' },
    title: { en: 'A Simple Routine for Verifying Official Sources', fa: 'روش ساده برای بررسی منابع رسمی' },
    description: { en: 'Learn to trace a listing back to the responsible institution and check whether its information is current.', fa: 'بیاموزید چگونه فهرست را به نهاد مسئول برگردانید و تازه‌بودن اطلاعات را بررسی کنید.' },
    readTimeMinutes: 3, publicationDate: null,
    author: { en: 'TechLand guide sample', fa: 'نمونهٔ راهنمای تک‌لند' },
    searchTerms: { en: 'official source verify institution url current information', fa: 'منبع رسمی بررسی نهاد نشانی اطلاعات تازه' },
    sections: [
      { heading: { en: 'Identify who is responsible', fa: 'مسئول را شناسایی کنید' }, body: { en: 'Look for the institution or authority that owns the programme, then navigate to its site independently rather than following a shortened or forwarded link.', fa: 'مؤسسه یا نهادی را که مسئول برنامه است پیدا کنید و خودتان به وب‌سایت آن بروید، نه این‌که پیوند کوتاه‌شده یا فورواردشده را دنبال کنید.' } },
      { heading: { en: 'Confirm the page and date', fa: 'صفحه و تاریخ را تأیید کنید' }, body: { en: 'Check that the official page names the same programme and requirements. If no publication or update date is shown, ask the responsible institution whether the details are current.', fa: 'بررسی کنید صفحهٔ رسمی همان برنامه و شرایط را نام ببرد. اگر تاریخ نشر یا به‌روزرسانی ندارد، از نهاد مسئول دربارهٔ تازه‌بودن جزئیات بپرسید.' } },
      { heading: { en: 'Do not rely on a badge alone', fa: 'تنها به نشان اکتفا نکنید' }, body: { en: 'A badge, logo, or domain appearance does not prove authenticity. Cross-check the contact details and announcement through another official page.', fa: 'نشان، لوگو یا ظاهر دامنه به‌تنهایی اصالت را ثابت نمی‌کند. اطلاعات تماس و اعلان را در صفحهٔ رسمی دیگری نیز بررسی کنید.' } },
    ],
  },
  {
    slug: 'prepare-application-documents',
    category: { en: 'Documents', fa: 'اسناد' },
    title: { en: 'Preparing an Application Document Checklist', fa: 'آماده‌سازی فهرست اسناد درخواست' },
    description: { en: 'Organize a personal checklist from the relevant official instructions without sending documents to an unverified party.', fa: 'بر بنیاد دستورالعمل رسمی فهرست شخصی بسازید و اسناد را برای طرف بررسی‌نشده نفرستید.' },
    readTimeMinutes: 3, publicationDate: null,
    author: { en: 'TechLand guide sample', fa: 'نمونهٔ راهنمای تک‌لند' },
    searchTerms: { en: 'application documents checklist requirements translation copies', fa: 'فهرست اسناد درخواست شرایط ترجمه کاپی' },
    sections: [
      { heading: { en: 'Use the official checklist', fa: 'از فهرست رسمی استفاده کنید' }, body: { en: 'Start from the checklist published by the institution or authority. Requirements vary by programme and jurisdiction, so a general list cannot replace the current instructions.', fa: 'از فهرست منتشرشده توسط مؤسسه یا نهاد آغاز کنید. شرایط بر اساس برنامه و حوزهٔ قضایی فرق می‌کند؛ فهرست عمومی جایگزین دستورالعمل تازه نیست.' } },
      { heading: { en: 'Track versions and translations', fa: 'نسخه‌ها و ترجمه‌ها را پیگیری کنید' }, body: { en: 'Note whether each item needs an original, a copy, a certified translation, or a particular format. Ask the issuing organization when the instructions are unclear.', fa: 'یادداشت کنید هر مورد به اصل، کاپی، ترجمهٔ تصدیق‌شده یا قالب خاص نیاز دارد. هنگام ابهام از نهاد صادرکننده بپرسید.' } },
      { heading: { en: 'Keep private documents private', fa: 'اسناد خصوصی را محرمانه نگه دارید' }, body: { en: 'This website does not accept or store application documents. Share private files only through a verified official application channel.', fa: 'این وب‌سایت اسناد درخواست را نمی‌پذیرد و ذخیره نمی‌کند. فایل‌های خصوصی را تنها از راه درخواست رسمی و تأییدشده شریک کنید.' } },
    ],
  },
];

export const guides: GuideRecord[] = [...baseGuides, ...additionalGuides];
