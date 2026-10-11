import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Language } from '@/types';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { SavedOpportunityProvider } from '@/hooks/useSavedOpportunities';
import { getSiteMetadata } from '@/constants/siteMeta';
import { resolveRoute } from '@/constants/opportunityRoutes';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageView from '@/pages/PageView';

function LocaleMetadataSync({ pathname }: { pathname: string }) {
  const { language } = useLanguage();
  const metadata = getSiteMetadata(pathname, language);
  useEffect(() => {
    document.title = metadata.title;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    const setMeta = (selector: string, content: string) => document.head.querySelector(selector)?.setAttribute('content', content);
    setMeta('meta[name="description"]', metadata.description);
    setMeta('meta[name="keywords"]', metadata.keywords);
    setMeta('meta[property="og:title"]', metadata.title);
    setMeta('meta[property="og:description"]', metadata.description);
    setMeta('meta[name="twitter:title"]', metadata.title);
    setMeta('meta[name="twitter:description"]', metadata.description);
    const structured = document.getElementById('website-structured-data');
    if (structured) structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'TechLand', description: metadata.description, inLanguage: language });
  }, [language, metadata.title, metadata.description, metadata.keywords]);
  return null;
}

function AppFrame() {
  const location = useLocation();
  const { language } = useLanguage();
  const route = resolveRoute(location.pathname);
  return <div className={`platform-app ${language === 'fa' ? 'platform-app--rtl' : 'platform-app--ltr'}`} dir={language === 'fa' ? 'rtl' : 'ltr'} data-route={location.pathname}>
    <a className="pathway-skip-link" href="#main-content">{language === 'fa' ? 'رفتن به محتوای اصلی' : 'Skip to main content'}</a>
    <LocaleMetadataSync pathname={location.pathname} />
    <Header />
    <main id="main-content"><PageView route={route} /></main>
    <Footer />
  </div>;
}

export default function App({ initialLanguage }: { initialLanguage?: Language }) {
  const location = useLocation();
  const language = initialLanguage ?? resolveRoute(location.pathname).language;
  return <LanguageProvider initialLanguage={language}><SavedOpportunityProvider><AppFrame /></SavedOpportunityProvider></LanguageProvider>;
}
