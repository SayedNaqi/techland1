import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { brandCopy } from '@/constants/brandTranslations';
import { translations } from '@/constants/translations';
import type { Language } from '@/types';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
  brand: (typeof brandCopy)[Language];
  isRTL: boolean;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANG_KEY = 'techland_language';

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(LANG_KEY, nextLanguage); } catch { /* Locale still changes for this session. */ }
    }
  }, []);
  const copy = translations[language];
  const value = useMemo<LanguageContextValue>(() => ({ language, setLanguage, t: copy, brand: brandCopy[language], isRTL: copy.dir === 'rtl' }), [language, setLanguage, copy]);
  useEffect(() => {
    document.documentElement.setAttribute('lang', copy.lang);
    document.documentElement.setAttribute('dir', copy.dir);
    document.body.setAttribute('dir', copy.dir);
  }, [copy]);
  useEffect(() => {
    const onPopState = () => setLanguageState(/^\/fa(?:\/|$)/.test(window.location.pathname) ? 'fa' : 'en');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider.');
  return context;
}
