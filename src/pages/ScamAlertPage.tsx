import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleAlert, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { platformCopy } from '@/constants/platformCopy';
import { localizedPath } from '@/constants/opportunityRoutes';
import { OpportunityLegalNotice } from '@/components/opportunities/LegalNotices';

export default function ScamAlertPage() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  return <div className="pathway-page">
    <section className="pathway-page-intro"><div className="pathway-container"><p className="pathway-eyebrow">{copy.nav.guides}</p><h1>{copy.scam.title}</h1><p>{copy.scam.description}</p><div className="scam-guarantee"><ShieldAlert size={24} aria-hidden="true" /><strong>{copy.scam.warning}</strong></div></div></section>
    <section className="pathway-section"><div className="pathway-container scam-layout">
      <article className="scam-panel"><h2><CircleAlert size={20} aria-hidden="true" />{copy.scam.signsTitle}</h2><ul>{copy.scam.signs.map((sign) => <li key={sign}>{sign}</li>)}</ul></article>
      <article className="scam-panel scam-panel--safe"><h2>{copy.scam.actionsTitle}</h2><ol>{copy.scam.actions.map((action) => <li key={action}>{action}</li>)}</ol><Link className="opp-link" to={localizedPath('/guides/avoid-scholarship-scams/', language)}>{copy.common.learn}<ArrowUpRight size={16} aria-hidden="true" /></Link></article>
      <OpportunityLegalNotice compact />
    </div></section>
  </div>;
}
