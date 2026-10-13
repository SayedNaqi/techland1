import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Bookmark, ChevronRight, Clapperboard, GraduationCap, HeartHandshake, Home, Info, Mail, Menu, Search, ShieldCheck, Tv, Wallet, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath, stripLocale } from '@/constants/opportunityRoutes';
import BrandMark from '@/components/common/BrandMark';
import GlobalSearch from '@/components/opportunities/GlobalSearch';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const copy = platformCopy[language];
  const { savedIds, comparedIds } = useSavedOpportunities();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const currentPath = stripLocale(location.pathname);
  const navItems = [
    { label: copy.nav.home, path: '/', Icon: Home },
    { label: copy.nav.about, path: '/services/#about', Icon: Info },
    { label: copy.nav.scholarships, path: '/scholarships/', Icon: GraduationCap },
    { label: copy.nav.humanitarian, path: '/humanitarian/', Icon: HeartHandshake },
    { label: copy.nav.visa, path: '/visa/', Icon: ShieldCheck },
    { label: copy.nav.guides, path: '/guides/', Icon: BookOpen },
    { label: copy.nav.movies, path: '/movies/', Icon: Clapperboard },
    { label: copy.nav.series, path: '/series/', Icon: Tv },
    { label: language === 'fa' ? 'عضویت با حساب‌پی' : 'Membership', path: '/payment/', Icon: Wallet },
    { label: copy.nav.contact, path: '/contact/', Icon: Mail },
  ];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const timer = window.requestAnimationFrame(() => firstLinkRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.cancelAnimationFrame(timer); window.removeEventListener('keydown', onKeyDown); };
  }, [mobileOpen]);

  function handleLocale() {
    const nextLanguage: Language = language === 'en' ? 'fa' : 'en';
    setLanguage(nextLanguage);
    setMobileOpen(false);
    navigate(localizedPath(location.pathname + location.search + location.hash, nextLanguage));
  }

  function active(path: string) {
    if (path === '/') return currentPath === '/';
    const base = path.split('#')[0];
    return currentPath === base || currentPath.startsWith(base);
  }

  return <>
    <header className="platform-header">
      <div className="pathway-container platform-header__inner">
        <Link className="platform-brand" to={localizedPath('/', language)} aria-label={`${copy.brand} — ${copy.nav.home}`} onClick={() => setMobileOpen(false)}>
          <BrandMark className="platform-brand__mark" size={44} /><span className="platform-brand__word">Tech<span>Land</span></span>
        </Link>
        <nav id="primary-navigation" className={`platform-nav ${mobileOpen ? 'is-open' : ''}`} aria-label={copy.brand}>
          <div className="platform-nav__links">{navItems.map((item, index) => <Link key={item.path} className={`platform-nav__link ${active(item.path) ? 'is-active' : ''}`} to={localizedPath(item.path, language)} aria-current={active(item.path) ? 'page' : undefined} onClick={() => setMobileOpen(false)} ref={mobileOpen && index === 0 ? firstLinkRef : undefined}><span className="platform-nav__link-icon" aria-hidden="true"><item.Icon size={18} /></span><span className="platform-nav__link-label">{item.label}</span><ChevronRight className="platform-nav__link-arrow" size={16} aria-hidden="true" /></Link>)}
            <Link className="platform-nav__mobile-cta" to={localizedPath('/eligibility/', language)} onClick={() => setMobileOpen(false)}>{copy.nav.find}<ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </nav>
        <div className="platform-header__actions">
          <button className="platform-icon-action" type="button" onClick={() => setSearchOpen(true)} aria-label={copy.nav.search}><Search size={18} aria-hidden="true" /><span className="visually-hidden">{copy.nav.search}</span></button>
          <Link className="platform-icon-action platform-saved-action" to={localizedPath('/compare/', language)} aria-label={`${copy.nav.saved}: ${savedIds.length} ${copy.common.saved}, ${comparedIds.length} ${copy.common.compare}`}><Bookmark size={18} aria-hidden="true" /><span className="platform-saved-action__count">{savedIds.length + comparedIds.length}</span></Link>
          <button className="platform-language" type="button" onClick={handleLocale} aria-label={language === 'en' ? copy.nav.switchFa : copy.nav.switchEn}><span aria-hidden="true">{language === 'en' ? 'فا' : 'EN'}</span></button>
          <Link className="pathway-button platform-header__cta" to={localizedPath('/scholarships/', language)}>{copy.nav.find}<ArrowUpRight size={16} aria-hidden="true" /></Link>
          <button className="platform-menu-toggle" ref={menuButtonRef} type="button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? copy.nav.closeMenu : copy.nav.openMenu} aria-expanded={mobileOpen} aria-controls="primary-navigation">{mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
        </div>
      </div>
    </header>
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}
