import { ArrowDown, ArrowUpRight, Code2, GraduationCap, Headphones } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const HERO_IMAGE = '/assets/techland-hero-v2.svg';

export default function HeroSection() {
  const { brand } = useLanguage();
  const c = brand.hero;

  return (
    <section id="home" className="hero-section section-anchor" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow hero-glow--one" aria-hidden="true" />
      <div className="hero-glow hero-glow--two" aria-hidden="true" />
      <div className="site-container hero-layout">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span className="status-pulse" aria-hidden="true" />{c.eyebrow}</p>
          <h1 id="hero-title">{c.title}</h1>
          <p className="hero-description">{c.description}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#services">
              {c.primary}<ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a className="button button--ghost-light" href="#contact">{c.secondary}</a>
          </div>
          <p className="hero-note"><span className="hero-note-line" aria-hidden="true" />{c.note}</p>
        </div>
        <div className="hero-art" aria-label={c.note}>
          <div className="hero-art-frame">
            <img
              className="hero-art-image"
              src={HERO_IMAGE}
              alt=""
              loading="eager"
              decoding="async"
            />
            <div className="hero-art-shade" aria-hidden="true" />
            <div className="hero-art-orbit hero-art-orbit--one" aria-hidden="true" />
            <div className="hero-art-orbit hero-art-orbit--two" aria-hidden="true" />
            <div className="hero-art-card hero-art-card--top">
              <span className="hero-art-icon"><Code2 size={18} aria-hidden="true" /></span>
              <span>{c.floatingOne}</span>
            </div>
            <div className="hero-art-card hero-art-card--middle">
              <span className="hero-art-icon hero-art-icon--cyan"><Headphones size={18} aria-hidden="true" /></span>
              <span>{c.floatingTwo}</span>
            </div>
            <div className="hero-art-card hero-art-card--bottom">
              <span className="hero-art-icon hero-art-icon--violet"><GraduationCap size={18} aria-hidden="true" /></span>
              <span>{c.floatingThree}</span>
            </div>
          </div>
          <a className="hero-scroll" href="#about">
            <span>{c.scroll}</span><ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
