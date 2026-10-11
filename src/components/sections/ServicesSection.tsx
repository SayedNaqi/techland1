import { ArrowUpRight, Code2, Film, Gamepad2, GraduationCap, Package } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';

const serviceIcons = [Code2, Package, Gamepad2, Film, GraduationCap];

export default function ServicesSection() {
  const { brand } = useLanguage();
  const copy = brand.services;

  return (
    <section id="services" className="section section--soft section-anchor" aria-labelledby="services-title">
      <div className="site-container">
        <SectionHeading titleId="services-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <div className="services-grid">
          {copy.items.map((service, index) => {
            const Icon = serviceIcons[index];
            return (
              <article className={`service-card service-card--${service.id}`} key={service.id}>
                <div className="service-card__top">
                  <span className="icon-tile icon-tile--large" aria-hidden="true"><Icon size={22} /></span>
                  <span className="service-card__index">0{index + 1}</span>
                </div>
                <h3>{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <ul className="service-card__points">
                  {service.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <a className="card-link" href={`#${service.anchor}`} aria-label={`${copy.learnMore}: ${service.title}`}>
                  {copy.learnMore}<ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
