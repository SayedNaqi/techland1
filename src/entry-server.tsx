import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '@/App';
import { LOCALIZED_PUBLIC_ROUTES, staticOutputPath } from '@/constants/opportunityRoutes';
import { getSiteMetadata } from '@/constants/siteMeta';
import type { Language } from '@/types';

export function render(language: Language, pathname: string) {
  return renderToString(<StaticRouter location={pathname}><App initialLanguage={language} /></StaticRouter>);
}

export { LOCALIZED_PUBLIC_ROUTES, staticOutputPath, getSiteMetadata };
