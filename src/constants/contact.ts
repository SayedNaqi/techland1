import type { Language } from '@/types';

/** Real, owner-provided TechLand contact channels. */
export const CONTACT = {
  email: 'Salem.sangari82@gmail.com',
  phoneDisplay: '+93 (0) 789121257',
  phoneHref: 'tel:+93789121257',
  whatsappDisplay: '+93 744 691 779',
  whatsappHref: 'https://wa.me/93744691779',
  telegramId: '@Tech_Laand',
  telegramHref: 'https://t.me/Tech_Laand',
  instagramHref: 'https://www.instagram.com/tech_laand?srtk=Y243bGVqMmVrZTY1',
  facebookHref: 'https://www.facebook.com/share/1KH3yoTRt8/',
  addressEn: 'Golayee Dawakhana, Kabul Market 016, 3th District, Kabul, Afghanistan',
  addressFa: 'گلایی دواخانه، مارکیت کابل ۰۱۶، ناحیه سوم، کابل، افغانستان',
  mapHref: 'https://maps.app.goo.gl/2sbhFUXwrXEReVWW8',
  hoursEn: 'Sat–Thu: 08:00–18:00 · Fri: Closed',
  hoursFa: 'شنبه تا پنجشنبه: ۰۸:۰۰–۱۸:۰۰ · جمعه: بسته است',
} as const;

export const CONTACT_LABELS: Record<string, Record<Language, string>> = {
  email: { en: 'Email', fa: 'ایمیل' },
  phone: { en: 'Phone', fa: 'شماره تماس' },
  whatsapp: { en: 'WhatsApp', fa: 'واتس‌اپ' },
  telegram: { en: 'Telegram', fa: 'تلگرام' },
  instagram: { en: 'Instagram', fa: 'اینستاگرام' },
  facebook: { en: 'Facebook', fa: 'فیسبوک' },
  address: { en: 'Address', fa: 'آدرس' },
  hours: { en: 'Working hours', fa: 'ساعات کاری' },
};

export const address = (language: Language): string =>
  language === 'fa' ? CONTACT.addressFa : CONTACT.addressEn;

export const hours = (language: Language): string =>
  language === 'fa' ? CONTACT.hoursFa : CONTACT.hoursEn;
