import { useLanguage } from '@/hooks/useLanguage';
import { PAYMENT_PLANS, type PaymentPlan } from '@/lib/payments';
import { Check, Star, Zap } from 'lucide-react';

interface PaymentSectionProps {
  selectedPlanId?: string;
  onSelect?: (plan: PaymentPlan) => void;
  compact?: boolean;
  plans?: PaymentPlan[];
}

export default function PaymentSection({ selectedPlanId, onSelect, compact, plans }: PaymentSectionProps) {
  const { language } = useLanguage();
  const list = plans ?? PAYMENT_PLANS;

  return (
    <div className="opp-grid" style={compact ? undefined : { gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
      {list.map((plan) => {
        const name = plan.name[language];
        const features = plan.features[language];
        const selected = selectedPlanId === plan.id;
        return (
          <article
            key={plan.id}
            className="opp-card"
            style={selected ? { borderColor: '#2859a8', boxShadow: '0 17px 36px rgba(40,89,168,.14)' } : undefined}
            aria-current={selected ? 'true' : undefined}
          >
            <p className="pathway-eyebrow">
              {plan.isPopular ? (
                <><Star size={13} aria-hidden="true" /> {language === 'fa' ? 'محبوب‌ترین' : 'Most popular'}</>
              ) : plan.isBestValue ? (
                <><Zap size={13} aria-hidden="true" /> {language === 'fa' ? 'بهترین ارزش' : 'Best value'}</>
              ) : (
                <>{language === 'fa' ? 'پلن اشتراک' : 'Subscription plan'}</>
              )}
            </p>
            <h3 style={{ margin: '0 0 6px', color: '#07114f', fontSize: 19 }}>{name}</h3>
            <p style={{ margin: 0, color: '#07114f', fontSize: 28, fontWeight: 800 }}>
              ${plan.priceUSD.toFixed(2)}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#65718a' }}>
                {' '}
                {plan.period === 'lifetime'
                  ? language === 'fa' ? 'یک‌بار' : 'one-time'
                  : plan.period === 'monthly'
                    ? language === 'fa' ? '/ماه' : '/month'
                    : plan.period === 'quarterly'
                      ? language === 'fa' ? '/۳ ماه' : '/3 mo'
                      : language === 'fa' ? '/سال' : '/year'}
              </span>
            </p>
            {plan.originalPriceUSD && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9aa6b7', textDecoration: 'line-through' }}>
                ${plan.originalPriceUSD.toFixed(2)}
              </p>
            )}
            <ul style={{ margin: '14px 0', padding: 0, listStyle: 'none', display: 'grid', gap: 7 }}>
              {(compact ? features.slice(0, 4) : features).map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#52617a' }}>
                  <Check size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: '#267f79' }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {onSelect && (
              <button
                type="button"
                className={selected ? 'pathway-button' : 'pathway-button pathway-button--secondary'}
                onClick={() => onSelect(plan)}
                style={{ width: '100%' }}
              >
                {selected
                  ? language === 'fa' ? 'انتخاب شد' : 'Selected'
                  : language === 'fa' ? 'انتخاب پلن' : 'Choose plan'}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
