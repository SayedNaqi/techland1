import { useMemo, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import AdminShell from '@/components/admin/AdminShell';
import FormModal, { FormField, FormInput } from '@/components/admin/FormModal';
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
  PAYMENT_PLANS,
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
import type { GuideRecord, OpportunityRecord, VisaTopic } from '@/types/opportunity';

type SectionKey = 'dashboard' | 'opportunities' | 'guides' | 'visa' | 'users' | 'payments' | 'settings';

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
  const [authed, setAuthed] = useState(() => isAdminAuthed());

  if (!authed) {
    return <AdminLogin onDone={() => setAuthed(true)} />;
  }

  return <AdminApp language={language} onLogout={() => { adminLogout(); setAuthed(false); }} />;
}

/* ---------------- Login gate ---------------- */

function AdminLogin({ onDone }: { onDone: () => void }) {
  const { language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (adminLogin(username, password)) {
      setError(false);
      onDone();
    } else {
      setError(true);
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
            <button type="button" className="pathway-button" onClick={submit}>
              {language === 'fa' ? 'ورود به پنل' : 'Enter panel'}
            </button>
            <p className="pathway-fineprint">
              {language === 'fa'
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

function AdminApp({ language, onLogout }: { language: 'en' | 'fa'; onLogout: () => void }) {
  const [section, setSection] = useState<SectionKey>('dashboard');
  const opp = useOpportunitiesAdmin();
  const guides = useGuidesAdmin();
  const visa = useVisaAdmin();
  const { settings, setSettings } = useSiteSettings();
  const [txVersion, setTxVersion] = useState(0);
  const [userVersion, setUserVersion] = useState(0);

  const transactions = useMemo(() => listTransactions(), [txVersion]);
  void txVersion;
  const users = useMemo(() => listUsers(), [userVersion]);
  void userVersion;

  const revenue = useMemo(
    () => transactions.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amountUSD, 0),
    [transactions],
  );

  const nav = [
    { key: 'dashboard', labelEn: 'Dashboard', labelFa: 'داشبورد' },
    { key: 'opportunities', labelEn: 'Opportunities', labelFa: 'فرصت‌ها', count: opp.items.length },
    { key: 'guides', labelEn: 'Guides', labelFa: 'راهنماها', count: guides.items.length },
    { key: 'visa', labelEn: 'Visa topics', labelFa: 'موضوعات ویزا', count: visa.items.length },
    { key: 'users', labelEn: 'Users', labelFa: 'کاربران', count: users.length },
    { key: 'payments', labelEn: 'Payments', labelFa: 'پرداخت‌ها', count: transactions.length },
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
            oppCount={opp.items.length}
            guideCount={guides.items.length}
            visaCount={visa.items.length}
            userCount={users.length}
            txCount={transactions.length}
            revenue={revenue}
            pending={transactions.filter((t) => t.status === 'pending').length}
            onGo={setSection}
          />
        )}
        {section === 'opportunities' && <OpportunitiesView store={opp} />}
        {section === 'guides' && <GuidesView store={guides} />}
        {section === 'visa' && <VisaView store={visa} />}
        {section === 'users' && <UsersView onChanged={() => setUserVersion((v) => v + 1)} />}
        {section === 'payments' && (
          <PaymentsView
            onChanged={() => { setTxVersion((v) => v + 1); setUserVersion((v) => v + 1); }}
          />
        )}
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
            {language === 'fa'
              ? `مجموع محتوا: ${props.oppCount + props.guideCount + props.visaCount} مورد · کاربران: ${props.userCount} · درآمد ثبت‌شده: $${props.revenue.toFixed(2)}. همهٔ آمار از دادهٔ محلی همین مرورگر ساخته می‌شود.`
              : `Total content: ${props.oppCount + props.guideCount + props.visaCount} items · Users: ${props.userCount} · Recorded revenue: $${props.revenue.toFixed(2)}. All analytics are computed from this browser's local data.`}
          </p>
        </div>
      </div>
      <h3 style={{ color: '#07114f', margin: '22px 0 12px' }}>{language === 'fa' ? 'پلن‌های اشتراک' : 'Subscription plans'}</h3>
      <PaymentSection compact />
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

/* ------------- Users ------------- */

function UsersView({ onChanged }: { onChanged: () => void }) {
  const { language } = useLanguage();
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
                    {PAYMENT_PLANS.map((p) => (
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

/* ------------- Payments (admin) ------------- */

function PaymentsView({ onChanged }: { onChanged: () => void }) {
  const { language } = useLanguage();
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
        {PAYMENT_PLANS.map((p) => (
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
            if (adminName.trim()) changeAdminCreds(adminName, adminPass);
            setAdminPass('');
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
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
