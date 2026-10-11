import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/sections/AboutSection';
import CTASection from '@/components/sections/CTASection';
import ContactSection from '@/components/sections/ContactSection';
import EntertainmentSection from '@/components/sections/EntertainmentSection';
import GamingSection from '@/components/sections/GamingSection';
import HeroSection from '@/components/sections/HeroSection';
import OpportunitiesSection from '@/components/sections/OpportunitiesSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import ServicesSection from '@/components/sections/ServicesSection';
import SoftwareSection from '@/components/sections/SoftwareSection';
import TechnologySection from '@/components/sections/TechnologySection';
import ValuesSection from '@/components/sections/ValuesSection';
import { useLanguage } from '@/hooks/useLanguage';
import type { ServiceSelection } from '@/types/brand';

export default function Index() {
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceSelection | ''>('');

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('#main-content > section:not(#home)'));
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -16px 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const requestService = useCallback((service: ServiceSelection) => {
    setSelectedService(service);
    const behavior: ScrollBehavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById('contact')?.scrollIntoView({ behavior, block: 'start' });
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{language === 'fa' ? 'رفتن به محتوای اصلی' : 'Skip to main content'}</a>
      <Header />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <SoftwareSection onRequest={requestService} />
        <TechnologySection onRequest={requestService} />
        <GamingSection onRequest={requestService} />
        <EntertainmentSection />
        <OpportunitiesSection onRequest={requestService} />
        <ValuesSection />
        <PortfolioSection />
        <CTASection onRequest={requestService} />
        <ContactSection selectedService={selectedService} onServiceChange={setSelectedService} />
      </main>
      <Footer />
    </div>
  );
}
