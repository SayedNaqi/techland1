import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Crown, Gamepad2, AppWindow, History, Heart,
  Calendar, ChevronRight, Play, Star, Download, Clock,
  CheckCircle, ArrowRight, Settings, Shield
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/hooks/useLanguage';
import { MOVIES, SERIES, GAMES, SOFTWARE_LIST } from '@/constants/mockData';
import { cn, formatPrice } from '@/lib/utils';

type Tab = 'subscription' | 'games' | 'software' | 'history' | 'favorites';

const MOCK_USER = {
  name: 'Ahmad Karimi',
  email: 'ahmad@example.com',
  avatar: 'https://i.pravatar.cc/120?img=11',
  plan: 'Yearly',
  planStart: '2025-06-01',
  planExpiry: '2026-06-01',
  country: 'Afghanistan',
  joinedAt: '2025-01-15',
};

const PURCHASED_GAMES = GAMES.slice(0, 4).map(g => ({
  ...g,
  purchasedAt: '2025-05-12',
}));

const PURCHASED_SOFTWARE = SOFTWARE_LIST.filter(s => s.accessType === 'paid').slice(0, 3).map(s => ({
  ...s,
  purchasedAt: '2025-04-20',
}));

const WATCH_HISTORY = [
  { ...MOVIES[0], type: 'movie' as const, progress: 78, watchedAt: '2 hours ago', lastEpisode: null },
  { ...SERIES[0], type: 'series' as const, progress: 45, watchedAt: 'Yesterday', lastEpisode: 'S3E7 - Ozymandias' },
  { ...MOVIES[1], type: 'movie' as const, progress: 100, watchedAt: '3 days ago', lastEpisode: null },
  { ...SERIES[1], type: 'series' as const, progress: 20, watchedAt: '5 days ago', lastEpisode: 'S2E3 - The Ghost' },
  { ...MOVIES[3], type: 'movie' as const, progress: 62, watchedAt: 'Last week', lastEpisode: null },
  { ...SERIES[2], type: 'series' as const, progress: 90, watchedAt: 'Last week', lastEpisode: 'S1E8 - When We Are in Need' },
];

const FAVORITES = [
  { ...MOVIES[2], type: 'movie' as const, addedAt: '2025-04-10' },
  { ...MOVIES[7], type: 'movie' as const, addedAt: '2025-03-22' },
  { ...SERIES[0], type: 'series' as const, addedAt: '2025-02-15' },
  { ...MOVIES[5], type: 'movie' as const, addedAt: '2025-01-30' },
  { ...SERIES[2], type: 'series' as const, addedAt: '2025-01-05' },
];

const TABS = [
  { id: 'subscription' as Tab, label: 'Subscription', icon: Crown },
  { id: 'history' as Tab, label: 'Watch History', icon: History },
  { id: 'favorites' as Tab, label: 'My Favorites', icon: Heart },
  { id: 'games' as Tab, label: 'My Games', icon: Gamepad2 },
  { id: 'software' as Tab, label: 'My Software', icon: AppWindow },
];

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Profile() {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('subscription');
  const [searchOpen, setSearchOpen] = useState(false);

  const daysLeft = daysUntil(MOCK_USER.planExpiry);
  const progressPct = Math.max(0, Math.min(100, Math.round(
    ((new Date(MOCK_USER.planExpiry).getTime() - Date.now()) /
     (new Date(MOCK_USER.planExpiry).getTime() - new Date(MOCK_USER.planStart).getTime())) * 100
  )));

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchOpen={() => setSearchOpen(true)} />

      <div className="pt-16">
        {/* Profile Hero */}
        <div className="relative bg-card/40 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10" />
          <div className="relative container mx-auto px-4 py-10 max-w-6xl">
            <div className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-5', isRTL && 'sm:flex-row-reverse')}>
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg shadow-primary/20">
                  <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className={cn('flex-1', isRTL && 'text-right')}>
                <h1 className="text-xl font-black text-foreground">{MOCK_USER.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{MOCK_USER.email}</p>
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1 gradient-brand text-white text-xs font-bold rounded-lg">
                    <Crown className="w-3 h-3" /> {MOCK_USER.plan} Plan
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 glass border border-white/10 text-xs text-muted-foreground rounded-lg">
                    <Shield className="w-3 h-3" /> {MOCK_USER.country}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 glass border border-white/10 text-xs text-muted-foreground rounded-lg">
                    <Calendar className="w-3 h-3" /> Joined {MOCK_USER.joinedAt}
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
                <Settings className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <aside className="lg:w-52 shrink-0">
              <nav className="glass border border-white/5 rounded-2xl p-2 space-y-1 lg:sticky lg:top-20">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'gradient-brand text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                      isRTL && 'flex-row-reverse text-right'
                    )}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">

              {/* ── SUBSCRIPTION TAB ── */}
              {activeTab === 'subscription' && (
                <div className="space-y-5">
                  {/* Active Plan Card */}
                  <div className="relative glass border border-primary/20 rounded-2xl p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                        <div>
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Current Plan</p>
                          <h2 className="text-2xl font-black text-foreground">{MOCK_USER.plan} Subscription</h2>
                          <p className="text-sm text-muted-foreground mt-1">Active since {MOCK_USER.planStart}</p>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-bold rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      </div>

                      {/* Expiry Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Subscription Progress</span>
                          <span className={cn('font-semibold', daysLeft < 30 ? 'text-orange-400' : 'text-primary')}>
                            {daysLeft} days remaining
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-brand rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                          <span>{MOCK_USER.planStart}</span>
                          <span>Expires: {MOCK_USER.planExpiry}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        {[
                          { label: 'Plan', value: MOCK_USER.plan },
                          { label: 'Expires', value: MOCK_USER.planExpiry },
                          { label: 'Days Left', value: daysLeft.toString() },
                          { label: 'Status', value: 'Active' },
                        ].map(item => (
                          <div key={item.label} className="glass border border-white/5 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-sm font-bold text-foreground">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <Link
                          to={`/${language}/subscriptions`}
                          className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
                        >
                          <Crown className="w-4 h-4" /> Upgrade Plan
                        </Link>
                        <button className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 text-sm text-muted-foreground rounded-xl hover:text-foreground transition-all">
                          <Calendar className="w-4 h-4" /> Renew Early
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Features Included */}
                  <div className="glass border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-foreground mb-4">What's Included</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        'Unlimited Streaming (Movies & Series)',
                        'HD & 4K Quality Playback',
                        'Movie & Series Downloads',
                        'Ad-Free Experience',
                        'Multi-Device Access',
                        'Offline Mode',
                        'Priority Support',
                        'Early Access to New Content',
                      ].map(f => (
                        <div key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="glass border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-foreground mb-4">Payment History</h3>
                    <div className="space-y-2">
                      {[
                        { date: '2025-06-01', plan: 'Yearly Plan', amount: '$49.99', method: 'USDT TRC20', status: 'Paid' },
                        { date: '2024-06-01', plan: 'Monthly Plan', amount: '$5.99', method: 'HesabPay', status: 'Paid' },
                        { date: '2024-05-01', plan: 'Monthly Plan', amount: '$5.99', method: 'HesabPay', status: 'Paid' },
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Crown className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{tx.plan}</p>
                              <p className="text-xs text-muted-foreground">{tx.date} · {tx.method}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-primary">{tx.amount}</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-lg">{tx.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── WATCH HISTORY TAB ── */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-foreground flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" /> Watch History
                    </h2>
                    <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear History</button>
                  </div>

                  {/* Continue Watching */}
                  <div className="glass border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Continue Watching</p>
                    <div className="space-y-3">
                      {WATCH_HISTORY.filter(w => w.progress < 100).map((item, i) => (
                        <div key={`hw-${i}`} className="flex items-start gap-3 group">
                          <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                            {/* Progress bar on thumbnail */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                                {item.lastEpisode && (
                                  <p className="text-xs text-primary mt-0.5">{item.lastEpisode}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {item.watchedAt}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-primary shrink-0">{item.progress}%</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full gradient-brand rounded-full transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="glass border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Completed</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {WATCH_HISTORY.filter(w => w.progress === 100).map((item, i) => (
                        <div key={`hc-${i}`} className="relative glass border border-white/5 rounded-xl overflow-hidden group card-hover">
                          <img src={item.poster} alt={item.title} className="w-full h-28 object-cover" />
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-green-400 drop-shadow" />
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{item.watchedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── FAVORITES TAB ── */}
              {activeTab === 'favorites' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400 fill-red-400" /> My Favorites
                    <span className="text-xs font-normal text-muted-foreground">({FAVORITES.length} items)</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {FAVORITES.map((item, i) => (
                      <Link
                        key={`fav-${i}`}
                        to={`/${language}/${item.type === 'movie' ? 'movies' : 'series'}/${item.id}`}
                        className="glass border border-white/5 rounded-2xl overflow-hidden card-hover group"
                      >
                        <div className="relative">
                          <img src={item.poster} alt={item.title} className="w-full h-40 object-cover" />
                          <button className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Heart className="w-3.5 h-3.5 text-white fill-white" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">{item.rating}</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 capitalize flex items-center justify-between">
                            <span>{item.type} · {item.year}</span>
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── MY GAMES TAB ── */}
              {activeTab === 'games' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-foreground flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-primary" /> My Games
                      <span className="text-xs font-normal text-muted-foreground">({PURCHASED_GAMES.length} owned)</span>
                    </h2>
                    <Link to={`/${language}/games`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      Browse More <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PURCHASED_GAMES.map(game => (
                      <div key={game.id} className="glass border border-white/5 rounded-2xl overflow-hidden card-hover flex">
                        <img src={game.thumbnail} alt={game.title} className="w-24 h-24 object-cover shrink-0" />
                        <div className="flex-1 p-3.5 min-w-0">
                          <p className="font-semibold text-foreground text-sm line-clamp-1">{game.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{game.developer}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              <span className="text-xs font-bold">{game.rating}</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">{game.releaseYear}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {game.platform.slice(0, 2).map(p => (
                              <span key={p} className="px-1.5 py-0.5 text-[9px] glass rounded border border-white/10 text-muted-foreground">{p}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <button className="flex items-center gap-1 px-2.5 py-1 gradient-brand text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-all">
                              <Download className="w-3 h-3" /> Download
                            </button>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400" /> Purchased
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {PURCHASED_GAMES.length === 0 && (
                    <div className="text-center py-16 glass border border-white/5 rounded-2xl">
                      <Gamepad2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">No games purchased yet</p>
                      <Link to={`/${language}/games`} className="text-xs text-primary hover:underline">Browse Game Store →</Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── MY SOFTWARE TAB ── */}
              {activeTab === 'software' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-foreground flex items-center gap-2">
                      <AppWindow className="w-4 h-4 text-primary" /> My Software
                      <span className="text-xs font-normal text-muted-foreground">({PURCHASED_SOFTWARE.length} owned)</span>
                    </h2>
                    <Link to={`/${language}/software`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      Browse More <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {PURCHASED_SOFTWARE.map(sw => (
                      <div key={sw.id} className="glass border border-white/5 rounded-2xl p-4 flex items-center gap-4 card-hover">
                        <img src={sw.thumbnail} alt={sw.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground text-sm">{sw.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">v{sw.version} · {sw.developer}</p>
                            </div>
                            <span className="text-xs font-bold text-primary shrink-0">
                              {sw.price ? formatPrice(sw.price, sw.currency) : 'Free'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {sw.platform.slice(0, 3).map(p => (
                              <span key={p} className="px-2 py-0.5 text-[10px] glass rounded border border-white/10 text-muted-foreground">{p}</span>
                            ))}
                            <span className="text-[10px] text-muted-foreground ml-auto">Purchased {sw.purchasedAt}</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-2 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shrink-0">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    ))}
                  </div>

                  {PURCHASED_SOFTWARE.length === 0 && (
                    <div className="text-center py-16 glass border border-white/5 rounded-2xl">
                      <AppWindow className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">No software purchased yet</p>
                      <Link to={`/${language}/software`} className="text-xs text-primary hover:underline">Browse Software Store →</Link>
                    </div>
                  )}
                </div>
              )}

            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
