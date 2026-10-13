import type { Language } from '@/types';
import type { RouteInfo } from '@/types/opportunity';
import { resolveRoute } from '@/constants/opportunityRoutes';
import { opportunityRecords } from '@/data/opportunities';
import { guides } from '@/data/guides';
import { platformCopy } from '@/constants/platformCopy';

export interface SiteMetadata { title: string; description: string; keywords: string }
const brandName = 'TechLand';

export function getSiteMetadata(pathname: string, language: Language): SiteMetadata {
  const route: RouteInfo = resolveRoute(pathname);
  const copy = platformCopy[language];
  const suffix = language === 'fa' ? 'تک‌لند' : brandName;
  const defaultMeta: SiteMetadata = { title: `${copy.home.eyebrow} | ${suffix}`, description: copy.home.description, keywords: 'TechLand, scholarships, education opportunities, humanitarian information, visa information, official sources, guides' };
  const metadata: Record<RouteInfo['page'], SiteMetadata> = {
    home: defaultMeta,
    scholarships: { title: `${copy.directory.scholarshipTitle} | ${suffix}`, description: copy.directory.scholarshipDesc, keywords: 'scholarship directory, education funding, study opportunities, official sources' },
    'scholarship-detail': (() => { const item = opportunityRecords.find((record) => record.kind === 'scholarship' && record.slug === route.slug); return { title: `${item?.title[language] ?? copy.directory.scholarshipTitle} | ${suffix}`, description: item?.description[language] ?? copy.directory.scholarshipDesc, keywords: 'scholarship sample, demo listing, education opportunity' }; })(),
    humanitarian: { title: `${copy.directory.humanitarianTitle} | ${suffix}`, description: copy.directory.humanitarianDesc, keywords: 'humanitarian pathways, general information, official authorities, source verification' },
    'humanitarian-detail': (() => { const item = opportunityRecords.find((record) => record.kind === 'humanitarian' && record.slug === route.slug); return { title: `${item?.title[language] ?? copy.directory.humanitarianTitle} | ${suffix}`, description: item?.description[language] ?? copy.directory.humanitarianDesc, keywords: 'humanitarian sample, general information, official authorities' }; })(),
    visa: { title: `${copy.visa.title} | ${suffix}`, description: copy.visa.description, keywords: 'general visa information, student visa, work visa, official immigration sources' },
    eligibility: { title: `${copy.eligibility.title} | ${suffix}`, description: copy.eligibility.description, keywords: 'quick match preview, scholarship search, demo opportunity filters' },
    guides: { title: `${copy.guides.title} | ${suffix}`, description: copy.guides.description, keywords: 'scholarship guides, source verification, scam prevention, application documents' },
    'guide-detail': (() => { const item = guides.find((guide) => guide.slug === route.slug); return { title: `${item?.title[language] ?? copy.guides.title} | ${suffix}`, description: item?.description[language] ?? copy.guides.description, keywords: 'education guide, official source checks, general information' }; })(),
    'scam-alert': { title: `${copy.scam.title} | ${suffix}`, description: copy.scam.description, keywords: 'scholarship scam alert, visa scam prevention, verify official sources' },
    compare: { title: `${copy.compare.title} | ${suffix}`, description: copy.compare.description, keywords: 'local opportunity comparison, demo listings' },
    services: { title: `${copy.services.title} | ${suffix}`, description: copy.services.subtitle, keywords: 'TechLand web development, software, technology accessories, gaming support, entertainment' },
    contact: { title: `${copy.nav.contact} | ${suffix}`, description: language === 'fa' ? 'اطلاعات تماس تک‌لند. فرم پیش‌نمایش به سرور وصل نیست.' : 'Contact TechLand. The preview inquiry form is not connected to a server.', keywords: 'TechLand contact, web services, technology support' },
    admin: { title: `${language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'} | ${suffix}`, description: language === 'fa' ? 'مدیریت بورسیه‌ها، مسیرها، راهنماها، پرداخت‌ها و تنظیمات.' : 'Manage scholarships, pathways, guides, payments and settings.', keywords: 'TechLand admin, content management, payments' },
    payment: { title: `${language === 'fa' ? 'پرداخت و اشتراک' : 'Payment & Subscription'} | ${suffix}`, description: language === 'fa' ? 'خرید اشتراک با حساب‌پی (HesabPay).' : 'Purchase a subscription with HesabPay.', keywords: 'TechLand subscription, HesabPay payment' },
    movies: { title: `${language === 'fa' ? 'فیلم‌ها' : 'Movies'} | ${suffix}`, description: language === 'fa' ? 'تماشای فیلم‌ها با پخش‌کن تک‌لند.' : 'Watch movies with the TechLand player.', keywords: 'TechLand movies, watch films online' },
    series: { title: `${language === 'fa' ? 'سریال‌ها' : 'TV Series'} | ${suffix}`, description: language === 'fa' ? 'تماشای سریال‌ها با پخش‌کن تک‌لند.' : 'Watch series with the TechLand player.', keywords: 'TechLand series, watch shows online' },
    'video-detail': { title: `${language === 'fa' ? 'تماشا' : 'Watch'} | ${suffix}`, description: language === 'fa' ? 'تماشای ویدیو با پخش‌کن تک‌لند.' : 'Watch video with the TechLand player.', keywords: 'TechLand watch, online player' },
    games: { title: `${language === 'fa' ? 'بازی‌ها' : 'Games'} | ${suffix}`, description: language === 'fa' ? 'فروشگاه بازی تک‌لند؛ موارد جدید با نشان «جدید».' : 'TechLand game store; new arrivals marked NEW.', keywords: 'TechLand games, game store' },
    'not-found': { title: `${copy.common.notFound} | ${suffix}`, description: copy.common.notFound, keywords: 'TechLand' },
  };
  return metadata[route.page];
}
