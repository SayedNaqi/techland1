import type { Language } from '@/types';
import type { RouteInfo } from '@/types/opportunity';

export const PUBLIC_BASE_ROUTES = [
  '/',
  '/scholarships/',
  '/scholarships/demo-scholarship/',
  '/scholarships/demo-scholarship-research/',
  '/scholarships/demo-scholarship-undergraduate/',
  '/humanitarian/',
  '/humanitarian/demo-humanitarian-program/',
  '/humanitarian/demo-humanitarian-community/',
  '/visa/',
  '/eligibility/',
  '/guides/avoid-scholarship-scams/',
  '/guides/verify-official-sources/',
  '/guides/prepare-application-documents/',
  '/guides/scholarship-application-planning/',
  '/guides/study-abroad-planning/',
  '/guides/visa-information-basics/',
  '/guides/humanitarian-information-basics/',
  '/guides/language-test-preparation/',
  '/scam-alert/',
  '/compare/',
  '/services/',
  '/contact/',
  '/admin/',
  '/payment/',
  '/movies/',
  '/series/',
  '/games/',
] as const;

export function localizedPath(path: string, language: Language): string {
  const [beforeHash, hash = ''] = path.split('#', 2);
  const [rawPath, query = ''] = beforeHash.split('?', 2);
  const clean = rawPath.replace(/^\/fa(?=\/|$)/, '') || '/';
  const normalized = clean.startsWith('/') ? clean : `/${clean}`;
  const prefix = language === 'fa' ? '/fa' : '';
  const localized = normalized === '/' ? `${prefix}/` : `${prefix}${normalized}`;
  return `${localized}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

export function languageFromPath(path: string): Language {
  return /^\/fa(?:\/|$)/.test(path) ? 'fa' : 'en';
}

export function stripLocale(path: string): string {
  const withoutLocale = path.replace(/^\/fa(?=\/|$)/, '') || '/';
  const normalized = withoutLocale.startsWith('/') ? withoutLocale : `/${withoutLocale}`;
  if (normalized === '/') return '/';
  return `${normalized.replace(/\/+$/, '')}/`;
}

export const LOCALIZED_PUBLIC_ROUTES = [
  ...PUBLIC_BASE_ROUTES,
  ...PUBLIC_BASE_ROUTES.map((path) => localizedPath(path, 'fa')),
];

export function resolveRoute(pathname: string): RouteInfo {
  const language = languageFromPath(pathname);
  const basePath = stripLocale(pathname);
  if (basePath === '/') return { language, basePath, page: 'home' };
  if (basePath === '/scholarships/') return { language, basePath, page: 'scholarships' };
  if (basePath.startsWith('/scholarships/')) {
    const slug = basePath.split('/').filter(Boolean)[1];
    if (slug) return { language, basePath, page: 'scholarship-detail', slug };
  }
  if (basePath === '/humanitarian/') return { language, basePath, page: 'humanitarian' };
  if (basePath.startsWith('/humanitarian/')) {
    const slug = basePath.split('/').filter(Boolean)[1];
    if (slug) return { language, basePath, page: 'humanitarian-detail', slug };
  }
  if (basePath === '/visa/') return { language, basePath, page: 'visa' };
  if (basePath === '/eligibility/') return { language, basePath, page: 'eligibility' };
  if (/^\/guides\/[^/]+\/$/.test(basePath)) {
    const slug = basePath.split('/').filter(Boolean)[1];
    return { language, basePath, page: 'guide-detail', slug };
  }
  if (basePath === '/scam-alert/') return { language, basePath, page: 'scam-alert' };
  if (basePath === '/compare/') return { language, basePath, page: 'compare' };
  if (basePath === '/services/') return { language, basePath, page: 'services' };
  if (basePath === '/contact/') return { language, basePath, page: 'contact' };
  if (basePath === '/admin/') return { language, basePath, page: 'admin' };
  if (basePath === '/payment/') return { language, basePath, page: 'payment' };
  if (basePath === '/movies/') return { language, basePath, page: 'movies' };
  if (basePath === '/series/') return { language, basePath, page: 'series' };
  if (basePath === '/games/') return { language, basePath, page: 'games' };
  if (basePath.startsWith('/watch/')) {
    const slug = basePath.split('/').filter(Boolean)[1];
    if (slug) return { language, basePath, page: 'video-detail', slug };
  }
  return { language, basePath, page: 'not-found' };
}

export function staticOutputPath(routePath: string): string {
  const pathname = routePath.split(/[?#]/, 1)[0] || '/';
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  return clean ? `${clean}/index.html` : 'index.html';
}
