import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';

interface CTASectionProps { onRequest: (service: ServiceSelection) => void }

export default function CTASection({ onRequest }: CTASectionProps) {
  const { brand } = useLanguage();
  const copy = brand.cta;
  return (
    <section className="cta-section" aria-labelledby="cta-title">
      <div className="cta-grid" aria-hidden="true" />
      <div className="site-container cta-inner">
        <span className="cta-icon" aria-hidden="true"><Sparkles size={22} /></span>
        <div className="cta-copy"><p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />TechLand</p><h2 id="cta-title">{copy.title}</h2><p>{copy.subtitle}</p></div>
        <div className="cta-actions">
          <button className="button button--light" type="button" onClick={() => onRequest('web-software')}>{copy.primary}<ArrowUpRight size={17} aria-hidden="true" /></button>
          <a className="button button--outline-light" href="#contact">{copy.secondary}</a>
        </div>
      </div>
    </section>
  );
}
