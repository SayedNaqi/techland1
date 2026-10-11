import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import { searchIndex } from '@/lib/opportunityRepository';

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  const results = useMemo(() => {
    const value = query.trim().toLocaleLowerCase(language === 'fa' ? 'fa' : 'en');
    if (!value) return [];
    return searchIndex.filter((item) => `${item.title.en} ${item.title.fa} ${item.description.en} ${item.description.fa} ${item.terms.en} ${item.terms.fa}`.toLocaleLowerCase(language === 'fa' ? 'fa' : 'en').includes(value)).slice(0, 8);
  }, [query, language]);
  return <dialog className="search-dialog" ref={dialogRef} onClose={onClose} onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="search-dialog-title">
    <div className="search-dialog__head"><h2 id="search-dialog-title">{copy.search.title}</h2><button className="opp-icon-button" type="button" onClick={onClose} aria-label={copy.search.close}><X size={20} aria-hidden="true" /></button></div>
    <label className="search-dialog__input"><Search size={18} aria-hidden="true" /><span className="visually-hidden">{copy.search.placeholder}</span><input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search.placeholder} /></label>
    {!query.trim() ? <p className="search-dialog__message">{copy.search.empty}</p> : results.length ? <ul className="search-dialog__results">{results.map((item) => <li key={`${item.type}-${item.href}`}><Link to={localizedPath(item.href, language)} onClick={onClose}><span><strong>{item.title[language]}</strong><small>{item.description[language]}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link></li>)}</ul> : <p className="search-dialog__message">{copy.search.noResults}</p>}
  </dialog>;
}
