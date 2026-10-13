import { opportunityRecords } from '@/data/opportunities';
import type { RouteInfo } from '@/types/opportunity';
import DirectoryPage from '@/components/opportunities/DirectoryPage';
import OpportunityDetailPage from '@/components/opportunities/OpportunityDetailPage';
import ComparePage from '@/pages/ComparePage';
import EligibilityPage from '@/pages/EligibilityPage';
import GuideDetailPage from '@/pages/GuideDetailPage';
import GuidesPage from '@/pages/GuidesPage';
import HomePage from '@/pages/HomePage';
import ScamAlertPage from '@/pages/ScamAlertPage';
import ServicesPage from '@/pages/ServicesPage';
import ContactPage from '@/pages/ContactPage';
import VisaPage from '@/pages/VisaPage';
import AdminPage from '@/pages/AdminPage';
import PaymentPage from '@/pages/PaymentPage';
import VideosPage from '@/pages/VideosPage';
import VideoDetailPage from '@/pages/VideoDetailPage';
import GamesPage from '@/pages/GamesPage';
import { useLanguage } from '@/hooks/useLanguage';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { Link } from 'react-router-dom';

export default function PageView({ route }: { route: RouteInfo }) {
  const { language } = useLanguage();
  switch (route.page) {
    case 'home': return <HomePage />;
    case 'scholarships': return <DirectoryPage kind="scholarship" />;
    case 'humanitarian': return <DirectoryPage kind="humanitarian" />;
    case 'scholarship-detail':
    case 'humanitarian-detail': {
      const kind = route.page === 'scholarship-detail' ? 'scholarship' : 'humanitarian';
      const record = opportunityRecords.find((item) => item.kind === kind && item.slug === route.slug);
      return <OpportunityDetailPage record={record} />;
    }
    case 'visa': return <VisaPage />;
    case 'eligibility': return <EligibilityPage />;
    case 'guides': return <GuidesPage />;
    case 'guide-detail': return <GuideDetailPage slug={route.slug} />;
    case 'scam-alert': return <ScamAlertPage />;
    case 'compare': return <ComparePage />;
    case 'services': return <ServicesPage />;
    case 'contact': return <ContactPage />;
    case 'admin': return <AdminPage />;
    case 'payment': return <PaymentPage />;
    case 'movies': return <VideosPage kind="movie" />;
    case 'series': return <VideosPage kind="series" />;
    case 'video-detail': return <VideoDetailPage slug={route.slug ?? ''} />;
    case 'games': return <GamesPage />;
    default: {
      const copy = platformCopy[language];
      return <div className="pathway-container pathway-not-found"><p className="pathway-eyebrow">404</p><h1>{copy.common.notFound}</h1><Link className="pathway-button" to={localizedPath('/', language)}>{copy.common.goHome}</Link></div>;
    }
  }
}
