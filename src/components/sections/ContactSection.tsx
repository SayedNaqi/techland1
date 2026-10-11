import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, Clock, Instagram, Facebook, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';
import { CONTACT, CONTACT_LABELS, address, hours } from '@/constants/contact';

interface ContactSectionProps {
  selectedService: ServiceSelection | '';
  onServiceChange: (service: ServiceSelection | '') => void;
}

const optionValues: ServiceSelection[] = [
  'web-software', 'technology-accessories', 'gaming', 'movies-series', 'scholarships', 'visa-assistance', 'other',
];

export default function ContactSection({ selectedService, onServiceChange }: ContactSectionProps) {
  const { brand, isRTL, language } = useLanguage();
  const copy = brand.contact;
  const [status, setStatus] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      setStatus(copy.required);
      return;
    }
    const data = new FormData(form);
    const serviceIndex = optionValues.indexOf((data.get('service') as ServiceSelection) ?? 'other');
    const serviceLabel = serviceIndex >= 0 ? copy.serviceOptions[serviceIndex] : '';
    const subject = `[TechLand Contact] ${serviceLabel} — ${String(data.get('name') ?? '')}`;
    const body = `Name: ${String(data.get('name') ?? '')}\nEmail: ${String(data.get('email') ?? '')}\nPhone: ${String(data.get('phone') ?? '')}\nService: ${serviceLabel}\n\nMessage:\n${String(data.get('message') ?? '')}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(copy.openingMail);
  };

  return (
    <section id="contact" className="section section--light section-anchor" aria-labelledby="contact-title">
      <div className="site-container contact-layout">
        <div className="contact-intro">
          <SectionHeading titleId="contact-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <div className="contact-channel-card">
            <div className="contact-channel-icons" aria-hidden="true"><span><Mail size={17} /></span><span><Phone size={17} /></span><span><MessageCircle size={17} /></span><span><Send size={17} /></span><span><Instagram size={17} /></span><span><Facebook size={17} /></span></div>
            <p>{copy.contactPlaceholder}</p>
            <ul className="contact-channel-list">
              <li><Mail size={14} aria-hidden="true" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><Phone size={14} aria-hidden="true" /><a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phoneDisplay}</a></li>
              <li><MessageCircle size={14} aria-hidden="true" /><a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer">{CONTACT_LABELS.whatsapp[language]} · <span dir="ltr">{CONTACT.whatsappDisplay}</span></a></li>
              <li><Send size={14} aria-hidden="true" /><a href={CONTACT.telegramHref} target="_blank" rel="noreferrer">{CONTACT_LABELS.telegram[language]} · {CONTACT.telegramId}</a></li>
              <li><MapPin size={14} aria-hidden="true" /><a href={CONTACT.mapHref} target="_blank" rel="noreferrer">{address(language)}</a></li>
              <li><Clock size={14} aria-hidden="true" /><span>{CONTACT_LABELS.hours[language]}: {hours(language)}</span></li>
            </ul>
            <span className="contact-channel-card__note">{brand.footer.contactNotice}</span>
          </div>
          <p className="contact-disclosure"><span aria-hidden="true">i</span>{copy.notice}</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="contact-name">{copy.name}<span aria-hidden="true"> *</span></label>
            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder={copy.namePlaceholder} required onChange={() => setStatus('')} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="contact-email">{copy.email}<span aria-hidden="true"> *</span></label>
              <input id="contact-email" name="email" type="email" autoComplete="email" placeholder={copy.emailPlaceholder} dir="ltr" required onChange={() => setStatus('')} />
            </div>
            <div className="form-field">
              <label htmlFor="contact-phone">{copy.phone}</label>
              <input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder={copy.phonePlaceholder} dir="ltr" onChange={() => setStatus('')} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="contact-service">{copy.service}<span aria-hidden="true"> *</span></label>
            <select id="contact-service" name="service" value={selectedService} required onChange={(event) => { onServiceChange(event.target.value as ServiceSelection | ''); setStatus(''); }}>
              <option value="" disabled>{copy.choose}</option>
              {optionValues.map((value, index) => <option value={value} key={value}>{copy.serviceOptions[index]}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="contact-message">{copy.message}<span aria-hidden="true"> *</span></label>
            <textarea id="contact-message" name="message" rows={4} placeholder={copy.messagePlaceholder} required onChange={() => setStatus('')} />
          </div>
          <p className="contact-form-note">{copy.notice}</p>
          <button className="button button--primary contact-submit" type="submit">{copy.send}<ArrowUpRight size={17} aria-hidden="true" /></button>
          <p className="form-status" aria-live="polite" role="status" dir={isRTL ? 'rtl' : 'ltr'}>{status}</p>
        </form>
      </div>
    </section>
  );
}
