import { ArrowUpRight, Cable, Gamepad2, HardDrive, Headphones, Keyboard, Laptop, Smartphone, Wifi } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';

interface TechnologySectionProps { onRequest: (service: ServiceSelection) => void }
const categoryIcons = [Keyboard, Gamepad2, Smartphone, Laptop, HardDrive, Wifi];
const exampleIcons = [Keyboard, Headphones, Cable];

export default function TechnologySection({ onRequest }: TechnologySectionProps) {
  const { brand } = useLanguage();
  const copy = brand.technology;

  return (
    <section id="technology" className="section section--light section-anchor" aria-labelledby="technology-title">
      <div className="site-container">
        <div className="section-heading-row">
          <SectionHeading titleId="technology-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <p className="showcase-note"><span className="showcase-note__dot" aria-hidden="true" />{copy.note}</p>
        </div>
        <div className="technology-grid">
          {copy.categories.map((category, index) => {
            const Icon = categoryIcons[index];
            const ExampleIcon = exampleIcons[index % exampleIcons.length];
            return (
              <article className="technology-card" key={category.title}>
                <div className="technology-card__visual" aria-hidden="true">
                  <span className="technology-card__halo" />
                  <Icon size={36} strokeWidth={1.5} />
                  <span className="technology-card__mini-icon"><ExampleIcon size={17} /></span>
                </div>
                <div className="technology-card__content">
                  <p className="technology-card__examples">{category.examples}</p>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <button className="card-link card-link--button" type="button" onClick={() => onRequest('technology-accessories')}>
                    {copy.request}<ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
