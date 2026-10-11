import { ArrowUpRight } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';

export default function AboutSection() {
  const { brand } = useLanguage();
  const copy = brand.about;

  return (
    <section id="about" className="section section--light section-anchor" aria-labelledby="about-title">
      <div className="site-container about-layout">
        <div className="about-intro">
          <SectionHeading titleId="about-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <a className="text-link" href="#services">
            {copy.servicesLink}<ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="about-content">
          <p className="about-supporting">{copy.supporting}</p>
          <p className="about-principles-label">{copy.principlesLabel}</p>
          <ol className="about-principles">
            {copy.principles.map((principle, index) => (
              <li className="about-principle" key={principle.title}>
                <span className="about-principle__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
