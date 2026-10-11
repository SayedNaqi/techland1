import { useState } from 'react';
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';
import ContactSection from '@/components/sections/ContactSection';
import { platformCopy } from '@/constants/platformCopy';
import { CONTACT, CONTACT_LABELS, address, hours } from '@/constants/contact';

export default function ContactPage() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const [selectedService, setSelectedService] = useState<ServiceSelection | ''>('');

  const cards = [
    { Icon: Mail, label: CONTACT_LABELS.email[language], value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { Icon: Phone, label: CONTACT_LABELS.phone[language], value: CONTACT.phoneDisplay, href: CONTACT.phoneHref, ltr: true },
    { Icon: MessageCircle, label: CONTACT_LABELS.whatsapp[language], value: `${CONTACT.whatsappDisplay} · ${CONTACT.whatsappHref.replace('https://', '')}`, href: CONTACT.whatsappHref },
    { Icon: Send, label: CONTACT_LABELS.telegram[language], value: CONTACT.telegramId, href: CONTACT.telegramHref },
    { Icon: Instagram, label: CONTACT_LABELS.instagram[language], value: '@tech_laand', href: CONTACT.instagramHref },
    { Icon: Facebook, label: CONTACT_LABELS.facebook[language], value: 'TechLand', href: CONTACT.facebookHref },
    { Icon: MapPin, label: CONTACT_LABELS.address[language], value: address(language), href: CONTACT.mapHref },
    { Icon: Clock, label: CONTACT_LABELS.hours[language], value: hours(language) },
  ];

  return <div className="pathway-page contact-route">
    <section className="pathway-page-intro">
      <div className="pathway-container">
        <p className="pathway-eyebrow">{copy.nav.contact}</p>
        <h1>{copy.nav.contact} TechLand</h1>
        <p>{language === 'fa' ? 'از هر یک از این راه‌ها با تک‌لند در تماس شوید — ایمیل، تلفن، واتس‌اپ، تلگرام یا مراجعه حضوری در کابل.' : 'Reach TechLand through any of these channels — email, phone, WhatsApp, Telegram, or visit us in Kabul.'}</p>
      </div>
    </section>
    <section className="pathway-section" style={{ paddingBlockStart: 40 }}>
      <div className="pathway-container">
        <div className="opp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {cards.map((card) => (
            <article key={card.label} className="opp-card">
              <p className="pathway-eyebrow"><card.Icon size={13} aria-hidden="true" /> {card.label}</p>
              {card.href ? (
                <a
                  href={card.href}
                  {...(card.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                  {...(card.ltr ? { dir: 'ltr' } : {})}
                  style={{ color: '#07114f', fontWeight: 750, fontSize: 14, overflowWrap: 'anywhere' }}
                >
                  {card.value}
                </a>
              ) : (
                <p style={{ margin: 0, color: '#07114f', fontWeight: 750, fontSize: 14 }}>{card.value}</p>
              )}
            </article>
          ))}
        </div>
        <p className="pathway-demo-callout" style={{ marginBlockStart: 18 }}>
          <span aria-hidden="true">●</span>
          <span>{language === 'fa' ? 'فرم زیر برنامهٔ ایمیل شما را با پیام آماده باز می‌کند. اسناد هویتی، گذرواژه‌ها، معلومات مالی یا اسناد خصوصی را وارد نکنید.' : 'The form below opens your email app with a ready message. Do not enter identity documents, passwords, financial details, or private files.'}</span>
        </p>
      </div>
    </section>
    <ContactSection selectedService={selectedService} onServiceChange={setSelectedService} />
  </div>;
}
