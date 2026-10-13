import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import AdminShell from '@/components/admin/AdminShell';
import FormModal, { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormModal';
import PaymentSection from '@/components/features/PaymentSection';
import {
  useGuidesAdmin,
  useOpportunitiesAdmin,
  useSiteSettings,
  useVisaAdmin,
  exportJson,
} from '@/lib/adminStore';
import {
  listTransactions,
  updateTransactionStatus,
  usePlans,
  type PaymentPlan,
  type PaymentStatus,
} from '@/lib/payments';
import {
  adminLogin,
  adminLogout,
  changeAdminCreds,
  deleteUser,
  getAdminUsername,
  isAdminAuthed,
  listUsers,
  setUserSubscription,
} from '@/lib/accounts';
import {
  apiAdminAds,
  apiAdminLogin,
  apiAdminPlans,
  apiAdminStats,
  apiAdminTransactions,
  apiAdminUsers,
  apiAdminVideos,
  apiChangeAdminCreds,
  apiCreateAd,
  apiCreatePlan,
  apiCreateVideo,
  apiDeleteAd,
  apiDeletePlan,
  apiDeleteUser,
  apiDeleteVideo,
  apiSetSubscription,
  apiSetTxStatus,
  apiUpdateAd,
  apiUpdatePlan,
  apiUpdateVideo,
  apiUploadVideoFile,
  getAdminToken,
  isBackendEnabled,
  setAdminToken,
  type AdInput,
  type AdminStats,
  type ApiAd,
  type ApiPlan,
  type ApiTx,
  type ApiUser,
  type ApiVideo,
  type PlanInput,
  type VideoInput,
} from '@/lib/api';
import { detectSource, MOCK_VIDEO_FALLBACK, normalizeEmbedUrl } from '@/lib/videos';
import type { GuideRecord, OpportunityRecord, VisaTopic } from '@/types/opportunity';

type SectionKey = 'dashboard' | 'opportunities' | 'guides' | 'visa' | 'videos' | 'users' | 'payments' | 'plans' | 'ads' | 'settings';

const emptyOpp = (slug: string): OpportunityRecord => ({
  id: `custom-${Date.now()}`,
  slug: slug || `custom-${Date.now()}`,
  kind: 'scholarship',
  status: 'demo',
  title: { en: '', fa: '' },
  organization: { en: '', fa: '' },
  country: { en: '', fa: '' },
  degreeLevel: { en: '', fa: '' },
  field: { en: '', fa: '' },
  fundingType: { en: '', fa: '' },
  description: { en: '', fa: '' },
  eligibilitySummary: { en: '', fa: '' },
  eligibleNationalities: null,
  languageRequirements: null,
  ieltsMinimum: null,
  ageRequirement: null,
  applicationFee: null,
  deadline: null,
  officialSourceName: null,
  officialSourceUrl: null,
  verifiedAt: null,
  details: {
    about: { en: '', fa: '' },
    funding: { en: '', fa: '' },
    eligibleCountries: { en: '', fa: '' },
    academicRequirements: { en: '', fa: '' },
    languageRequirements: { en: '', fa: '' },
    ageRequirements: { en: '', fa: '' },
    requiredDocuments: { en: '', fa: '' },
    applicationProcess: { en: '', fa: '' },
    importantDates: { en: '', fa: '' },
    selectionProcess: { en: '', fa: '' },
    faqs: { en: '', fa: '' },
    searchTerms: { en: '', fa: '' },
  },
});

export default function AdminPage() {
  const { language } = useLanguage();
  const [authed, setAuthed] = useState(() => (isBackendEnabled ? !!getAdminToken() : isAdminAuthed()));

  if (!authed) {
    return <AdminLogin onDone={() => setAuthed(true)} />;
  }

  return (
    <AdminApp
      language={language}
      onLogout={() => {
        adminLogout();
        setAdminToken(null);
        setAuthed(false);
      }}
    />
  );
}

/* ---------------- Login gate ---------------- */

function AdminLogin({ onDone }: { onDone: () => void }) {
  const { language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mustChange, setMustChange] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (isBackendEnabled) {
        // Secure path: bcrypt + JWT verified by Postgres-backed API. Password never stored in browser.
        const res = await apiAdminLogin(username, password);
        setAdminToken(res.token);
        setMustChange(res.mustChangePassword);
        if (!res.mustChangePassword) {
          setError(false);
          onDone();
        } else {
          // First login with bootstrap password: let admin in but force Settings change.
          setError(false);
          onDone();
        }
      } else if (adminLogin(username, password)) {
        setError(false);
        onDone();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pathway-page">
      <section className="pathway-page-intro">
        <div className="pathway-container">
          <p className="pathway-eyebrow">{language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'}</p>
          <h1>{language === 'fa' ? 'ورود مدیر' : 'Admin sign in'}</h1>
          <p>
            {language === 'fa'
              ? 'برای مدیریت بخش‌های سایت، نام کاربری و رمز عبور ادمین لازم است.'
              : 'An admin username and password are required to manage the site.'}
          </p>
        </div>
      </section>
      <section className="pathway-section">
        <div className="pathway-container" style={{ maxWidth: 440 }}>
          <div className="quick-match-form">
            <h2>{language === 'fa' ? 'ورود' : 'Sign in'}</h2>
            <div className="pathway-field">
              <label>
                {language === 'fa' ? 'نام کاربری' : 'Username'}
                <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" dir="ltr" />
              </label>
            </div>
            <div className="pathway-field">
              <label>
                {language === 'fa' ? 'رمز عبور' : 'Password'}
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} autoComplete="current-password" dir="ltr" />
              </label>
            </div>
            {error && (
              <p style={{ color: '#b3261e', fontSize: 12, margin: 0 }}>
                {language === 'fa' ? 'نام کاربری یا رمز عبور اشتباه است.' : 'Wrong username or password.'}
              </p>
            )}
            <button type="button" className="pathway-button" onClick={submit} disabled={busy}>
              {busy ? (language === 'fa' ? 'در حال ورود…' : 'Signing in…') : language === 'fa' ? 'ورود به پنل' : 'Enter panel'}
            </button>
            {mustChange && (
              <p style={{ color: '#8a5a00', fontSize: 12, margin: 0 }}>
                {language === 'fa'
                  ? 'رمز پیش‌فرض فعال است — پس از ورود از بخش تنظیمات رمز را عوض کنید.'
                  : 'Default password is active — change it in Settings after signing in.'}
              </p>
            )}
            <p className="pathway-fineprint">
              {isBackendEnabled
                ? language === 'fa'
                  ? 'حالت امن: ورود با بک‌اند (bcrypt + JWT + PostgreSQL).'
                  : 'Secure mode: sign-in via backend (bcrypt + JWT + PostgreSQL).'
                : language === 'fa'
                  ? 'حساب پیش‌فرض نمایشی: admin / admin123 — پس از ورود از بخش تنظیمات آن را تغییر دهید.'
                  : 'Demo default: admin / admin123 — change it in Settings after signing in.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Authed app ---------------- */

function isUnauthorized(e: unknown): boolean {
  return (e as { status?: number })?.status === 401;
}

function AdminApp({ language, onLogout }: { language: 'en' | 'fa'; onLogout: () => void }) {
  const [section, setSection] = useState<SectionKey>('dashboard');
  const opp = useOpportunitiesAdmin();
  const guides = useGuidesAdmin();
  const visa = useVisaAdmin();
  const { settings, setSettings } = useSiteSettings();
  const [txVersion, setTxVersion] = useState(0);
  const [userVersion, setUserVersion] = useState(0);

  // Demo (browser-local) data
  const demoTransactions = useMemo(() => listTransactions(), [txVersion]);
  void txVersion;
  const demoUsers = useMemo(() => listUsers(), [userVersion]);
  void userVersion;

  // Secure backend data (PostgreSQL). Fetched only when VITE_API_URL is set.
  const backend = isBackendEnabled;
  const [serverStats, setServerStats] = useState<AdminStats | null>(null);
  const [serverUsers, setServerUsers] = useState<ApiUser[]>([]);
  const [serverTxs, setServerTxs] = useState<ApiTx[]>([]);
  const [videoCount, setVideoCount] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const refreshServer = async () => {
    const token = getAdminToken();
    if (!backend || !token) return;
    try {
      setServerError(null);
      const [stats, u, t, v] = await Promise.all([
        apiAdminStats(token),
        apiAdminUsers(token),
        apiAdminTransactions(token),
        apiAdminVideos(token).catch(() => ({ videos: [] as ApiVideo[] })),
      ]);
      setServerStats(stats);
      setServerUsers(u.users);
      setServerTxs(t.transactions);
      setVideoCount(v.videos.length);
    } catch (e) {
      // Expired/invalid admin JWT (backend was rebuilt/restarted, or the 12h
      // token TTL passed): force re-login instead of crying "unreachable".
      if (isUnauthorized(e)) {
        onLogout();
        return;
      }
      setServerError('backend_unreachable');
    }
  };

  useEffect(() => {
    if (backend) void refreshServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend, userVersion, txVersion]);

  const refreshVideoCount = async () => {
    const token = getAdminToken();
    if (!backend || !token) return;
    try {
      const v = await apiAdminVideos(token);
      setVideoCount(v.videos.length);
    } catch { /* keep old count */ }
  };

  const transactions = backend ? serverTxs.map((t) => ({ ...t, amountUSD: t.amountUSD })) : demoTransactions;
  const users = backend ? serverUsers : demoUsers;
  const plans = usePlans();
  const revenue = backend
    ? (serverStats?.revenueUSD ?? serverTxs.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amountUSD, 0))
    : demoTransactions.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amountUSD, 0);
  const pending = backend
    ? (serverStats?.pending ?? serverTxs.filter((t) => t.status === 'pending').length)
    : demoTransactions.filter((t) => t.status === 'pending').length;

  const nav = [
    { key: 'dashboard', labelEn: 'Dashboard', labelFa: 'داشبورد' },
    { key: 'opportunities', labelEn: 'Opportunities', labelFa: 'فرصت‌ها', count: opp.items.length },
    { key: 'guides', labelEn: 'Guides', labelFa: 'راهنماها', count: guides.items.length },
    { key: 'visa', labelEn: 'Visa topics', labelFa: 'موضوعات ویزا', count: visa.items.length },
    { key: 'videos', labelEn: 'Videos', labelFa: 'ویدیوها', count: videoCount },
    { key: 'users', labelEn: 'Users', labelFa: 'کاربران', count: users.length },
    { key: 'payments', labelEn: 'Payments', labelFa: 'پرداخت‌ها', count: transactions.length },
    { key: 'plans', labelEn: 'Plans', labelFa: 'پلن‌ها', count: plans.length },
    { key: 'ads', labelEn: 'Ads', labelFa: 'تبلیغات' },
    { key: 'settings', labelEn: 'Settings', labelFa: 'تنظیمات' },
  ];

  return (
    <div>
      <div className="pathway-container" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#65718a' }}>
          {language === 'fa' ? `مدیر: ${getAdminUsername()}` : `Admin: ${getAdminUsername()}`}
        </span>
        <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36 }} onClick={onLogout}>
          {language === 'fa' ? 'خروج' : 'Sign out'}
        </button>
      </div>
      <AdminShell
        titleEn="Admin Panel — manage every section"
        titleFa="پنل مدیریت — مدیریت همهٔ بخش‌ها"
        descEn="Manage scholarships, humanitarian pathways, visa information, guides, users, payments and site settings. Design matches the public site and works in English and Dari."
        descFa="بورسیه‌ها، مسیرهای بشردوستانه، اطلاعات ویزا، راهنماها، کاربران، پرداخت‌ها و تنظیمات سایت را مدیریت کنید. طراحی با سایت هماهنگ است و به انگلیسی و دری کار می‌کند."
        nav={nav}
        active={section}
        onNavigate={(k) => setSection(k as SectionKey)}
      >
        {section === 'dashboard' && (
          <DashboardView
            oppCount={backend ? (serverStats?.opportunities ?? opp.items.length) : opp.items.length}
            guideCount={backend ? (serverStats?.guides ?? guides.items.length) : guides.items.length}
            visaCount={backend ? (serverStats?.visaTopics ?? visa.items.length) : visa.items.length}
            userCount={users.length}
            txCount={transactions.length}
            revenue={revenue}
            pending={pending}
            backend={backend}
            serverError={serverError}
            plans={plans}
            onGo={setSection}
          />
        )}
        {section === 'opportunities' && <OpportunitiesView store={opp} />}
        {section === 'guides' && <GuidesView store={guides} />}
        {section === 'visa' && <VisaView store={visa} />}
        {section === 'videos' && <VideosView onChanged={() => void refreshVideoCount()} />}
        {section === 'users' && backend && (
          <BackendUsersView users={serverUsers} onChanged={() => setUserVersion((v) => v + 1)} />
        )}
        {section === 'users' && !backend && <UsersView onChanged={() => setUserVersion((v) => v + 1)} />}
        {section === 'payments' && backend && (
          <BackendPaymentsView onChanged={() => { setTxVersion((v) => v + 1); setUserVersion((v) => v + 1); }} txs={serverTxs} />
        )}
        {section === 'payments' && !backend && (
          <PaymentsView
            onChanged={() => { setTxVersion((v) => v + 1); setUserVersion((v) => v + 1); }}
          />
        )}
        {section === 'plans' && <PlansView />}
        {section === 'ads' && (backend ? <AdsView /> : <p className="directory-local-note">{language === 'fa' ? 'تبلیغات به بک‌اند نیاز دارد.' : 'Ads need the backend connected.'}</p>)}
        {section === 'settings' && (
          <SettingsView settings={settings} setSettings={setSettings} />
        )}
      </AdminShell>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function DashboardView(props: {
  oppCount: number;
  guideCount: number;
  visaCount: number;
  userCount: number;
  txCount: number;
  revenue: number;
  pending: number;
  backend?: boolean;
  serverError?: string | null;
  plans: PaymentPlan[];
  onGo: (s: SectionKey) => void;
}) {
  const { language } = useLanguage();
  const cards = [
    { labelEn: 'Opportunities', labelFa: 'فرصت‌ها', value: props.oppCount, go: 'opportunities' as SectionKey },
    { labelEn: 'Guides', labelFa: 'راهنماها', value: props.guideCount, go: 'guides' as SectionKey },
    { labelEn: 'Visa topics', labelFa: 'موضوعات ویزا', value: props.visaCount, go: 'visa' as SectionKey },
    { labelEn: 'Users', labelFa: 'کاربران', value: props.userCount, go: 'users' as SectionKey },
    { labelEn: 'Transactions', labelFa: 'تراکنش‌ها', value: props.txCount, go: 'payments' as SectionKey },
    { labelEn: 'Revenue (completed)', labelFa: 'درآمد (تکمیل‌شده)', value: `$${props.revenue.toFixed(2)}`, go: 'payments' as SectionKey },
    { labelEn: 'Pending payments', labelFa: 'پرداخت‌های در انتظار', value: props.pending, go: 'payments' as SectionKey },
  ];
  return (
    <div>
      <div className="opp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 20 }}>
        {cards.map((c) => (
          <article key={c.labelEn} className="opp-card">
            <p className="pathway-eyebrow">{language === 'fa' ? c.labelFa : c.labelEn}</p>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#07114f' }}>{c.value}</p>
            <button type="button" className="opp-link" onClick={() => props.onGo(c.go)} style={{ marginTop: 8, background: 'none', border: 0, padding: 0 }}>
              {language === 'fa' ? 'مدیریت' : 'Manage'} →
            </button>
          </article>
        ))}
      </div>
      <div className="legal-notice">
        <div>
          <h2>{language === 'fa' ? 'تحلیل کلی' : 'Analytics overview'}</h2>
          <p>
            {props.backend
              ? language === 'fa'
                ? `مجموع محتوا: ${props.oppCount + props.guideCount + props.visaCount} مورد · کاربران: ${props.userCount} · درآمد ثبت‌شده: $${props.revenue.toFixed(2)}. آمار واقعی از دیتابیس PostgreSQL (سرور) خوانده می‌شود.`
                : `Total content: ${props.oppCount + props.guideCount + props.visaCount} items · Users: ${props.userCount} · Recorded revenue: $${props.revenue.toFixed(2)}. Real analytics from the PostgreSQL server database.`
              : language === 'fa'
                ? `مجموع محتوا: ${props.oppCount + props.guideCount + props.visaCount} مورد · کاربران: ${props.userCount} · درآمد ثبت‌شده: $${props.revenue.toFixed(2)}. همهٔ آمار از دادهٔ محلی همین مرورگر ساخته می‌شود.`
                : `Total content: ${props.oppCount + props.guideCount + props.visaCount} items · Users: ${props.userCount} · Recorded revenue: $${props.revenue.toFixed(2)}. All analytics are computed from this browser's local data.`}
          </p>
          {props.backend && props.serverError && (
            <p style={{ color: '#b3261e', fontSize: 12 }}>
              {language === 'fa' ? 'بک‌اند در دسترس نیست — بررسی کنید docker compose بالا باشد.' : 'Backend unreachable — make sure docker compose is up.'}
            </p>
          )}
        </div>
      </div>
      <h3 style={{ color: '#07114f', margin: '22px 0 12px' }}>{language === 'fa' ? 'پلن‌های اشتراک' : 'Subscription plans'}</h3>
      <PaymentSection compact plans={props.plans} />
    </div>
  );
}

/* ------------- Opportunities ------------- */

function OpportunitiesView({ store }: { store: ReturnType<typeof useOpportunitiesAdmin> }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | 'scholarship' | 'humanitarian'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OpportunityRecord>(() => emptyOpp(''));
  const [isEdit, setIsEdit] = useState(false);

  const filtered = store.items.filter((o) => {
    if (kind !== 'all' && o.kind !== kind) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.title.en.toLowerCase().includes(q) ||
      o.title.fa.includes(query) ||
      o.slug.toLowerCase().includes(q) ||
      o.organization.en.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditing(emptyOpp(''));
    setIsEdit(false);
    setModalOpen(true);
  };
  const openEdit = (o: OpportunityRecord) => {
    setEditing(JSON.parse(JSON.stringify(o)) as OpportunityRecord);
    setIsEdit(true);
    setModalOpen(true);
  };
  const save = () => {
    if (!editing.slug.trim() || !editing.title.en.trim()) return;
    store.upsert(editing);
    setModalOpen(false);
  };
  const setStatusMany = (status: OpportunityRecord['status']) => {
    store.setItems((prev) => prev.map((p) => (store.selected.includes(p.slug) ? { ...p, status } : p)));
    store.clearSelection();
  };

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'بورسیه‌ها و بشردوستانه' : 'Scholarships & humanitarian'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت فرصت‌ها' : 'Manage opportunities'}</h2>
          <p>{language === 'fa' ? `${filtered.length} مورد` : `${filtered.length} items`}</p>
        </div>
        <button type="button" className="pathway-button" onClick={openAdd}>
          {language === 'fa' ? '＋ افزودن فرصت' : '＋ Add opportunity'}
        </button>
      </div>

      <div className="directory-filters" style={{ marginBottom: 14 }}>
        <div className="quick-search-form" style={{ gridTemplateColumns: 'minmax(0,1fr) 170px 150px' }}>
          <label className="quick-search-form__query">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === 'fa' ? 'جستجو…' : 'Search…'} aria-label={language === 'fa' ? 'جستجو' : 'Search'} />
          </label>
          <label className="quick-search-form__kind">
            <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Kind">
              <option value="all">{language === 'fa' ? 'همه' : 'All'}</option>
              <option value="scholarship">{language === 'fa' ? 'بورسیه' : 'Scholarship'}</option>
              <option value="humanitarian">{language === 'fa' ? 'بشردوستانه' : 'Humanitarian'}</option>
            </select>
          </label>
          <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('opportunities.json', store.items)}>
            {language === 'fa' ? 'صادرات' : 'Export'}
          </button>
        </div>
        {store.selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#52617a' }}>
              {language === 'fa' ? `${store.selected.length} انتخاب شد` : `${store.selected.length} selected`}
            </span>
            <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36 }} onClick={() => setStatusMany('published')}>{language === 'fa' ? 'انتشار' : 'Publish'}</button>
            <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36 }} onClick={() => setStatusMany('demo')}>{language === 'fa' ? 'نمونه' : 'Mark demo'}</button>
            <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36 }} onClick={() => store.removeMany(store.selected)}>{language === 'fa' ? 'حذف انتخاب‌ها' : 'Delete selected'}</button>
            <button type="button" className="opp-link" onClick={store.clearSelection} style={{ background: 'none', border: 0 }}>{language === 'fa' ? 'لغو انتخاب' : 'Clear'}</button>
          </div>
        )}
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={filtered.length > 0 && filtered.every((f) => store.selected.includes(f.slug))} onChange={(e) => (e.target.checked ? store.selectAll() : store.clearSelection())} aria-label="Select all" /></th>
              <th>{language === 'fa' ? 'عنوان' : 'Title'}</th>
              <th>{language === 'fa' ? 'نوع' : 'Kind'}</th>
              <th>{language === 'fa' ? 'وضعیت' : 'Status'}</th>
              <th>{language === 'fa' ? 'منبع رسمی' : 'Official source'}</th>
              <th>{language === 'fa' ? 'عملیات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.slug}>
                <td><input type="checkbox" checked={store.selected.includes(o.slug)} onChange={() => store.toggleSelect(o.slug)} aria-label={o.slug} /></td>
                <td><strong>{o.title[language] || o.title.en}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{o.slug}</span></td>
                <td>{o.kind}</td>
                <td>{o.status}</td>
                <td>{o.officialSourceUrl ? '✓' : language === 'fa' ? 'ندارد (نیازمند بررسی)' : 'missing (needs review)'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => openEdit(o)}>{language === 'fa' ? 'ویرایش' : 'Edit'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => store.removeMany([o.slug])}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6}>{language === 'fa' ? 'نتیجه‌ای یافت نشد.' : 'No results found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit opportunity' : 'Add opportunity'} onSubmit={save} submitLabel={language === 'fa' ? 'ذخیره' : 'Save'} size="lg">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Slug (unique)" required><FormInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} /></FormField>
            <FormField label="Kind">
              <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as OpportunityRecord['kind'] })} style={{ width: '100%', minHeight: 42, border: '1px solid #dfe6ef', borderRadius: 10, padding: '8px 10px' }}>
                <option value="scholarship">scholarship</option>
                <option value="humanitarian">humanitarian</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Title (EN)" required><FormInput value={editing.title.en} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, en: e.target.value } })} /></FormField>
            <FormField label="Title (FA)"><FormInput value={editing.title.fa} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, fa: e.target.value } })} dir="rtl" /></FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Organization (EN)"><FormInput value={editing.organization.en} onChange={(e) => setEditing({ ...editing, organization: { ...editing.organization, en: e.target.value } })} /></FormField>
            <FormField label="Country (EN)"><FormInput value={editing.country.en} onChange={(e) => setEditing({ ...editing, country: { ...editing.country, en: e.target.value } })} /></FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormField label="Status">
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as OpportunityRecord['status'] })} style={{ width: '100%', minHeight: 42, border: '1px solid #dfe6ef', borderRadius: 10, padding: '8px 10px' }}>
                <option value="demo">demo</option>
                <option value="published">published</option>
                <option value="expired">expired</option>
              </select>
            </FormField>
            <FormField label="Official source name"><FormInput value={editing.officialSourceName ?? ''} onChange={(e) => setEditing({ ...editing, officialSourceName: e.target.value || null })} /></FormField>
            <FormField label="Official source URL"><FormInput value={editing.officialSourceUrl ?? ''} onChange={(e) => setEditing({ ...editing, officialSourceUrl: e.target.value || null })} placeholder="https://…" /></FormField>
          </div>
          <FormField label="Description (EN)"><FormInput value={editing.description.en} onChange={(e) => setEditing({ ...editing, description: { ...editing.description, en: e.target.value } })} /></FormField>
          <FormField label="Description (FA)"><FormInput value={editing.description.fa} onChange={(e) => setEditing({ ...editing, description: { ...editing.description, fa: e.target.value } })} dir="rtl" /></FormField>
        </div>
      </FormModal>
    </div>
  );
}

/* ------------- Guides ------------- */

function GuidesView({ store }: { store: ReturnType<typeof useGuidesAdmin> }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GuideRecord>({ slug: '', category: { en: '', fa: '' }, title: { en: '', fa: '' }, description: { en: '', fa: '' }, readTimeMinutes: 3, publicationDate: null, author: { en: 'TechLand', fa: 'تک‌لند' }, searchTerms: { en: '', fa: '' }, sections: [] });

  const filtered = store.items.filter((g) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return g.title.en.toLowerCase().includes(q) || g.slug.includes(q);
  });

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'راهنماها' : 'Guides'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت راهنماها' : 'Manage guides'}</h2>
          <p>{filtered.length} items</p>
        </div>
        <button type="button" className="pathway-button" onClick={() => { setEditing({ slug: '', category: { en: '', fa: '' }, title: { en: '', fa: '' }, description: { en: '', fa: '' }, readTimeMinutes: 3, publicationDate: null, author: { en: 'TechLand', fa: 'تک‌لند' }, searchTerms: { en: '', fa: '' }, sections: [] }); setModalOpen(true); }}>
          {language === 'fa' ? '＋ افزودن راهنما' : '＋ Add guide'}
        </button>
      </div>
      <div className="directory-filters" style={{ marginBottom: 14 }}>
        <div className="quick-search-form" style={{ gridTemplateColumns: 'minmax(0,1fr) 150px' }}>
          <label className="quick-search-form__query"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === 'fa' ? 'جستجو…' : 'Search…'} aria-label="Search guides" /></label>
          <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('guides.json', store.items)}>{language === 'fa' ? 'صادرات' : 'Export'}</button>
        </div>
        {store.selected.length > 0 && (
          <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36 }} onClick={() => store.removeMany(store.selected)}>
            {language === 'fa' ? `حذف ${store.selected.length} مورد` : `Delete ${store.selected.length} selected`}
          </button>
        )}
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th></th><th>{language === 'fa' ? 'عنوان' : 'Title'}</th><th>{language === 'fa' ? 'دسته' : 'Category'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.slug}>
                <td><input type="checkbox" checked={store.selected.includes(g.slug)} onChange={() => store.toggleSelect(g.slug)} aria-label={g.slug} /></td>
                <td><strong>{g.title[language] || g.title.en}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{g.slug}</span></td>
                <td>{g.category[language]}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => { setEditing(JSON.parse(JSON.stringify(g))); setModalOpen(true); }}>{language === 'fa' ? 'ویرایش' : 'Edit'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => store.removeMany([g.slug])}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Guide" onSubmit={() => { if (!editing.slug.trim() || !editing.title.en.trim()) return; store.upsert(editing); setModalOpen(false); }} submitLabel={language === 'fa' ? 'ذخیره' : 'Save'}>
        <div style={{ display: 'grid', gap: 12 }}>
          <FormField label="Slug (unique)" required><FormInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} /></FormField>
          <FormField label="Title (EN)" required><FormInput value={editing.title.en} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, en: e.target.value } })} /></FormField>
          <FormField label="Title (FA)"><FormInput value={editing.title.fa} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, fa: e.target.value } })} dir="rtl" /></FormField>
          <FormField label="Category (EN)"><FormInput value={editing.category.en} onChange={(e) => setEditing({ ...editing, category: { ...editing.category, en: e.target.value } })} /></FormField>
          <FormField label="Description (EN)"><FormInput value={editing.description.en} onChange={(e) => setEditing({ ...editing, description: { ...editing.description, en: e.target.value } })} /></FormField>
        </div>
      </FormModal>
    </div>
  );
}

/* ------------- Visa ------------- */

function VisaView({ store }: { store: ReturnType<typeof useVisaAdmin> }) {
  const { language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VisaTopic>({ slug: '', title: { en: '', fa: '' }, purpose: { en: '', fa: '' }, generalRequirements: { en: '', fa: '' }, typicalDocuments: { en: '', fa: '' }, process: { en: '', fa: '' } });

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'ویزا' : 'Visa'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت موضوعات ویزا' : 'Manage visa topics'}</h2>
        </div>
        <button type="button" className="pathway-button" onClick={() => { setEditing({ slug: '', title: { en: '', fa: '' }, purpose: { en: '', fa: '' }, generalRequirements: { en: '', fa: '' }, typicalDocuments: { en: '', fa: '' }, process: { en: '', fa: '' } }); setModalOpen(true); }}>
          {language === 'fa' ? '＋ افزودن موضوع' : '＋ Add topic'}
        </button>
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th></th><th>{language === 'fa' ? 'عنوان' : 'Title'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {store.items.map((v) => (
              <tr key={v.slug}>
                <td><input type="checkbox" checked={store.selected.includes(v.slug)} onChange={() => store.toggleSelect(v.slug)} aria-label={v.slug} /></td>
                <td><strong>{v.title[language] || v.title.en}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{v.slug}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => { setEditing(JSON.parse(JSON.stringify(v))); setModalOpen(true); }}>{language === 'fa' ? 'ویرایش' : 'Edit'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => store.removeMany([v.slug])}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {store.selected.length > 0 && (
        <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36, marginTop: 10 }} onClick={() => store.removeMany(store.selected)}>
          {language === 'fa' ? 'حذف انتخاب‌ها' : 'Delete selected'}
        </button>
      )}
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Visa topic" onSubmit={() => { if (!editing.slug.trim() || !editing.title.en.trim()) return; store.upsert(editing); setModalOpen(false); }} submitLabel={language === 'fa' ? 'ذخیره' : 'Save'}>
        <div style={{ display: 'grid', gap: 12 }}>
          <FormField label="Slug (unique)" required><FormInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} /></FormField>
          <FormField label="Title (EN)" required><FormInput value={editing.title.en} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, en: e.target.value } })} /></FormField>
          <FormField label="Title (FA)"><FormInput value={editing.title.fa} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, fa: e.target.value } })} dir="rtl" /></FormField>
          <FormField label="Purpose (EN)"><FormInput value={editing.purpose.en} onChange={(e) => setEditing({ ...editing, purpose: { ...editing.purpose, en: e.target.value } })} /></FormField>
          <FormField label="Process (EN)"><FormInput value={editing.process.en} onChange={(e) => setEditing({ ...editing, process: { ...editing.process, en: e.target.value } })} /></FormField>
        </div>
      </FormModal>
    </div>
  );
}

/* ------------- Users (demo: browser-local) ------------- */

function UsersView({ onChanged }: { onChanged: () => void }) {
  const { language } = useLanguage();
  const plans = usePlans();
  const [users, setUsers] = useState(() => listUsers());
  const refresh = () => {
    setUsers(listUsers());
    onChanged();
  };

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'کاربران' : 'Users'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت کاربران و عضویت‌ها' : 'Manage users & memberships'}</h2>
          <p>{language === 'fa' ? `${users.length} کاربر ثبت‌شده` : `${users.length} registered users`}</p>
        </div>
        <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('users.json', users)}>
          {language === 'fa' ? 'صادرات' : 'Export'}
        </button>
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>{language === 'fa' ? 'کاربر' : 'User'}</th><th>{language === 'fa' ? 'اشتراک' : 'Subscription'}</th><th>{language === 'fa' ? 'وضعیت' : 'Status'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{u.email} · {u.createdAt.slice(0, 10)}</span></td>
                <td>{u.subscriptionPlanId ?? '—'}</td>
                <td>{u.subscriptionStatus ?? '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {plans.map((p) => (
                      <button key={p.id} type="button" className="opp-link" style={{ background: 'none', border: 0, fontSize: 11 }} onClick={() => { setUserSubscription(u.id, p.id, 'active'); refresh(); }}>
                        {p.name[language]} ✓
                      </button>
                    ))}
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => { setUserSubscription(u.id, undefined, 'cancelled'); refresh(); }}>{language === 'fa' ? 'لغو عضویت' : 'Revoke'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => { deleteUser(u.id); refresh(); }}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4}>{language === 'fa' ? 'هنوز کاربری ثبت‌نام نکرده است. کاربران از بخش پرداخت پروفایل می‌سازند.' : 'No users yet. Users create a profile from the payment section.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------- Users (backend: PostgreSQL) ------------- */

function BackendUsersView({ users, onChanged }: { users: ApiUser[]; onChanged: () => void }) {
  const { language } = useLanguage();
  const plans = usePlans();
  const act = async (fn: () => Promise<unknown>) => {
    await fn();
    onChanged();
  };
  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'کاربران (سرور)' : 'Users (server)'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت کاربران و عضویت‌ها' : 'Manage users & memberships'}</h2>
          <p>{language === 'fa' ? `${users.length} کاربر در PostgreSQL` : `${users.length} users in PostgreSQL`}</p>
        </div>
        <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('users.json', users)}>
          {language === 'fa' ? 'صادرات' : 'Export'}
        </button>
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>{language === 'fa' ? 'کاربر' : 'User'}</th><th>{language === 'fa' ? 'اشتراک' : 'Subscription'}</th><th>{language === 'fa' ? 'وضعیت' : 'Status'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{u.email} · {(u.createdAt || '').slice(0, 10)}</span></td>
                <td>{u.subscriptionPlanId ?? '—'}</td>
                <td>{u.subscriptionStatus ?? '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {plans.map((p) => (
                      <button key={p.id} type="button" className="opp-link" style={{ background: 'none', border: 0, fontSize: 11 }} onClick={() => void act(async () => { const t = getAdminToken(); if (t) await apiSetSubscription(t, u.id, p.id, 'active'); })}>
                        {p.name[language]} ✓
                      </button>
                    ))}
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void act(async () => { const t = getAdminToken(); if (t) await apiSetSubscription(t, u.id, null, 'cancelled'); })}>{language === 'fa' ? 'لغو عضویت' : 'Revoke'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void act(async () => { const t = getAdminToken(); if (t) await apiDeleteUser(t, u.id); })}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4}>{language === 'fa' ? 'هنوز کاربری در دیتابیس نیست.' : 'No users in the database yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------- Payments (admin, demo) ------------- */

function PaymentsView({ onChanged }: { onChanged: () => void }) {
  const { language } = useLanguage();
  const plans = usePlans();
  const [txs, setTxs] = useState(() => listTransactions());
  const refresh = () => {
    setTxs(listTransactions());
    onChanged();
  };
  const setStatus = (id: string, status: PaymentStatus) => {
    const tx = txs.find((t) => t.id === id);
    updateTransactionStatus(id, status);
    // Keep the user profile in sync with the payment decision
    if (tx?.userId) {
      if (status === 'completed') setUserSubscription(tx.userId, tx.planId, 'active');
      else if (status === 'failed') setUserSubscription(tx.userId, tx.planId, 'expired');
      else if (status === 'refunded') setUserSubscription(tx.userId, undefined, 'cancelled');
    }
    refresh();
  };

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'پرداخت‌ها' : 'Payments'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت پرداخت‌های HesabPay' : 'Manage HesabPay payments'}</h2>
          <p>{language === 'fa' ? 'کاربر QR را اسکن و شمارهٔ مرجع حساب‌پی را ثبت می‌کند؛ شما تأیید یا رد می‌کنید و عضویت کاربر خودکار به‌روز می‌شود.' : 'Users scan the QR and submit their HesabPay reference; you approve or reject and the user membership updates automatically.'}</p>
        </div>
        <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('transactions.json', txs)}>
          {language === 'fa' ? 'صادرات تراکنش‌ها' : 'Export transactions'}
        </button>
      </div>

      <h3 style={{ color: '#07114f' }}>{language === 'fa' ? 'پلن‌ها' : 'Plans'}</h3>
      <div className="opp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        {plans.map((p) => (
          <article key={p.id} className="opp-card">
            <p className="pathway-eyebrow">{p.name[language]}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#07114f' }}>${p.priceUSD.toFixed(2)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#65718a' }}>{p.period} · {p.features[language].length} {language === 'fa' ? 'ویژگی' : 'features'}</p>
          </article>
        ))}
      </div>

      <h3 style={{ color: '#07114f' }}>{language === 'fa' ? 'تراکنش‌ها (صف بررسی)' : 'Transactions (review queue)'}</h3>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>ID</th><th>{language === 'fa' ? 'کاربر' : 'User'}</th><th>{language === 'fa' ? 'پلن' : 'Plan'}</th><th>{language === 'fa' ? 'مرجع HesabPay' : 'HesabPay ref'}</th><th>{language === 'fa' ? 'مبلغ' : 'Amount'}</th><th>{language === 'fa' ? 'وضعیت' : 'Status'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td style={{ fontSize: 10 }}>{t.id}<br />{t.createdAt.slice(0, 10)}</td>
                <td><strong>{t.userName ?? '—'}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{t.email}</span></td>
                <td>{t.planId}</td>
                <td><code style={{ fontSize: 11 }}>{t.reference ?? '—'}</code></td>
                <td>${t.amountUSD.toFixed(2)}</td>
                <td>{t.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => setStatus(t.id, 'completed')}>{language === 'fa' ? 'تأیید و فعال‌سازی' : 'Approve & activate'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => setStatus(t.id, 'failed')}>{language === 'fa' ? 'رد' : 'Reject'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => setStatus(t.id, 'refunded')}>{language === 'fa' ? 'بازپرداخت' : 'Refund'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr><td colSpan={7}>{language === 'fa' ? 'هنوز تراکنشی ثبت نشده است. از بخش پرداخت یک اشتراک آزمایشی بسازید.' : 'No transactions yet. Create a test subscription from the payment section.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------- Payments (backend: PostgreSQL review queue) ------------- */

function BackendPaymentsView({ txs, onChanged }: { txs: ApiTx[]; onChanged: () => void }) {
  const { language } = useLanguage();
  const setStatus = async (id: string, status: ApiTx['status']) => {
    const token = getAdminToken();
    if (!token) return;
    await apiSetTxStatus(token, id, status);
    onChanged();
  };
  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'پرداخت‌ها (سرور)' : 'Payments (server)'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت پرداخت‌های HesabPay' : 'Manage HesabPay payments'}</h2>
          <p>{language === 'fa' ? 'صف بررسی واقعی از PostgreSQL. تأیید، عضویت کاربر را در سرور فعال می‌کند.' : 'Real review queue from PostgreSQL. Approving activates the user membership on the server.'}</p>
        </div>
        <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('transactions.json', txs)}>
          {language === 'fa' ? 'صادرات تراکنش‌ها' : 'Export transactions'}
        </button>
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>ID</th><th>{language === 'fa' ? 'کاربر' : 'User'}</th><th>{language === 'fa' ? 'پلن' : 'Plan'}</th><th>{language === 'fa' ? 'مرجع HesabPay' : 'HesabPay ref'}</th><th>{language === 'fa' ? 'مبلغ' : 'Amount'}</th><th>{language === 'fa' ? 'وضعیت' : 'Status'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td style={{ fontSize: 10 }}>{t.id.slice(0, 8)}<br />{t.createdAt.slice(0, 10)}</td>
                <td><strong>{t.userName ?? '—'}</strong><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{t.email}</span></td>
                <td>{t.planId}</td>
                <td><code style={{ fontSize: 11 }}>{t.reference ?? '—'}</code></td>
                <td>${t.amountUSD.toFixed(2)}</td>
                <td>{t.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void setStatus(t.id, 'completed')}>{language === 'fa' ? 'تأیید و فعال‌سازی' : 'Approve & activate'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void setStatus(t.id, 'failed')}>{language === 'fa' ? 'رد' : 'Reject'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void setStatus(t.id, 'refunded')}>{language === 'fa' ? 'بازپرداخت' : 'Refund'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr><td colSpan={7}>{language === 'fa' ? 'هنوز تراکنشی در سرور ثبت نشده است.' : 'No transactions on the server yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------- Plans (subscription plans) ------------- */

type PlanRow = {
  id: string;
  period: string;
  name: { en: string; fa: string };
  priceUSD: number;
  originalPriceUSD?: number;
  features: { en: string[]; fa: string[] };
  isPopular?: boolean;
  isBestValue?: boolean;
  isActive?: boolean;
};

const PERIOD_FA: Record<string, string> = { monthly: 'ماهانه', quarterly: '۳ ماهه', yearly: 'سالانه', lifetime: 'مادام‌العمر' };

function PlansView() {
  const { language } = useLanguage();
  const fallbackPlans = usePlans();
  const backend = isBackendEnabled;
  const [serverPlans, setServerPlans] = useState<ApiPlan[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: '', period: 'monthly', nameEn: '', nameFa: '',
    priceUSD: '', originalPriceUSD: '', featuresEn: '', featuresFa: '',
    isPopular: false, isBestValue: false, isActive: true, sortOrder: '99',
  });

  const refresh = async () => {
    const t = getAdminToken();
    if (!t) return;
    const r = await apiAdminPlans(t);
    setServerPlans(r.plans);
  };

  useEffect(() => {
    if (backend) void refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend]);

  const rows: PlanRow[] = backend
    ? (serverPlans ?? [])
    : fallbackPlans.map((p) => ({
      id: p.id, period: p.period, name: p.name, priceUSD: p.priceUSD,
      originalPriceUSD: p.originalPriceUSD, features: p.features,
      isPopular: p.isPopular, isBestValue: p.isBestValue, isActive: true,
    }));

  const openAdd = () => {
    setEditingId(null);
    setForm({
      id: '', period: 'monthly', nameEn: '', nameFa: '',
      priceUSD: '', originalPriceUSD: '', featuresEn: '', featuresFa: '',
      isPopular: false, isBestValue: false, isActive: true, sortOrder: '99',
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: PlanRow) => {
    setEditingId(p.id);
    setForm({
      id: p.id, period: p.period, nameEn: p.name.en, nameFa: p.name.fa,
      priceUSD: String(p.priceUSD), originalPriceUSD: p.originalPriceUSD != null ? String(p.originalPriceUSD) : '',
      featuresEn: p.features.en.join('\n'), featuresFa: p.features.fa.join('\n'),
      isPopular: !!p.isPopular, isBestValue: !!p.isBestValue, isActive: p.isActive !== false, sortOrder: '99',
    });
    setError(null);
    setModalOpen(true);
  };

  const save = async () => {
    const t = getAdminToken();
    if (!t) return;
    setBusy(true);
    setError(null);
    try {
      const price = Number(form.priceUSD);
      if (!form.nameEn.trim() || !(price >= 0)) {
        setError(language === 'fa' ? 'نام انگلیسی و قیمت معتبر وارد کنید.' : 'Enter a valid English name and price.');
        setBusy(false);
        return;
      }
      const payload: PlanInput = {
        period: form.period as ApiPlan['period'],
        nameEn: form.nameEn.trim(),
        nameFa: form.nameFa.trim(),
        priceUSD: price,
        originalPriceUSD: form.originalPriceUSD.trim() === '' ? null : Number(form.originalPriceUSD),
        featuresEn: form.featuresEn.split('\n').map((s) => s.trim()).filter(Boolean),
        featuresFa: form.featuresFa.split('\n').map((s) => s.trim()).filter(Boolean),
        isPopular: form.isPopular,
        isBestValue: form.isBestValue,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await apiUpdatePlan(t, editingId, payload);
      } else {
        const id = form.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
        if (!id) {
          setError(language === 'fa' ? 'شناسه (ID) لازم است.' : 'An ID is required.');
          setBusy(false);
          return;
        }
        await apiCreatePlan(t, { ...payload, id });
      }
      setModalOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'save_failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const t = getAdminToken();
    if (!t) return;
    await apiDeletePlan(t, id);
    await refresh().catch(() => {});
  };

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'پلن‌های اشتراک' : 'Subscription plans'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت پلن‌ها و قیمت‌ها' : 'Manage plans & pricing'}</h2>
          <p>
            {backend
              ? language === 'fa'
                ? 'قیمت جدید فقط روی پرداخت‌های بعدی اعمال می‌شود؛ تراکنش‌های قبلی با مبلغ ثبت‌شده می‌مانند.'
                : 'New prices apply to future payments only; past transactions keep their recorded amounts.'
              : language === 'fa'
                ? 'حالت نمایشی: پلن‌ها ثابت‌اند. برای ویرایش، VITE_API_URL را به بک‌اند وصل کنید.'
                : 'Demo mode: plans are static. Connect VITE_API_URL to the backend to edit them.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="pathway-button pathway-button--secondary" onClick={() => exportJson('plans.json', rows)}>
            {language === 'fa' ? 'صادرات' : 'Export'}
          </button>
          {backend && (
            <button type="button" className="pathway-button" onClick={openAdd}>
              {language === 'fa' ? '＋ افزودن پلن' : '＋ Add plan'}
            </button>
          )}
        </div>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>{language === 'fa' ? 'پلن' : 'Plan'}</th><th>{language === 'fa' ? 'قیمت' : 'Price'}</th><th>{language === 'fa' ? 'ویژگی‌ها' : 'Features'}</th><th>{language === 'fa' ? 'نشان‌ها' : 'Flags'}</th>{backend && <th>{language === 'fa' ? 'عملیات' : 'Actions'}</th>}</tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name[language] || p.name.en}</strong>
                  <br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{p.id} · {language === 'fa' ? (PERIOD_FA[p.period] ?? p.period) : p.period}</span>
                </td>
                <td>
                  <strong>${p.priceUSD.toFixed(2)}</strong>
                  {p.originalPriceUSD != null && (
                    <span style={{ fontSize: 11, color: '#9aa6b7', textDecoration: 'line-through' }}> ${p.originalPriceUSD.toFixed(2)}</span>
                  )}
                </td>
                <td style={{ fontSize: 11, color: '#52617a' }}>
                  {(p.features[language] ?? []).slice(0, 4).join(' · ')}
                  {(p.features[language] ?? []).length > 4 && ` · +${(p.features[language] ?? []).length - 4}`}
                </td>
                <td style={{ fontSize: 11 }}>
                  {[p.isPopular && (language === 'fa' ? 'محبوب' : 'popular'), p.isBestValue && (language === 'fa' ? 'بهترین ارزش' : 'best value'), p.isActive === false && (language === 'fa' ? 'غیرفعال' : 'inactive')].filter(Boolean).join(' · ') || '—'}
                </td>
                {backend && (
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => openEdit(p)}>{language === 'fa' ? 'ویرایش' : 'Edit'}</button>
                      <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void remove(p.id)}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={backend ? 5 : 4}>{language === 'fa' ? 'پلنی یافت نشد.' : 'No plans found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (language === 'fa' ? 'ویرایش پلن' : 'Edit plan') : (language === 'fa' ? 'پلن جدید' : 'New plan')}
        onSubmit={() => void save()}
        submitLabel={language === 'fa' ? 'ذخیره' : 'Save'}
        loading={busy}
        size="lg"
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {!editingId && (
            <FormField label="ID (unique, latin)" required hint="e.g. plan-student">
              <FormInput value={form.id} onChange={(e) => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} dir="ltr" />
            </FormField>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'دوره' : 'Period'}>
              <FormSelect value={form.period} onChange={(e) => set('period', e.target.value)}>
                <option value="monthly">monthly</option>
                <option value="quarterly">quarterly</option>
                <option value="yearly">yearly</option>
                <option value="lifetime">lifetime</option>
              </FormSelect>
            </FormField>
            <FormField label={language === 'fa' ? 'قیمت (دلار)' : 'Price (USD)'} required>
              <FormInput value={form.priceUSD} onChange={(e) => set('priceUSD', e.target.value)} dir="ltr" inputMode="decimal" placeholder="5.99" />
            </FormField>
            <FormField label={language === 'fa' ? 'قیمت قبل (خالی = ندارد)' : 'Was-price (empty = none)'}>
              <FormInput value={form.originalPriceUSD} onChange={(e) => set('originalPriceUSD', e.target.value)} dir="ltr" inputMode="decimal" placeholder="17.97" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'نام (انگلیسی)' : 'Name (EN)'} required>
              <FormInput value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} dir="ltr" />
            </FormField>
            <FormField label={language === 'fa' ? 'نام (فارسی)' : 'Name (FA)'}>
              <FormInput value={form.nameFa} onChange={(e) => set('nameFa', e.target.value)} dir="rtl" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'ویژگی‌ها (انگلیسی، هر خط یکی)' : 'Features (EN, one per line)'}>
              <FormTextarea value={form.featuresEn} onChange={(e) => set('featuresEn', e.target.value)} rows={5} dir="ltr" />
            </FormField>
            <FormField label={language === 'fa' ? 'ویژگی‌ها (فارسی، هر خط یکی)' : 'Features (FA, one per line)'}>
              <FormTextarea value={form.featuresFa} onChange={(e) => set('featuresFa', e.target.value)} rows={5} dir="rtl" />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#35445d' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.isPopular} onChange={(e) => set('isPopular', e.target.checked)} />
              {language === 'fa' ? 'محبوب‌ترین' : 'Most popular'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.isBestValue} onChange={(e) => set('isBestValue', e.target.checked)} />
              {language === 'fa' ? 'بهترین ارزش' : 'Best value'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              {language === 'fa' ? 'فعال (نمایش در سایت)' : 'Active (visible on site)'}
            </label>
          </div>
          {error && <p style={{ color: '#b3261e', fontSize: 12, margin: 0 }}>{error}</p>}
        </div>
      </FormModal>
    </div>
  );
}

/* ------------- Videos (movies & series, OK/VK/Bunny embeds) ------------- */

interface PartDraft { labelEn: string; labelFa: string; link: string; direct: string }

const emptyPart = (): PartDraft => ({ labelEn: '', labelFa: '', link: '', direct: '' });

function VideosView({ onChanged }: { onChanged: () => void }) {
  const { language } = useLanguage();
  const backend = isBackendEnabled;
  const [list, setList] = useState<ApiVideo[]>([]);
  const [kindFilter, setKindFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '', kind: 'movie', titleEn: '', titleFa: '', descEn: '', descFa: '',
    poster: '', backdrop: '', year: '', country: '', duration: '', rating: '',
    seasons: '', episodes: '', genreCsv: '', access: 'subscription',
    featured: false, isNew: false, trending: false, active: true,
  });
  const [parts, setParts] = useState<PartDraft[]>([emptyPart()]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pickFile = (i: number) => {
    setUploadTarget(i);
    fileRef.current?.click();
  };

  const onFileChosen = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    setError(null);
    try {
      const r = await apiUploadVideoFile(f);
      setParts((arr) => arr.map((x, j) => (j === uploadTarget ? { ...x, direct: r.url } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'upload_failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const refresh = async () => {
    const t = getAdminToken();
    if (!t) return;
    const r = await apiAdminVideos(t);
    setList(r.videos);
    onChanged();
  };

  useEffect(() => {
    if (backend) void refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend]);

  const rows: Array<{
    slug: string; kind: string; titleEn: string; titleFa: string;
    parts: Array<{ labelEn: string; labelFa: string; source: string; direct: boolean }>;
    access: string; active: boolean; poster?: string; raw?: ApiVideo;
  }> = backend
    ? list
      .filter((v) => kindFilter === 'all' || v.kind === kindFilter)
      .map((v) => ({
        slug: v.slug, kind: v.kind, titleEn: v.title.en, titleFa: v.title.fa,
        parts: v.parts.map((p) => ({ labelEn: p.label.en, labelFa: p.label.fa, source: p.source, direct: !!p.directUrl })),
        access: v.accessType, active: v.isActive !== false, poster: v.posterUrl, raw: v,
      }))
    : MOCK_VIDEO_FALLBACK
      .filter((v) => kindFilter === 'all' || v.kind === kindFilter)
      .map((v) => ({
        slug: v.slug, kind: v.kind, titleEn: v.title.en, titleFa: v.title.fa,
        parts: v.parts.map((p) => ({ labelEn: p.label.en, labelFa: p.label.fa, source: p.source, direct: !!p.directUrl })),
        access: v.accessType, active: true, poster: v.posterUrl,
      }));

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = (kind: 'movie' | 'series') => {
    setEditingSlug(null);
    setForm({
      slug: '', kind, titleEn: '', titleFa: '', descEn: '', descFa: '',
      poster: '', backdrop: '', year: '', country: '', duration: '', rating: '',
      seasons: '', episodes: '', genreCsv: '', access: 'subscription',
      featured: false, isNew: false, trending: false, active: true,
    });
    setParts([emptyPart()]);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (v: ApiVideo) => {
    setEditingSlug(v.slug);
    setForm({
      slug: v.slug, kind: v.kind, titleEn: v.title.en, titleFa: v.title.fa,
      descEn: v.description.en, descFa: v.description.fa,
      poster: v.posterUrl ?? '', backdrop: v.backdropUrl ?? '',
      year: v.year != null ? String(v.year) : '', country: v.country ?? '',
      duration: v.durationMin != null ? String(v.durationMin) : '',
      rating: v.rating != null ? String(v.rating) : '',
      seasons: v.seasons != null ? String(v.seasons) : '',
      episodes: v.episodes != null ? String(v.episodes) : '',
      genreCsv: v.genre.join(', '), access: v.accessType,
      featured: !!v.isFeatured, isNew: !!v.isNew, trending: !!v.isTrending,
      active: v.isActive !== false,
    });
    setParts(v.parts.length > 0
      ? v.parts.map((p) => ({ labelEn: p.label.en, labelFa: p.label.fa, link: p.embedUrl, direct: p.directUrl ?? '' }))
      : [emptyPart()]);
    setError(null);
    setModalOpen(true);
  };

  const save = async () => {
    const t = getAdminToken();
    if (!t) return;
    setBusy(true);
    setError(null);
    try {
      if (!form.titleEn.trim()) {
        setError(language === 'fa' ? 'نام انگلیسی لازم است.' : 'English title is required.');
        setBusy(false);
        return;
      }
      // Every part needs a playable source: self-hosted file (preferred,
      // plays in the native TechLand player) and/or an OK.ru / VK / Bunny link.
      const normParts: Array<{ labelEn: string; labelFa: string; embedUrl: string; directUrl: string }> = [];
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const hasAny = p.link.trim() || p.direct.trim() || p.labelEn.trim() || p.labelFa.trim();
        if (!hasAny) continue;
        let embed = '';
        if (p.link.trim()) {
          const norm = normalizeEmbedUrl(p.link);
          if (!norm) {
            setError(language === 'fa'
              ? `لینک قسمت ${i + 1} معتبر نیست — لینک ok.ru / VK یا Bunny (embed/play/iframe) بچسبانید. لینک m3u8 (b-cdn) را در فیلد «فایل مستقیم» وارد کنید، نه اینجا؛ GUID خالی هم کافی نیست.`
              : `Part ${i + 1} link is invalid — paste an ok.ru / VK or Bunny (embed/play/iframe) link. Put m3u8 (b-cdn) URLs in the "Direct file" field, not here; a bare GUID alone is not enough.`);
            setBusy(false);
            return;
          }
          embed = norm;
        }
        const direct = p.direct.trim();
        if (direct && !/^https?:\/\/.+\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(direct) && !direct.startsWith('/media/')) {
          setError(language === 'fa'
            ? `فایل مستقیم قسمت ${i + 1} باید MP4/WebM/MOV/M3U8 باشد.`
            : `Part ${i + 1} direct file must be MP4/WebM/MOV/M3U8.`);
          setBusy(false);
          return;
        }
        if (!embed && !direct) {
          setError(language === 'fa' ? 'برای هر قسمت لینک پخش یا فایل مستقیم وارد کنید.' : 'Each part needs a playback link or a direct file.');
          setBusy(false);
          return;
        }
        normParts.push({ labelEn: p.labelEn.trim(), labelFa: p.labelFa.trim(), embedUrl: embed, directUrl: direct });
      }
      if (normParts.length === 0) {
        setError(language === 'fa' ? 'حداقل یک لینک پخش یا فایل مستقیم وارد کنید.' : 'Add at least one playback link or direct file.');
        setBusy(false);
        return;
      }
      const num = (s: string) => (s.trim() === '' ? null : Number(s));
      const payload: VideoInput = {
        kind: form.kind as 'movie' | 'series',
        titleEn: form.titleEn.trim(),
        titleFa: form.titleFa.trim(),
        descriptionEn: form.descEn.trim(),
        descriptionFa: form.descFa.trim(),
        posterUrl: form.poster.trim(),
        backdropUrl: form.backdrop.trim(),
        year: num(form.year),
        genre: form.genreCsv.split(',').map((g) => g.trim()).filter(Boolean),
        durationMin: num(form.duration),
        country: form.country.trim(),
        rating: num(form.rating),
        seasons: num(form.seasons),
        episodes: num(form.episodes),
        parts: normParts,
        accessType: form.access as 'free' | 'subscription',
        isFeatured: form.featured,
        isNew: form.isNew,
        isTrending: form.trending,
        isActive: form.active,
      };
      if (editingSlug) {
        await apiUpdateVideo(t, editingSlug, payload);
      } else {
        const slug = (form.slug.trim() || form.titleEn.trim())
          .toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
        if (!slug) {
          setError(language === 'fa' ? 'شناسه (slug) لازم است.' : 'A slug is required.');
          setBusy(false);
          return;
        }
        await apiCreateVideo(t, { ...payload, slug });
      }
      setModalOpen(false);
      await refresh();
    } catch (e) {
      setError(isUnauthorized(e)
        ? (language === 'fa'
          ? 'نشست ادمین منقضی شده — از بالای صفحه خارج شوید و دوباره وارد شوید.'
          : 'Admin session expired — sign out (top of the page) and sign in again.')
        : (e instanceof Error ? e.message : 'save_failed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (slug: string) => {
    const t = getAdminToken();
    if (!t) return;
    await apiDeleteVideo(t, slug);
    await refresh().catch(() => {});
  };

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'فیلم و سریال' : 'Movies & series'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت ویدیوها (OK / VK / Bunny)' : 'Manage videos (OK / VK / Bunny)'}</h2>
          <p>
            {backend
              ? language === 'fa'
                ? 'لینک تماشای ok.ru یا vk را بچسبانید؛ به‌صورت خودکار به لینک پخش تبدیل می‌شود. لوگوی پلتفرم منبع با ماسک خنثی پوشانده می‌شود.'
                : 'Paste an ok.ru / VK / Bunny link; it is auto-converted to a player link. OK/VK logos are covered with a neutral mask; Bunny needs no mask.'
              : language === 'fa'
                ? 'حالت نمایشی: فقط نمونه‌ها نمایش داده می‌شود. برای افزودن ویدیوی واقعی، VITE_API_URL را وصل کنید.'
                : 'Demo mode: samples only. Connect VITE_API_URL to add real videos.'}
          </p>
          <p className="directory-local-note">
            {language === 'fa'
              ? 'فقط ویدیوهایی را اضافه کنید که حق پخش آن را دارید.'
              : 'Only add videos you have the right to stream.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="quick-search-form" style={{ gridTemplateColumns: '150px' }}>
            <label className="quick-search-form__kind">
              <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)} aria-label="Kind">
                <option value="all">{language === 'fa' ? 'همه' : 'All'}</option>
                <option value="movie">{language === 'fa' ? 'فیلم' : 'Movies'}</option>
                <option value="series">{language === 'fa' ? 'سریال' : 'Series'}</option>
              </select>
            </label>
          </div>
          {backend && (
            <>
              <button type="button" className="pathway-button pathway-button--secondary" onClick={() => openAdd('movie')}>
                {language === 'fa' ? '＋ فیلم' : '＋ Movie'}
              </button>
              <button type="button" className="pathway-button" onClick={() => openAdd('series')}>
                {language === 'fa' ? '＋ سریال' : '＋ Series'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>{language === 'fa' ? 'ویدیو' : 'Video'}</th><th>{language === 'fa' ? 'قسمت‌ها / منبع' : 'Parts / source'}</th><th>{language === 'fa' ? 'دسترسی' : 'Access'}</th>{backend && <th>{language === 'fa' ? 'عملیات' : 'Actions'}</th>}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {r.poster && <img src={r.poster} alt="" style={{ width: 34, height: 48, objectFit: 'cover', borderRadius: 6 }} />}
                    <div>
                      <strong>{language === 'fa' ? (r.titleFa || r.titleEn) : r.titleEn}</strong>
                      <br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>{r.slug} · {r.kind}{r.active === false ? (language === 'fa' ? ' · غیرفعال' : ' · inactive') : ''}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 11 }}>
                  {r.parts.length === 0 && <span style={{ color: '#9aa6b7' }}>{language === 'fa' ? 'بدون لینک پخش' : 'no playback link'}</span>}
                  {r.parts.slice(0, 3).map((p, i) => (
                    <span key={i} style={{ display: 'inline-block', background: p.direct ? '#e7f6ec' : p.source === 'ok' ? '#fdf0dc' : p.source === 'vk' ? '#e7f0fd' : p.source === 'bunny' ? '#e8f5e9' : '#eef2f8', color: p.direct ? '#1c7a3d' : p.source === 'ok' ? '#9a5b00' : p.source === 'vk' ? '#1d4fb0' : p.source === 'bunny' ? '#1c7a3d' : '#41506b', borderRadius: 6, padding: '2px 8px', marginInlineEnd: 4, marginBottom: 4, fontWeight: 700 }}>
                      {p.direct ? (language === 'fa' ? 'مستقیم' : 'DIRECT') : p.source.toUpperCase()}{p.labelEn ? ` · ${p.labelEn}` : ''}
                    </span>
                  ))}
                  {r.parts.length > 3 && <span style={{ color: '#65718a' }}>+{r.parts.length - 3}</span>}
                </td>
                <td style={{ fontSize: 11 }}>{r.access === 'free' ? (language === 'fa' ? 'رایگان' : 'Free') : (language === 'fa' ? 'اشتراکی' : 'Sub')}</td>
                {backend && r.raw && (
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => openEdit(r.raw!)}>{language === 'fa' ? 'ویرایش' : 'Edit'}</button>
                      <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void remove(r.slug)}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={backend ? 4 : 3}>{language === 'fa' ? 'هنوز ویدیویی اضافه نشده است.' : 'No videos yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlug ? (language === 'fa' ? 'ویرایش ویدیو' : 'Edit video') : (language === 'fa' ? 'ویدیوی جدید' : 'New video')}
        subtitle={language === 'fa' ? 'لینک ok.ru یا VK بچسبانید — خودکار به لینک پخش تبدیل می‌شود' : 'Paste an ok.ru / VK / Bunny link — auto-converted to a player link'}
        onSubmit={() => void save()}
        submitLabel={language === 'fa' ? 'ذخیره' : 'Save'}
        loading={busy}
        size="lg"
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'نوع' : 'Kind'}>
              <FormSelect value={form.kind} onChange={(e) => set('kind', e.target.value)}>
                <option value="movie">{language === 'fa' ? 'فیلم' : 'Movie'}</option>
                <option value="series">{language === 'fa' ? 'سریال' : 'Series'}</option>
              </FormSelect>
            </FormField>
            <FormField label={language === 'fa' ? 'دسترسی' : 'Access'}>
              <FormSelect value={form.access} onChange={(e) => set('access', e.target.value)}>
                <option value="subscription">{language === 'fa' ? 'اشتراکی' : 'Subscription'}</option>
                <option value="free">{language === 'fa' ? 'رایگان' : 'Free'}</option>
              </FormSelect>
            </FormField>
          </div>
          {!editingSlug && (
            <FormField label="Slug (unique, latin)" hint={language === 'fa' ? 'خالی = ساخته‌شده از نام انگلیسی' : 'Empty = generated from English title'}>
              <FormInput value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} dir="ltr" />
            </FormField>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'نام (انگلیسی)' : 'Title (EN)'} required>
              <FormInput value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} dir="ltr" />
            </FormField>
            <FormField label={language === 'fa' ? 'نام (فارسی)' : 'Title (FA)'}>
              <FormInput value={form.titleFa} onChange={(e) => set('titleFa', e.target.value)} dir="rtl" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'سال' : 'Year'}><FormInput value={form.year} onChange={(e) => set('year', e.target.value)} dir="ltr" inputMode="numeric" placeholder="2024" /></FormField>
            <FormField label={language === 'fa' ? 'کشور' : 'Country'}><FormInput value={form.country} onChange={(e) => set('country', e.target.value)} /></FormField>
            <FormField label={language === 'fa' ? 'مدت (دقیقه)' : 'Duration (min)'}><FormInput value={form.duration} onChange={(e) => set('duration', e.target.value)} dir="ltr" inputMode="numeric" /></FormField>
            <FormField label={language === 'fa' ? 'امتیاز (۰ـ۱۰)' : 'Rating (0-10)'}><FormInput value={form.rating} onChange={(e) => set('rating', e.target.value)} dir="ltr" inputMode="decimal" /></FormField>
          </div>
          {form.kind === 'series' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label={language === 'fa' ? 'فصل‌ها' : 'Seasons'}><FormInput value={form.seasons} onChange={(e) => set('seasons', e.target.value)} dir="ltr" inputMode="numeric" /></FormField>
              <FormField label={language === 'fa' ? 'قسمت‌ها' : 'Episodes'}><FormInput value={form.episodes} onChange={(e) => set('episodes', e.target.value)} dir="ltr" inputMode="numeric" /></FormField>
            </div>
          )}
          <FormField label={language === 'fa' ? 'ژانر (با ویرگول)' : 'Genre (comma separated)'}>
            <FormInput value={form.genreCsv} onChange={(e) => set('genreCsv', e.target.value)} dir="ltr" placeholder="Action, Drama" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField
              label={language === 'fa' ? 'پوستر (URL)' : 'Poster (URL)'}
              hint={language === 'fa' ? 'لینک مستقیم عکس (https://…jpg) — نه لینک صفحه سایت' : 'Direct image link (https://…jpg) — not a web page link'}
            ><FormInput value={form.poster} onChange={(e) => set('poster', e.target.value)} dir="ltr" placeholder="https://…" /></FormField>
            <FormField
              label={language === 'fa' ? 'پس‌زمینه (URL)' : 'Backdrop (URL)'}
              hint={language === 'fa' ? 'اختیاری؛ خالی = استفاده از پوستر' : 'Optional; empty = uses poster'}
            ><FormInput value={form.backdrop} onChange={(e) => set('backdrop', e.target.value)} dir="ltr" placeholder="https://…" /></FormField>
          </div>
          {(form.poster.trim() || form.backdrop.trim()) && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {form.poster.trim() !== '' && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={form.poster.trim()}
                    alt=""
                    style={{ width: 68, height: 96, objectFit: 'cover', borderRadius: 8, border: '1px solid #dfe6ef', background: '#eef2f8' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.outline = '2px solid #b3261e'; }}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: '#65718a' }}>{language === 'fa' ? 'پوستر' : 'Poster'}</p>
                </div>
              )}
              {form.backdrop.trim() !== '' && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={form.backdrop.trim()}
                    alt=""
                    style={{ width: 150, height: 84, objectFit: 'cover', borderRadius: 8, border: '1px solid #dfe6ef', background: '#eef2f8' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.outline = '2px solid #b3261e'; }}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: '#65718a' }}>{language === 'fa' ? 'پس‌زمینه' : 'Backdrop'}</p>
                </div>
              )}
            </div>
          )}
          <FormField label={language === 'fa' ? 'توضیح (انگلیسی)' : 'Description (EN)'}><FormInput value={form.descEn} onChange={(e) => set('descEn', e.target.value)} /></FormField>
          <FormField label={language === 'fa' ? 'توضیح (فارسی)' : 'Description (FA)'}><FormInput value={form.descFa} onChange={(e) => set('descFa', e.target.value)} dir="rtl" /></FormField>

          <div>
            <p style={{ margin: '4px 0 8px', fontSize: 13, fontWeight: 700, color: '#07114f' }}>
              {language === 'fa' ? 'لینک‌های پخش (هر قسمت یک ردیف)' : 'Playback links (one row per part)'}
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {parts.map((p, i) => {
                const norm = p.link.trim() ? normalizeEmbedUrl(p.link) : null;
                const src = detectSource(norm ?? p.link);
                const ok = p.link.trim() === '' || norm !== null;
                return (
                  <div key={i} style={{ display: 'grid', gap: 6, border: '1px solid #e4eaf3', borderRadius: 12, padding: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                      <FormInput value={p.labelEn} onChange={(e) => setParts((arr) => arr.map((x, j) => (j === i ? { ...x, labelEn: e.target.value } : x)))} placeholder={language === 'fa' ? 'نام قسمت (EN)' : 'Part label (EN)'} dir="ltr" />
                      <FormInput value={p.labelFa} onChange={(e) => setParts((arr) => arr.map((x, j) => (j === i ? { ...x, labelFa: e.target.value } : x)))} placeholder={language === 'fa' ? 'نام قسمت (FA)' : 'Part label (FA)'} dir="rtl" />
                      <button type="button" className="opp-link" style={{ background: 'none', border: 0, whiteSpace: 'nowrap' }} onClick={() => setParts((arr) => arr.filter((_, j) => j !== i))}>
                        {language === 'fa' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <FormInput value={p.link} onChange={(e) => setParts((arr) => arr.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} placeholder="Bunny: https://player.mediadelivery.net/embed/… or paste <iframe> · OK/VK also OK" dir="ltr" style={{ borderColor: ok ? undefined : '#b3261e' }} />
                      {p.link.trim() !== '' && (
                        <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '3px 8px', background: norm ? (src === 'ok' ? '#fdf0dc' : src === 'bunny' ? '#e8f5e9' : '#e7f0fd') : '#fdecea', color: norm ? (src === 'ok' ? '#9a5b00' : src === 'bunny' ? '#1c7a3d' : '#1d4fb0') : '#b3261e', whiteSpace: 'nowrap' }}>
                          {norm ? src.toUpperCase() : (language === 'fa' ? 'نامعتبر' : 'INVALID')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <FormInput value={p.direct} onChange={(e) => setParts((arr) => arr.map((x, j) => (j === i ? { ...x, direct: e.target.value } : x)))} placeholder={language === 'fa' ? 'فایل مستقیم (MP4/HLS) — اولویت با پلیر تک‌لند' : 'Direct file (MP4/HLS, e.g. vz-….b-cdn.net/…/playlist.m3u8) — plays in TechLand player first'} dir="ltr" />
                      {p.direct.trim() !== '' && (
                        <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '3px 8px', background: '#e7f6ec', color: '#1c7a3d', whiteSpace: 'nowrap' }}>
                          {language === 'fa' ? 'مستقیم' : 'DIRECT'}
                        </span>
                      )}
                      <button
                        type="button"
                        className="pathway-button pathway-button--secondary"
                        style={{ minHeight: 36, whiteSpace: 'nowrap' }}
                        disabled={uploading}
                        onClick={() => pickFile(i)}
                      >
                        {uploading ? (language === 'fa' ? '…' : '…') : language === 'fa' ? 'آپلود فایل' : 'Upload file'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".mp4,.webm,.mov,.m3u8,video/mp4,video/webm"
              style={{ display: 'none' }}
              onChange={(e) => void onFileChosen(e.target.files?.[0])}
            />
            <button type="button" className="pathway-button pathway-button--secondary" style={{ minHeight: 36, marginTop: 8 }} onClick={() => setParts((arr) => [...arr, emptyPart()])}>
              {language === 'fa' ? '＋ افزودن قسمت' : '＋ Add part'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#35445d' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              {language === 'fa' ? 'ویژه' : 'Featured'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} />
              {language === 'fa' ? 'جدید' : 'New'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.trending} onChange={(e) => set('trending', e.target.checked)} />
              {language === 'fa' ? 'پربازدید' : 'Trending'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
              {language === 'fa' ? 'فعال (نمایش در سایت)' : 'Active (visible on site)'}
            </label>
          </div>
          {error && <p style={{ color: '#b3261e', fontSize: 12, margin: 0 }}>{error}</p>}
        </div>
      </FormModal>
    </div>
  );
}

/* ------------- Ads (banners on Movies / Series / Watch) ------------- */

const AD_SLOT_OPTIONS: Array<{ value: 'movies_hero' | 'series_hero' | 'watch_top' | 'watch_bottom'; labelEn: string; labelFa: string }> = [
  { value: 'movies_hero', labelEn: 'Movies page — top', labelFa: 'صفحه فیلم‌ها — بالا' },
  { value: 'series_hero', labelEn: 'Series page — top', labelFa: 'صفحه سریال‌ها — بالا' },
  { value: 'watch_top', labelEn: 'Watch page — above player', labelFa: 'صفحه تماشا — بالای پلیر' },
  { value: 'watch_bottom', labelEn: 'Watch page — below player', labelFa: 'صفحه تماشا — پایین پلیر' },
];

function AdsView() {
  const { language } = useLanguage();
  const [ads, setAds] = useState<ApiAd[]>([]);
  const [slotFilter, setSlotFilter] = useState<'all' | ApiAd['slot']>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slot: 'movies_hero' as ApiAd['slot'], title: '', imageUrl: '', linkUrl: '',
    html: '', isActive: true, sortOrder: '0',
  });

  const refresh = async () => {
    const t = getAdminToken();
    if (!t) return;
    const r = await apiAdminAds(t);
    setAds(r.ads);
  };

  useEffect(() => {
    void refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = ads.filter((a) => slotFilter === 'all' || a.slot === slotFilter);
  const slotLabel = (s: ApiAd['slot']) =>
    AD_SLOT_OPTIONS.find((o) => o.value === s)?.[language === 'fa' ? 'labelFa' : 'labelEn'] ?? s;
  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditingId(null);
    setForm({ slot: 'movies_hero', title: '', imageUrl: '', linkUrl: '', html: '', isActive: true, sortOrder: '0' });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (a: ApiAd) => {
    setEditingId(a.id);
    setForm({
      slot: a.slot, title: a.title, imageUrl: a.imageUrl ?? '', linkUrl: a.linkUrl ?? '',
      html: a.html ?? '', isActive: a.isActive !== false, sortOrder: '0',
    });
    setError(null);
    setModalOpen(true);
  };

  const save = async () => {
    const t = getAdminToken();
    if (!t) return;
    setBusy(true);
    setError(null);
    try {
      const payload: AdInput = {
        slot: form.slot,
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim(),
        html: form.html.trim(),
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) await apiUpdateAd(t, editingId, payload);
      else await apiCreateAd(t, { ...payload, slot: form.slot });
      setModalOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'save_failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const t = getAdminToken();
    if (!t) return;
    await apiDeleteAd(t, id);
    await refresh().catch(() => {});
  };

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'تبلیغات' : 'Ads'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'مدیریت بنرهای تبلیغاتی' : 'Manage ad banners'}</h2>
          <p>
            {language === 'fa'
              ? 'بنر تصویری (با لینک) یا HTML دلخواه برای هر جایگاه. اگر جایگاهی تبلیغ فعال نداشته باشد، چیزی نمایش داده نمی‌شود.'
              : 'Image banner (with link) or custom HTML per slot. Slots without an active ad show nothing.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="quick-search-form" style={{ gridTemplateColumns: '190px' }}>
            <label className="quick-search-form__kind">
              <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value as typeof slotFilter)} aria-label="Slot">
                <option value="all">{language === 'fa' ? 'همه جایگاه‌ها' : 'All slots'}</option>
                {AD_SLOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{language === 'fa' ? o.labelFa : o.labelEn}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" className="pathway-button" onClick={openAdd}>
            {language === 'fa' ? '＋ افزودن تبلیغ' : '＋ Add ad'}
          </button>
        </div>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>{language === 'fa' ? 'تبلیغ' : 'Ad'}</th><th>{language === 'fa' ? 'جایگاه' : 'Slot'}</th><th>{language === 'fa' ? 'وضعیت' : 'Status'}</th><th>{language === 'fa' ? 'عملیات' : 'Actions'}</th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {a.imageUrl && <img src={a.imageUrl} alt="" style={{ width: 72, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                    <div>
                      <strong>{a.title || (language === 'fa' ? '(بدون عنوان)' : '(untitled)')}</strong>
                      {a.html && <><br /><span style={{ fontSize: 11, color: '#9aa6b7' }}>HTML</span></>}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 11 }}>{slotLabel(a.slot)}</td>
                <td style={{ fontSize: 11 }}>{a.isActive !== false ? (language === 'fa' ? 'فعال' : 'Active') : (language === 'fa' ? 'غیرفعال' : 'Off')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => openEdit(a)}>{language === 'fa' ? 'ویرایش' : 'Edit'}</button>
                    <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => void remove(a.id)}>{language === 'fa' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4}>{language === 'fa' ? 'تبلیغی ثبت نشده است.' : 'No ads yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (language === 'fa' ? 'ویرایش تبلیغ' : 'Edit ad') : (language === 'fa' ? 'تبلیغ جدید' : 'New ad')}
        onSubmit={() => void save()}
        submitLabel={language === 'fa' ? 'ذخیره' : 'Save'}
        loading={busy}
        size="lg"
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'جایگاه' : 'Slot'}>
              <FormSelect value={form.slot} onChange={(e) => set('slot', e.target.value)}>
                {AD_SLOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{language === 'fa' ? o.labelFa : o.labelEn}</option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label={language === 'fa' ? 'عنوان' : 'Title'}>
              <FormInput value={form.title} onChange={(e) => set('title', e.target.value)} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label={language === 'fa' ? 'عکس بنر (URL)' : 'Banner image (URL)'}>
              <FormInput value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} dir="ltr" placeholder="https://…" />
            </FormField>
            <FormField label={language === 'fa' ? 'لینک کلیک' : 'Click link'}>
              <FormInput value={form.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} dir="ltr" placeholder="https://…" />
            </FormField>
          </div>
          {form.imageUrl.trim() !== '' && (
            <img src={form.imageUrl.trim()} alt="" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid #dfe6ef' }} onError={(e) => { (e.target as HTMLImageElement).style.outline = '2px solid #b3261e'; }} />
          )}
          <FormField label="HTML (optional — overrides image)" hint={language === 'fa' ? 'اختیاری؛ اگر پر باشد جای عکس نمایش داده می‌شود' : 'Optional; shown instead of the image when set'}>
            <FormTextarea value={form.html} onChange={(e) => set('html', e.target.value)} rows={4} dir="ltr" placeholder="<div>…</div>" />
          </FormField>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#35445d' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            {language === 'fa' ? 'فعال' : 'Active'}
          </label>
          {error && <p style={{ color: '#b3261e', fontSize: 12, margin: 0 }}>{error}</p>}
        </div>
      </FormModal>
    </div>
  );
}

/* ------------- Settings ------------- */

function SettingsView({ settings, setSettings }: { settings: ReturnType<typeof useSiteSettings>['settings']; setSettings: ReturnType<typeof useSiteSettings>['setSettings'] }) {
  const { language } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [adminName, setAdminName] = useState(() => getAdminUsername());
  const [adminPass, setAdminPass] = useState('');
  const [qrBroken, setQrBroken] = useState(false);

  const onQrFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 800 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettings({ ...settings, hesabpayQrImage: reader.result });
        setQrBroken(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="pathway-section__head">
        <div>
          <p className="pathway-eyebrow">{language === 'fa' ? 'تنظیمات' : 'Settings'}</p>
          <h2 style={{ margin: 0 }}>{language === 'fa' ? 'تنظیمات سایت، حساب‌پی و ادمین' : 'Site, HesabPay & admin settings'}</h2>
        </div>
        <button
          type="button"
          className="pathway-button"
          onClick={() => {
            void (async () => {
              if (isBackendEnabled) {
                const token = getAdminToken();
                if (token && (adminName.trim() || adminPass)) {
                  // Secure: bcrypt hashing happens server-side; plain password only travels over this HTTPS request.
                  await apiChangeAdminCreds(token, {
                    ...(adminName.trim() ? { username: adminName.trim() } : {}),
                    ...(adminPass ? { newPassword: adminPass } : {}),
                  });
                }
                // NOTE: site settings persistence on the server (PUT /api/admin/settings)
                // is available via apiSaveAdminSettings; CMS content stays local until migrated.
              } else if (adminName.trim()) {
                changeAdminCreds(adminName, adminPass);
              }
              setAdminPass('');
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2000);
            })();
          }}
        >
          {saved ? (language === 'fa' ? '✓ ذخیره شد' : '✓ Saved') : language === 'fa' ? 'ذخیره' : 'Save'}
        </button>
      </div>

      <h3 style={{ color: '#07114f' }}>{language === 'fa' ? 'حساب ادمین' : 'Admin account'}</h3>
      <div className="directory-filters" style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <div className="pathway-field"><label>{language === 'fa' ? 'نام کاربری ادمین' : 'Admin username'}<input value={adminName} onChange={(e) => setAdminName(e.target.value)} dir="ltr" autoComplete="off" /></label></div>
        <div className="pathway-field"><label>{language === 'fa' ? 'رمز عبور جدید (خالی = بدون تغییر)' : 'New password (empty = no change)'}<input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} dir="ltr" autoComplete="new-password" placeholder="••••••••" /></label></div>
      </div>

      <h3 style={{ color: '#07114f' }}>{language === 'fa' ? 'QR کد حساب‌پی' : 'HesabPay QR code'}</h3>
      <div className="directory-filters" style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {settings.hesabpayQrImage ? (
            <img
              src={settings.hesabpayQrImage}
              alt="HesabPay QR"
              style={{ width: 180, height: 180, objectFit: 'contain', border: '1px solid #dfe6ef', borderRadius: 14, background: '#fff' }}
            />
          ) : qrBroken ? (
            <div style={{ width: 180, minHeight: 180, border: '2px dashed #b3261e', borderRadius: 14, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, textAlign: 'center', fontSize: 11, color: '#7a1f1a' }}>
              {language === 'fa'
                ? 'فایل public/assets/hesabpay-qr.png پیدا نشد. با دکمهٔ زیر تصویر QR را آپلود کنید.'
                : 'File public/assets/hesabpay-qr.png not found. Upload the QR image with the button below.'}
            </div>
          ) : (
            <img
              src="/assets/hesabpay-qr.png"
              alt="HesabPay QR"
              style={{ width: 180, height: 180, objectFit: 'contain', border: '1px solid #dfe6ef', borderRadius: 14, background: '#fff' }}
              onError={() => setQrBroken(true)}
            />
          )}
          <div style={{ display: 'grid', gap: 10, flex: '1 1 220px' }}>
            <div className="pathway-field"><label>{language === 'fa' ? 'نام حساب (نمایشی)' : 'Account label (display)'}<input value={settings.hesabpayAccountLabel} onChange={(e) => setSettings({ ...settings, hesabpayAccountLabel: e.target.value })} /></label></div>
            <label className="pathway-button pathway-button--secondary" style={{ cursor: 'pointer', textAlign: 'center' }}>
              {language === 'fa' ? 'آپلود QR کد' : 'Upload QR code'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onQrFile(e.target.files?.[0])} />
            </label>
            {settings.hesabpayQrImage && (
              <button type="button" className="opp-link" style={{ background: 'none', border: 0 }} onClick={() => setSettings({ ...settings, hesabpayQrImage: '' })}>
                {language === 'fa' ? 'حذف و استفاده از فایل پیش‌فرض' : 'Remove, use default file'}
              </button>
            )}
            <p className="directory-local-note">
              {language === 'fa'
                ? 'می‌توانید تصویر QR حساب‌پی را اینجا آپلود کنید، یا فایل را در public/assets/hesabpay-qr.png بگذارید.'
                : 'Upload the HesabPay QR image here, or place the file at public/assets/hesabpay-qr.png.'}
            </p>
          </div>
        </div>
      </div>

      <h3 style={{ color: '#07114f' }}>{language === 'fa' ? 'سایت' : 'Site'}</h3>
      <div className="directory-filters" style={{ display: 'grid', gap: 12 }}>
        <div className="pathway-field"><label>Site name (EN)<input value={settings.siteNameEn} onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })} /></label></div>
        <div className="pathway-field"><label>Site name (FA)<input value={settings.siteNameFa} onChange={(e) => setSettings({ ...settings, siteNameFa: e.target.value })} dir="rtl" /></label></div>
        <div className="pathway-field"><label>Tagline (EN)<input value={settings.taglineEn} onChange={(e) => setSettings({ ...settings, taglineEn: e.target.value })} /></label></div>
        <div className="pathway-field"><label>Tagline (FA)<input value={settings.taglineFa} onChange={(e) => setSettings({ ...settings, taglineFa: e.target.value })} dir="rtl" /></label></div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#35445d' }}>
          <input type="checkbox" checked={settings.testMode} onChange={(e) => setSettings({ ...settings, testMode: e.target.checked })} />
          {language === 'fa' ? 'حالت تست' : 'Test mode'}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#35445d' }}>
          <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
          {language === 'fa' ? 'حالت تعمیرات' : 'Maintenance mode'}
        </label>
        <p className="directory-local-note">
          {language === 'fa'
            ? 'این نسخهٔ نمایشی بدون سرور است؛ رمزها در مرورگر نگه‌داری می‌شود. برای نسخهٔ واقعی، احراز هویت باید به بک‌اند امن منتقل شود.'
            : 'This is a serverless preview; secrets stay in the browser. For production, authentication must move to a secure backend.'}
        </p>
      </div>
    </div>
  );
}
