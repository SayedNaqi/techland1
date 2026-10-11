import { Film, Tv, Gamepad2, AppWindow, Users, ShoppingBag, CreditCard, TrendingUp, DollarSign, Eye, Download, Star } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { MOVIES, SERIES, GAMES, SOFTWARE_LIST, PRODUCTS } from '@/constants/mockData';
import { Link } from 'react-router-dom';

const RECENT_ACTIVITY = [
  { id: 1, action: 'New user registered', user: 'Ahmad Karimi', time: '2 min ago', type: 'user' },
  { id: 2, action: 'Movie added: Dune Part Two', user: 'Admin', time: '15 min ago', type: 'content' },
  { id: 3, action: 'Subscription purchased', user: 'Sara Ahmadi', time: '32 min ago', type: 'payment' },
  { id: 4, action: 'Software downloaded: VLC', user: 'Reza Mohammadi', time: '1 hr ago', type: 'download' },
  { id: 5, action: 'New game added: GTA VI', user: 'Admin', time: '2 hr ago', type: 'content' },
  { id: 6, action: 'Order placed #1042', user: 'Maryam Hosseini', time: '3 hr ago', type: 'order' },
];

const QUICK_LINKS = [
  { label: 'Add Movie', href: '/admin/movies', icon: Film, color: 'from-blue-500 to-cyan-500' },
  { label: 'Add Series', href: '/admin/series', icon: Tv, color: 'from-purple-500 to-pink-500' },
  { label: 'Add Game', href: '/admin/games', icon: Gamepad2, color: 'from-orange-500 to-red-500' },
  { label: 'Add Software', href: '/admin/software', icon: AppWindow, color: 'from-green-500 to-teal-500' },
  { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'from-yellow-500 to-orange-500' },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, color: 'from-indigo-500 to-blue-500' },
];

const TYPE_COLORS: Record<string, string> = {
  user: 'bg-blue-500/20 text-blue-400',
  content: 'bg-green-500/20 text-green-400',
  payment: 'bg-yellow-500/20 text-yellow-400',
  download: 'bg-purple-500/20 text-purple-400',
  order: 'bg-orange-500/20 text-orange-400',
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass border border-white/5 rounded-2xl p-6 circuit-bg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">
              Welcome back, <span className="gradient-text">Admin</span>
            </h2>
            <p className="text-sm text-muted-foreground">Here's an overview of TechLand platform activity.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Last updated</p>
            <p className="text-xs font-medium text-foreground">Just now</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Movies" value={MOVIES.length} change="+3 this week" changeType="up" icon={Film} />
        <StatCard label="TV Series" value={SERIES.length} change="+1 this week" changeType="up" icon={Tv} />
        <StatCard label="Games" value={GAMES.length} change="+2 this month" changeType="up" icon={Gamepad2} />
        <StatCard label="Software" value={SOFTWARE_LIST.length} change="+4 this month" changeType="up" icon={AppWindow} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Users" value="12,450" change="+8.2% this month" changeType="up" icon={Users} gradient="bg-gradient-to-br from-purple-500 to-pink-500" />
        <StatCard label="Monthly Revenue" value="$4,820" change="+12.5% vs last" changeType="up" icon={DollarSign} gradient="bg-gradient-to-br from-yellow-500 to-orange-500" />
        <StatCard label="Page Views" value="94.2K" change="+5.1% this week" changeType="up" icon={Eye} gradient="bg-gradient-to-br from-green-500 to-teal-500" />
        <StatCard label="Downloads" value="28.7K" change="+3.4% this month" changeType="up" icon={Download} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex flex-col items-center gap-2 p-3 glass border border-white/5 rounded-xl hover:border-white/15 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground/80 text-center leading-tight">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 glass border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Recent Activity</h3>
            <span className="text-xs text-muted-foreground">Last 24 hours</span>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${TYPE_COLORS[a.type]}`}>
                  {a.type[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 truncate">{a.action}</p>
                  <p className="text-xs text-muted-foreground">by {a.user}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Rated Movies */}
        <div className="glass border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Top Rated Movies
          </h3>
          <div className="space-y-2.5">
            {[...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, 5).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <img src={m.poster} alt={m.title} className="w-8 h-11 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.year} • {m.genre[0]}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">{m.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Stock */}
        <div className="glass border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" /> Product Inventory
          </h3>
          <div className="space-y-2.5">
            {PRODUCTS.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.thumbnail} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">${p.price}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                  p.stock > 20 ? 'bg-green-500/20 text-green-400' :
                  p.stock > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
