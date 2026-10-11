import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { localizedPath } from '@/constants/opportunityRoutes';
import PaymentSection from '@/components/features/PaymentSection';
import {
  PAYMENT_PLANS,
  listTransactions,
  recordHesabPayPayment,
  type PaymentPlan,
} from '@/lib/payments';
import { useSiteSettings } from '@/lib/adminStore';
import {
  currentUser,
  loginUser,
  logoutUser,
  registerUser,
  setUserSubscription,
  type UserProfile,
} from '@/lib/accounts';

export default function PaymentPage() {
  const { language } = useLanguage();
  const [plan, setPlan] = useState<PaymentPlan>(PAYMENT_PLANS[1]);
  const [user, setUser] = useState<UserProfile | null>(() => currentUser());
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneTx, setDoneTx] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const { settings } = useSiteSettings();

  const history = useMemo(() => listTransactions(), [historyVersion]);
  void historyVersion;
  const myHistory = user ? history.filter((t) => t.userId === user.id) : [];

  const qrSrc = settings.hesabpayQrImage || '/assets/hesabpay-qr.png';
  const [qrMissing, setQrMissing] = useState(false);
  useEffect(() => { setQrMissing(false); }, [qrSrc]);

  const submitPayment = () => {
    setError(null);
    if (!user) {
      setError(language === 'fa' ? 'اول پروفایل بسازید یا وارد شوید.' : 'Create a profile or sign in first.');
      return;
    }
    if (!reference.trim()) {
      setError(language === 'fa' ? 'شمارهٔ مرجع (رسید) حساب‌پی را وارد کنید.' : 'Enter your HesabPay reference number.');
      return;
    }
    setBusy(true);
    try {
      const tx = recordHesabPayPayment({
        planId: plan.id,
        userId: user.id,
        userName: user.name,
        email: user.email,
        reference,
      });
      setUserSubscription(user.id, plan.id, 'pending');
      setUser(currentUser());
      setDoneTx(tx.id);
      setReference('');
      setHistoryVersion((v) => v + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p className="pathway-eyebrow">{language === 'fa' ? 'اشتراک و پرداخت' : 'Subscription & payment'}</p>
          <h1>{language === 'fa' ? 'عضویت با حساب‌پی' : 'Membership with HesabPay'}</h1>
          <p>
            {language === 'fa'
              ? 'برای عضویت: ۱) پروفایل بسازید ۲) پلن را انتخاب کنید ۳) QR حساب‌پی را اسکن و پرداخت کنید ۴) شمارهٔ مرجع را ثبت کنید تا مدیر تأیید کند و عضویت‌تان فعال شود.'
              : 'To get membership: 1) create a profile 2) choose a plan 3) scan the HesabPay QR and pay 4) submit the reference number — an admin approves it and your membership activates.'}
          </p>
        </div>
      </section>

      <section className="pathway-section">
        <div className="pathway-container">
          {/* Step 1 — profile */}
          <div className="pathway-section__head">
            <div>
              <p className="pathway-eyebrow">{language === 'fa' ? '۱ — پروفایل کاربری' : '1 — User profile'}</p>
              <h2 style={{ margin: 0 }}>{language === 'fa' ? 'پروفایل شما' : 'Your profile'}</h2>
            </div>
          </div>
          {user ? (
            <div className="directory-filters" style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#07114f' }}>{user.name}</strong>
                  <span style={{ fontSize: 12, color: '#65718a' }}> · {user.email}</span>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#52617a' }}>
                    {language === 'fa' ? 'عضویت: ' : 'Membership: '}
                    <strong>{user.subscriptionPlanId ?? (language === 'fa' ? 'ندارد' : 'none')}</strong>
                    {' · '}
                    {user.subscriptionStatus ?? (language === 'fa' ? '—' : '—')}
                  </p>
                </div>
                <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 38 }} onClick={() => { logoutUser(); setUser(null); }}>
                  {language === 'fa' ? 'خروج' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <ProfileForms onAuth={(u) => setUser(u)} />
          )}

          {/* Step 2 — plan */}
          <div className="pathway-section__head">
            <div>
              <p className="pathway-eyebrow">{language === 'fa' ? '۲ — انتخاب پلن' : '2 — Select a plan'}</p>
              <h2 style={{ margin: 0 }}>{language === 'fa' ? 'پلن‌های اشتراک' : 'Subscription plans'}</h2>
            </div>
          </div>
          <PaymentSection selectedPlanId={plan.id} onSelect={setPlan} />

          {/* Step 3 — HesabPay QR */}
          <div className="pathway-split" style={{ marginTop: 28, alignItems: 'start' }}>
            <div className="quick-match-form">
              <h2>{language === 'fa' ? '۳ — پرداخت با حساب‌پی' : '3 — Pay with HesabPay'}</h2>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {qrMissing ? (
                  <div style={{ width: 210, minHeight: 210, border: '2px dashed #b3261e', borderRadius: 16, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, textAlign: 'center', fontSize: 12, color: '#7a1f1a' }}>
                    {language === 'fa'
                      ? 'QR حساب‌پی هنوز تنظیم نشده است. مدیر باید از پنل ادمین → تنظیمات، تصویر QR را آپلود کند.'
                      : 'HesabPay QR is not configured yet. The admin must upload the QR image via Admin → Settings.'}
                  </div>
                ) : (
                  <img
                    src={qrSrc}
                    alt="HesabPay QR"
                    style={{ width: 210, height: 210, objectFit: 'contain', border: '1px solid #dfe6ef', borderRadius: 16, background: '#fff' }}
                    onError={() => setQrMissing(true)}
                  />
                )}
                <div style={{ flex: '1 1 200px', display: 'grid', gap: 8, fontSize: 13, color: '#35445d' }}>
                  <p style={{ margin: 0 }}>
                    <strong>{settings.hesabpayAccountLabel || 'HesabPay'}</strong>
                    <br />
                    {language === 'fa' ? 'پلن: ' : 'Plan: '}<strong>{plan.name[language]}</strong>
                    {' · '}
                    {language === 'fa' ? 'مبلغ: ' : 'Amount: '}<strong>${plan.priceUSD.toFixed(2)}</strong>
                  </p>
                  <ol style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 4, fontSize: 12 }}>
                    <li>{language === 'fa' ? 'اپ حساب‌پی را باز کنید و QR را اسکن کنید.' : 'Open the HesabPay app and scan the QR.'}</li>
                    <li>{language === 'fa' ? `مبلغ $${plan.priceUSD.toFixed(2)} را پرداخت کنید.` : `Pay $${plan.priceUSD.toFixed(2)}.`}</li>
                    <li>{language === 'fa' ? 'شمارهٔ مرجع / رسید را در کادر زیر وارد و ثبت کنید.' : 'Enter the reference / receipt number below and submit.'}</li>
                  </ol>
                </div>
              </div>

              <div className="pathway-field">
                <label>
                  {language === 'fa' ? 'شمارهٔ مرجع حساب‌پی' : 'HesabPay reference number'}
                  <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={language === 'fa' ? 'مثلاً HP-123456' : 'e.g. HP-123456'} dir="ltr" />
                </label>
              </div>
              {error && <p style={{ color: '#b3261e', fontSize: 12, margin: 0 }}>{error}</p>}
              {doneTx && (
                <p style={{ color: '#267f79', fontSize: 12, margin: 0 }}>
                  {language === 'fa'
                    ? `✓ پرداخت شما ثبت شد (${doneTx}) و در انتظار تأیید مدیر است.`
                    : `✓ Your payment was recorded (${doneTx}) and is pending admin approval.`}
                </p>
              )}
              <button type="button" className="pathway-button" onClick={submitPayment} disabled={busy || !user}>
                {busy ? (language === 'fa' ? 'در حال ثبت…' : 'Submitting…') : language === 'fa' ? 'ثبت پرداخت' : 'Submit payment'}
              </button>
              {!user && (
                <p className="pathway-fineprint">
                  {language === 'fa' ? 'برای ثبت پرداخت اول وارد پروفایل شوید.' : 'Sign in to your profile before submitting a payment.'}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ color: '#07114f', marginTop: 0 }}>{language === 'fa' ? 'پرداخت‌های من' : 'My payments'}</h3>
              <div className="compare-table-wrap">
                <table className="compare-table">
                  <thead><tr><th>{language === 'fa' ? 'پلن' : 'Plan'}</th><th>{language === 'fa' ? 'مرجع' : 'Reference'}</th><th>{language === 'fa' ? 'مبلغ' : 'Amount'}</th><th>{language === 'fa' ? 'وضعیت' : 'Status'}</th></tr></thead>
                  <tbody>
                    {myHistory.map((t) => (
                      <tr key={t.id}>
                        <td>{t.planId}</td>
                        <td><code style={{ fontSize: 11 }}>{t.reference}</code></td>
                        <td>${t.amountUSD.toFixed(2)}</td>
                        <td>{t.status}</td>
                      </tr>
                    ))}
                    {myHistory.length === 0 && (
                      <tr><td colSpan={4}>{user ? (language === 'fa' ? 'هنوز پرداختی ثبت نکرده‌اید.' : 'You have no payments yet.') : (language === 'fa' ? 'وارد شوید تا تاریخچه را ببینید.' : 'Sign in to see your history.')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 12 }}>
                <Link className="opp-link" to={localizedPath('/admin/', language)}>
                  {language === 'fa' ? 'ورود ادمین' : 'Admin sign in'} →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Profile register / login ---------- */

function ProfileForms({ onAuth }: { onAuth: (u: UserProfile) => void }) {
  const { language } = useLanguage();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (mode === 'register') {
      const res = registerUser(name, email, password);
      if (!res.ok) {
        setError(
          res.error === 'exists'
            ? language === 'fa' ? 'این ایمیل قبلاً ثبت شده است؛ وارد شوید.' : 'This email is already registered; sign in instead.'
            : res.error === 'password'
              ? language === 'fa' ? 'رمز عبور حداقل ۶ حرف باشد.' : 'Password must be at least 6 characters.'
              : language === 'fa' ? 'نام و ایمیل معتبر وارد کنید.' : 'Enter a valid name and email.',
        );
        return;
      }
      if (res.user) onAuth(res.user);
    } else {
      const res = loginUser(email, password);
      if (!res.ok || !res.user) {
        setError(language === 'fa' ? 'ایمیل یا رمز عبور اشتباه است.' : 'Wrong email or password.');
        return;
      }
      onAuth(res.user);
    }
  };

  return (
    <div className="quick-match-form" style={{ marginBottom: 22, maxWidth: 520 }}>
      <div className="guide-filters">
        <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setError(null); }}>
          {language === 'fa' ? 'ساخت پروفایل' : 'Create profile'}
        </button>
        <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setError(null); }}>
          {language === 'fa' ? 'ورود' : 'Sign in'}
        </button>
      </div>
      {mode === 'register' && (
        <div className="pathway-field">
          <label>
            {language === 'fa' ? 'نام کامل' : 'Full name'}
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        </div>
      )}
      <div className="pathway-field">
        <label>
          {language === 'fa' ? 'ایمیل' : 'Email'}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
        </label>
      </div>
      <div className="pathway-field">
        <label>
          {language === 'fa' ? 'رمز عبور' : 'Password'}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" />
        </label>
      </div>
      {error && <p style={{ color: '#b3261e', fontSize: 12, margin: 0 }}>{error}</p>}
      <button type="button" className="pathway-button" onClick={submit}>
        {mode === 'register' ? (language === 'fa' ? 'ساخت پروفایل' : 'Create profile') : (language === 'fa' ? 'ورود' : 'Sign in')}
      </button>
    </div>
  );
}
