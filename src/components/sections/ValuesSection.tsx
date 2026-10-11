import { Compass, Layers3, MessageCircle, ShieldCheck } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';

const valueIcons = [Compass, Layers3, MessageCircle, ShieldCheck];

export default function ValuesSection() {
  const { brand } = useLanguage();
  const copy = brand.values;
  return (
    <section id="why-techland" className="section section--light section-anchor" aria-labelledby="values-title">
      <div className="site-container">
        <SectionHeading titleId="values-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <div className="values-grid">
          {copy.items.map((item, index) => {
            const Icon = valueIcons[index];
            return (
              <article className="value-card" key={item.title}>
                <span className="value-card__icon" aria-hidden="true"><Icon size={21} /></span>
                <p className="value-card__index">0{index + 1}</p>
                <h3>{item.title}</h3>
                <p className="value-card__description">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
