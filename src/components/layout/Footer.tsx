import { useState } from 'react';
import { ArrowUp, ArrowUpRight, Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import BrandMark from '@/components/common/BrandMark';
import LegalDialog, { type LegalDoc } from '@/components/common/LegalDialog';
import { CONTACT, CONTACT_LABELS, address, hours } from '@/constants/contact';

export default function Footer() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const explore = [
    [copy.nav.scholarships, '/scholarships/'], [copy.nav.humanitarian, '/humanitarian/'],
    [copy.nav.visa, '/visa/'], [copy.nav.games, '/games/'], [copy.nav.search, '/#search'],
  ];
  const serviceLinks = [
    [copy.footer.about, '/services/#about'],
    [language === 'fa' ? 'همهٔ خدمات' : 'All services', '/services/'],
    [language === 'fa' ? 'عضویت با حساب‌پی' : 'Membership with HesabPay', '/payment/'],
    [copy.footer.contact, '/contact/'],
  ];
  const infoLinks: Array<[string, LegalDoc]> = [
    [copy.footer.privacy, 'privacy'], [copy.footer.terms, 'terms'], [copy.footer.disclaimer, 'disclaimer'],
  ];

  const scrollTop = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return <footer className="platform-footer" id="site-footer">
    <div className="pathway-container">
      <div className="platform-footer__top">
        <div className="platform-footer__brand-column"><Link className="platform-footer__logo" to={localizedPath('/', language)} aria-label={`${copy.brand} — ${copy.nav.home}`}><BrandMark variant="full" size={132} loading="lazy" /></Link><p>{copy.footer.brand}</p>
          <ul className="footer-channels">
            <li><Mail size={14} aria-hidden="true" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><Phone size={14} aria-hidden="true" /><a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phoneDisplay}</a></li>
            <li><MessageCircle size={14} aria-hidden="true" /><a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer">{CONTACT_LABELS.whatsapp[language]} · <span dir="ltr">{CONTACT.whatsappDisplay}</span></a></li>
            <li><Send size={14} aria-hidden="true" /><a href={CONTACT.telegramHref} target="_blank" rel="noreferrer">{CONTACT_LABELS.telegram[language]} · {CONTACT.telegramId}</a></li>
            <li><MapPin size={14} aria-hidden="true" /><a href={CONTACT.mapHref} target="_blank" rel="noreferrer">{address(language)}</a></li>
            <li><Clock size={14} aria-hidden="true" /><span>{CONTACT_LABELS.hours[language]}: {hours(language)}</span></li>
          </ul>
          <div className="footer-social">
            <a href={CONTACT.instagramHref} target="_blank" rel="noreferrer" aria-label={CONTACT_LABELS.instagram[language]}><Instagram size={16} aria-hidden="true" /></a>
            <a href={CONTACT.facebookHref} target="_blank" rel="noreferrer" aria-label={CONTACT_LABELS.facebook[language]}><Facebook size={16} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="platform-footer__column"><h2>{copy.footer.explore}</h2>{explore.map(([label, path]) => <Link key={path} to={localizedPath(path, language)}>{label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div>
        <div className="platform-footer__column"><h2>{copy.footer.services}</h2>{serviceLinks.map(([label, path]) => <Link key={`${path}-${label}`} to={localizedPath(path, language)}>{label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div>
        <div className="platform-footer__column"><h2>{copy.footer.information}</h2>{infoLinks.map(([label, doc]) => <button key={doc} type="button" className="footer-legal-link" onClick={() => setLegalDoc(doc)}>{label}</button>)}</div>
      </div>
      <div className="platform-footer__bottom">
        <p>{copy.footer.copyright}</p>
        <p>{copy.common.noGuarantee}</p>
        <button type="button" className="footer-back-top" onClick={scrollTop}>{copy.footer.returnTop}<ArrowUp size={14} aria-hidden="true" /></button>
      </div>
    </div>
    <LegalDialog doc={legalDoc} onClose={() => setLegalDoc(null)} />
  </footer>;
}
