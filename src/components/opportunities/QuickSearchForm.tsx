import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';

export default function QuickSearchForm() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'scholarship' | 'humanitarian'>('scholarship');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const base = kind === 'scholarship' ? '/scholarships/' : '/humanitarian/';
    const search = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    navigate(`${localizedPath(base, language)}${search}`);
  };
  return <form className="quick-search-form" onSubmit={submit} role="search">
    <label className="quick-search-form__query"><Search size={19} aria-hidden="true" /><span className="visually-hidden">{copy.common.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.directory.searchPlaceholder} /></label>
    <label className="quick-search-form__kind"><span className="visually-hidden">{copy.common.search}</span><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="scholarship">{copy.nav.scholarships}</option><option value="humanitarian">{copy.nav.humanitarian}</option></select></label>
    <button className="pathway-button" type="submit">{copy.home.primary}<ArrowUpRight size={17} aria-hidden="true" /></button>
  </form>;
}
