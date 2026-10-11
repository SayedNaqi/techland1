import { ArrowUpRight, Check, Gamepad2, Monitor, Settings2 } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';

interface GamingSectionProps { onRequest: (service: ServiceSelection) => void }

export default function GamingSection({ onRequest }: GamingSectionProps) {
  const { brand } = useLanguage();
  const copy = brand.gaming;
  const categories = [
    { title: copy.pcTitle, description: copy.pcDescription, items: copy.pcServices, icon: Monitor, tone: 'blue' },
    { title: copy.playStationTitle, description: copy.playStationDescription, items: copy.playStationServices, icon: Gamepad2, tone: 'violet' },
  ];

  return (
    <section id="gaming" className="section section--gaming section-anchor" aria-labelledby="gaming-title">
      <div className="gaming-grid-bg" aria-hidden="true" />
      <div className="site-container gaming-content">
        <SectionHeading titleId="gaming-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} light />
        <div className="gaming-visual" aria-label={copy.visualLabel}>
          <div className="gaming-visual__screen"><span className="gaming-visual__screen-glow" /><span className="gaming-visual__screen-line" /></div>
          <div className="gaming-visual__tower"><span /><span /><span /></div>
          <div className="gaming-visual__controller"><Gamepad2 size={36} strokeWidth={1.45} aria-hidden="true" /></div>
          <div className="gaming-visual__signal gaming-visual__signal--one" />
          <div className="gaming-visual__signal gaming-visual__signal--two" />
          <div className="gaming-visual__caption"><Settings2 size={16} aria-hidden="true" />{copy.visualCaption}</div>
        </div>
        <div className="gaming-cards">
          {categories.map(({ title, description, items, icon: Icon, tone }) => (
            <article className={`gaming-card gaming-card--${tone}`} key={title}>
              <div className="gaming-card__heading">
                <span className="gaming-card__icon" aria-hidden="true"><Icon size={24} /></span>
                <span className="gaming-card__rule" aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <ul>
                {items.map((item) => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}
              </ul>
              <button className="button button--outline-light" type="button" onClick={() => onRequest('gaming')}>
                {copy.action}<ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
        <p className="gaming-note"><span aria-hidden="true">i</span>{copy.note}</p>
      </div>
    </section>
  );
}
