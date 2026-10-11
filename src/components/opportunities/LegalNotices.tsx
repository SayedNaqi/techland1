import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { useLanguage } from '@/hooks/useLanguage';

export function OpportunityLegalNotice({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  return <aside className={`legal-notice ${compact ? 'legal-notice--compact' : ''}`} role="note">
    <ShieldCheck size={20} aria-hidden="true" />
    <div><h2>{copy.common.disclaimerHeading}</h2><p>{copy.common.genericGuidance}</p><p>{copy.common.decisionNotice}</p></div>
  </aside>;
}

export function DemoDataNotice() {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  return <aside className="demo-notice" role="note"><AlertTriangle size={19} aria-hidden="true" /><p><strong>{copy.common.demo}</strong> {copy.common.dataNotice}</p></aside>;
}
