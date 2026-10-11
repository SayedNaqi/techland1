import { ArrowUpRight, BookOpenCheck, FileCheck2, GraduationCap, HeartHandshake, Landmark } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';

interface OpportunitiesSectionProps { onRequest: (service: ServiceSelection) => void }
const categoryIcons = [GraduationCap, Landmark, BookOpenCheck, HeartHandshake, FileCheck2];

export default function OpportunitiesSection({ onRequest }: OpportunitiesSectionProps) {
  const { brand } = useLanguage();
  const copy = brand.opportunities;

  return (
    <section id="scholarships" className="section section--soft section-anchor" aria-labelledby="scholarships-title">
      <div className="site-container opportunities-layout">
        <div className="opportunities-intro">
          <SectionHeading titleId="scholarships-title" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <div className="disclaimer-card" role="note">
            <span className="disclaimer-card__icon" aria-hidden="true"><BookOpenCheck size={20} /></span>
            <p>{copy.disclaimer}</p>
          </div>
          <p className="opportunities-note">{copy.note}</p>
          <button className="button button--primary" type="button" onClick={() => onRequest('scholarships')}>
            {copy.action}<ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="opportunities-detail">
          <div className="opportunity-category-list">
            {copy.categories.map((category, index) => {
              const Icon = categoryIcons[index];
              return <div className="opportunity-category" key={category}><span className="opportunity-category__icon" aria-hidden="true"><Icon size={18} /></span><span>{category}</span></div>;
            })}
          </div>
          <div className="opportunity-process">
            <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />{copy.steps[0]} → {copy.steps[copy.steps.length - 1]}</p>
            <ol>
              {copy.steps.map((step, index) => (
                <li key={step}><span className="opportunity-step-number">0{index + 1}</span><span>{step}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
