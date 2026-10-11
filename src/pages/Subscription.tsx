import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchModal from '@/components/features/SearchModal';
import SubscriptionSection from '@/components/features/SubscriptionSection';
import { useLanguage } from '@/hooks/useLanguage';
import { Check, Shield, Zap, Globe, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS_EN = [
  { q: 'What payment methods are accepted?', a: 'We accept USDT TRC20 for international users and HesabPay for users in Afghanistan.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. Your access will remain until the end of your billing period.' },
  { q: 'Do I get access to all content?', a: 'Yes, subscribers get unlimited access to all movies, series, downloads and premium features.' },
  { q: 'Is there a free trial?', a: 'Afghanistan users can watch movies and series online for free without a subscription.' },
  { q: 'What devices are supported?', a: 'TechLand works on all devices including computers, tablets, and smartphones.' },
];

const FAQS_FA = [
  { q: 'چه روش‌های پرداختی قبول می‌شود؟', a: 'برای کاربران بین‌المللی USDT TRC20 و برای کاربران افغانستان HesabPay قبول می‌شود.' },
  { q: 'آیا می‌توانم اشتراکم را لغو کنم؟', a: 'بله، می‌توانید در هر زمانی لغو کنید. دسترسی شما تا پایان دوره صورتحساب ادامه خواهد یافت.' },
  { q: 'آیا به تمام محتوا دسترسی دارم؟', a: 'بله، مشترکان دسترسی نامحدود به تمام فیلم‌ها، سریال‌ها، دانلودها و ویژگی‌های ویژه دارند.' },
  { q: 'آیا دوره آزمایشی رایگان وجود دارد؟', a: 'کاربران افغانستان می‌توانند بدون اشتراک فیلم و سریال را به صورت آنلاین تماشا کنند.' },
  { q: 'چه دستگاه‌هایی پشتیبانی می‌شوند؟', a: 'تک‌لند روی تمام دستگاه‌ها از جمله رایانه، تبلت و گوشی هوشمند کار می‌کند.' },
];

export default function SubscriptionsPage() {
  const { t, language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = language === 'fa' ? FAQS_FA : FAQS_EN;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="pt-16">
        {/* Hero */}
        <div className="relative py-20 circuit-bg border-b border-white/5 text-center">
          <div className="container mx-auto px-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 glass border border-primary/20 rounded-full text-xs font-medium text-primary mb-6">
              <Zap className="w-3 h-3" />
              {t.subscription.title}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">
              {t.subscription.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.subscription.subtitle}
            </p>
          </div>
        </div>

        {/* Features comparison */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Shield, title: language === 'fa' ? 'پرداخت امن' : 'Secure Payments', desc: language === 'fa' ? 'USDT TRC20 و HesabPay' : 'USDT TRC20 & HesabPay', color: 'text-green-400' },
                { icon: Zap, title: language === 'fa' ? 'فعال‌سازی فوری' : 'Instant Activation', desc: language === 'fa' ? 'دسترسی بلافاصله پس از پرداخت' : 'Access immediately after payment', color: 'text-primary' },
                { icon: Globe, title: language === 'fa' ? 'در همه جا' : 'Watch Anywhere', desc: language === 'fa' ? 'تمام دستگاه‌ها' : 'All Devices', color: 'text-brand-gold' },
              ].map((item, i) => (
                <div key={i} className={cn('flex items-start gap-4 glass rounded-2xl border border-white/5 p-5', isRTL && 'flex-row-reverse')}>
                  <div className={`p-3 glass rounded-xl ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <SubscriptionSection />

        {/* Regional Access */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className={cn('text-2xl font-bold text-foreground mb-6', isRTL ? 'text-right' : 'text-center')}>
              {language === 'fa' ? 'دسترسی منطقه‌ای' : 'Regional Access'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl border border-green-500/20 p-5">
                <span className="text-2xl block mb-3">🇦🇫</span>
                <h3 className="font-bold text-foreground mb-3">{language === 'fa' ? 'افغانستان' : 'Afghanistan'}</h3>
                <ul className="space-y-2">
                  {[
                    { ok: true, text: language === 'fa' ? 'تماشای آنلاین فیلم' : 'Watch movies online' },
                    { ok: true, text: language === 'fa' ? 'تماشای آنلاین سریال' : 'Watch series online' },
                    { ok: false, text: language === 'fa' ? 'دانلود فیلم (نیاز به اشتراک)' : 'Movie downloads (subscription)' },
                    { ok: false, text: language === 'fa' ? 'دانلود سریال (نیاز به اشتراک)' : 'Series downloads (subscription)' },
                  ].map((item, i) => (
                    <li key={i} className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
                      <Check className={cn('w-4 h-4 shrink-0', item.ok ? 'text-green-400' : 'text-muted-foreground')} />
                      <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl border border-primary/20 p-5">
                <Globe className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-3">{language === 'fa' ? 'بین‌المللی' : 'International'}</h3>
                <ul className="space-y-2">
                  {[
                    { ok: false, text: language === 'fa' ? 'تماشای آنلاین (نیاز به اشتراک)' : 'Streaming (requires subscription)' },
                    { ok: false, text: language === 'fa' ? 'دانلود (نیاز به اشتراک)' : 'Downloads (requires subscription)' },
                    { ok: true, text: language === 'fa' ? 'پرداخت با USDT TRC20' : 'Pay with USDT TRC20' },
                    { ok: true, text: language === 'fa' ? 'پشتیبانی کامل' : 'Full premium support' },
                  ].map((item, i) => (
                    <li key={i} className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
                      <Check className={cn('w-4 h-4 shrink-0', item.ok ? 'text-primary' : 'text-muted-foreground')} />
                      <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className={cn('text-2xl font-bold text-foreground mb-8', isRTL ? 'text-right' : 'text-center')}>
              {language === 'fa' ? 'سوالات متداول' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="glass rounded-xl border border-white/5 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={cn('w-full flex items-center justify-between p-4 text-left', isRTL && 'flex-row-reverse text-right')}
                  >
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <HelpCircle className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', openFaq === i && 'text-primary')} />
                  </button>
                  {openFaq === i && (
                    <div className={cn('px-4 pb-4 text-sm text-muted-foreground animate-fade-in', isRTL && 'text-right')}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
