import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@/index.css';
import '@/App.css';
import '@/Pathways.css';
import App from '@/App';
import type { Language } from '@/types';

const root = document.getElementById('root');
if (root) {
  const initialLanguage: Language = /^\/fa(?:\/|$)/.test(window.location.pathname) ? 'fa' : 'en';
  const app = <StrictMode><BrowserRouter><App initialLanguage={initialLanguage} /></BrowserRouter></StrictMode>;
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
