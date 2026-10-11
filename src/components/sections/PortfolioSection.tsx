import { AppWindow, ArrowUpRight, Code2, MonitorSmartphone, PenTool, ShoppingBag, Wifi } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';

const projectIcons = [MonitorSmartphone, ShoppingBag, AppWindow, Code2, PenTool, Wifi];

export default function PortfolioSection() {
  const { brand } = useLanguage();
  const copy = brand.portfolio;
  return (
    <section id="portfolio" className="section section--soft section-anchor" aria-labelledby="portfolio-title">
      <div className="site-container">
        <div className="portfolio-heading-row">
          <SectionHeading titleId="portfolio-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <span className="portfolio-mark" aria-hidden="true"><ArrowUpRight size={22} /></span>
        </div>
        <div className="portfolio-grid">
          {copy.items.map((item, index) => {
            const Icon = projectIcons[index];
            return (
              <article className={`portfolio-card portfolio-card--${index + 1}`} key={item.title}>
                <div className="portfolio-card__visual" aria-hidden="true">
                  <span className="portfolio-card__shape portfolio-card__shape--one" />
                  <span className="portfolio-card__shape portfolio-card__shape--two" />
                  <Icon size={31} strokeWidth={1.5} />
                </div>
                <div className="portfolio-card__copy">
                  <span className="sample-project-badge">{copy.sample}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
