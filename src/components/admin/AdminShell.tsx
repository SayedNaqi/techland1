import type { ReactNode } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { localizedPath } from '@/constants/opportunityRoutes';
import { Link } from 'react-router-dom';

export interface AdminNavItem {
  key: string;
  labelEn: string;
  labelFa: string;
  count?: number;
}

interface AdminShellProps {
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
  nav: AdminNavItem[];
  active: string;
  onNavigate: (key: string) => void;
  children: ReactNode;
}

export default function AdminShell({ titleEn, titleFa, descEn, descFa, nav, active, onNavigate, children }: AdminShellProps) {
  const { language } = useLanguage();
  const title = language === 'fa' ? titleFa : titleEn;
  const desc = language === 'fa' ? descFa : descEn;

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p className="pathway-eyebrow">{language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'}</p>
          <h1>{title}</h1>
          <p>{desc}</p>
          <div className="pathway-demo-callout" role="note">
            <span aria-hidden="true">●</span>
            <span>
              {language === 'fa'
                ? 'تغییرات در همین مرورگر ذخیره می‌شود (پیش‌نمایش بدون سرور). هیچ دادهٔ حساسی وارد نکنید.'
                : 'Changes are stored in this browser only (serverless preview). Do not enter sensitive data.'}
            </span>
          </div>
          <p style={{ marginTop: 12 }}>
            <Link className="opp-link" to={localizedPath('/payment/', language)}>
              {language === 'fa' ? 'رفتن به بخش پرداخت' : 'Go to payment section'} →
            </Link>
          </p>
        </div>
      </section>

      <section className="pathway-section">
        <div className="pathway-container directory-layout">
          <aside className="directory-filters" aria-label={language === 'fa' ? 'بخش‌های مدیریت' : 'Admin sections'}>
            <div className="directory-filters__head">
              <h2>{language === 'fa' ? 'بخش‌ها' : 'Sections'}</h2>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {nav.map((item) => {
                const label = language === 'fa' ? item.labelFa : item.labelEn;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className="pathway-category"
                    aria-current={isActive ? 'page' : undefined}
                    style={
                      isActive
                        ? { borderColor: '#2859a8', background: '#edf3fb', color: '#07114f' }
                        : undefined
                    }
                  >
                    <span className="pathway-category__number">{isActive ? '●' : '○'}</span>
                    <span>{label}{typeof item.count === 'number' ? ` (${item.count})` : ''}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                );
              })}
            </div>
            <p className="directory-local-note">
              {language === 'fa'
                ? 'همهٔ بخش‌های سایت (بورسیه‌ها، بشردوستانه، ویزا، راهنماها) از اینجا قابل مدیریت است.'
                : 'All site sections (scholarships, humanitarian, visa, guides) can be managed here.'}
            </p>
          </aside>

          <div style={{ minWidth: 0 }}>{children}</div>
        </div>
      </section>
    </div>
  );
}
