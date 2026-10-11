import { Check, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS } from '@/constants/mockData';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function SubscriptionSection() {
  const { t, language, isRTL } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (planId: string) => {
    if (!isLoggedIn) {
      toast.info('Please sign in to subscribe');
      navigate(`/${language}/login`);
      return;
    }
    toast.success('Redirecting to payment...');
  };

  const periodLabel = (period: string) => {
    const labels: Record<string, string> = {
      monthly: t.subscription.perMonth,
      quarterly: t.subscription.perQuarter,
      yearly: t.subscription.perYear,
      lifetime: ` ${t.subscription.oneTime}`,
    };
    return labels[period] || '';
  };

  return (
    <section className="py-16 circuit-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn('text-center mb-12', isRTL && 'text-right sm:text-center')}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 glass border border-primary/20 rounded-full text-xs font-medium text-primary mb-4">
            <Zap className="w-3 h-3" />
            {t.subscription.title}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
            {t.subscription.title}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t.subscription.subtitle}
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const name = language === 'fa' ? plan.nameFa : plan.name;
            const features = language === 'fa' ? plan.featuresFa : plan.features;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.02]',
                  plan.isPopular
                    ? 'glass-strong border-primary/40 ring-1 ring-primary/20'
                    : plan.isBestValue
                    ? 'glass-strong border-brand-gold/40 ring-1 ring-brand-gold/20'
                    : 'glass border-white/10'
                )}
              >
                {/* Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold gradient-brand text-white rounded-full whitespace-nowrap">
                      <Star className="w-3 h-3 fill-white" />
                      {t.subscription.mostPopular}
                    </span>
                  </div>
                )}
                {plan.isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-brand-gold text-background rounded-full whitespace-nowrap">
                      <Zap className="w-3 h-3" />
                      {t.subscription.bestValue}
                    </span>
                  </div>
                )}

                {/* Name */}
                <h3 className={cn('text-base font-bold text-foreground mb-1', (plan.isPopular || plan.isBestValue) && 'mt-3')}>
                  {name}
                </h3>

                {/* Price */}
                <div className={cn('flex items-end gap-1 mb-4', isRTL && 'flex-row-reverse')}>
                  <span className={cn(
                    'text-3xl font-black',
                    plan.isPopular ? 'text-primary' : plan.isBestValue ? 'text-brand-gold' : 'text-foreground'
                  )}>
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground pb-1">{periodLabel(plan.period)}</span>
                </div>

                {/* Original Price */}
                {plan.originalPrice && (
                  <p className="text-xs text-muted-foreground line-through -mt-3 mb-3">
                    {formatPrice(plan.originalPrice, plan.currency)}
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleGetStarted(plan.id)}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-sm font-semibold transition-all mb-5',
                    plan.isPopular
                      ? 'gradient-brand text-white hover:opacity-90 glow-cyan'
                      : plan.isBestValue
                      ? 'bg-brand-gold text-background hover:opacity-90'
                      : 'glass border border-white/10 text-foreground hover:bg-white/10'
                  )}
                >
                  {t.subscription.getStarted}
                </button>

                {/* Features */}
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className={cn('flex items-start gap-2 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                      <Check className={cn(
                        'w-3.5 h-3.5 shrink-0 mt-0.5',
                        plan.isPopular ? 'text-primary' : plan.isBestValue ? 'text-brand-gold' : 'text-green-400'
                      )} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
