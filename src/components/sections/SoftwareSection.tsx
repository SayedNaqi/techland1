import { ArrowUpRight, AppWindow, Code2, LayoutTemplate, MonitorCog, ShoppingBag, Wrench } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';

interface SoftwareSectionProps { onRequest: (service: ServiceSelection) => void }
const serviceIcons = [MonitorCog, ShoppingBag, AppWindow, Code2, LayoutTemplate, Wrench];

export default function SoftwareSection({ onRequest }: SoftwareSectionProps) {
  const { brand } = useLanguage();
  const copy = brand.software;

  return (
    <section id="web-software" className="section section--dark section-anchor" aria-labelledby="software-title">
      <div className="site-container">
        <SectionHeading titleId="software-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} light />
        <div className="software-layout">
          <div className="software-service-grid">
            {copy.items.map((item, index) => {
              const Icon = serviceIcons[index];
              return (
                <article className="software-service" key={item}>
                  <span className="software-service__icon" aria-hidden="true"><Icon size={20} /></span>
                  <h3>{item}</h3>
                  <span className="software-service__line" aria-hidden="true" />
                </article>
              );
            })}
          </div>
          <div className="process-panel">
            <div className="process-panel__heading">
              <div><p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />{copy.processTitle}</p><p>{copy.processDescription}</p></div>
              <span className="process-panel__mark" aria-hidden="true"><Code2 size={22} /></span>
            </div>
            <ol className="process-list">
              {copy.steps.map((step, index) => (
                <li key={step}>
                  <span className="process-step-number">0{index + 1}</span>
                  <span>{step}</span>
                  {index < copy.steps.length - 1 && <span className="process-step-connector" aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <button className="button button--primary" type="button" onClick={() => onRequest('web-software')}>
              {copy.action}<ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
