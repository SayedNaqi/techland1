import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Film, Tv, Gamepad2, AppWindow, ShoppingBag,
  CreditCard, Users, ChevronLeft, ChevronRight, LogOut, Bell,
  Settings, Menu, X, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Movies', href: '/admin/movies', icon: Film },
  { label: 'TV Series', href: '/admin/series', icon: Tv },
  { label: 'Games', href: '/admin/games', icon: Gamepad2 },
  { label: 'Software', href: '/admin/software', icon: AppWindow },
  { label: 'Products', href: '/admin/products', icon: ShoppingBag },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 p-4 border-b border-white/5',
        collapsed && 'justify-center px-3'
      )}>
        <img
          src="https://cdn-ai.onspace.ai/onspace/project/uploads/eMhXg6ZT6MzmrBPaj8Bbtk/IMG_5000.png"
          alt="TechLand"
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        {!collapsed && (
          <div>
            <span className="text-sm font-bold text-white">Tech<span className="text-primary">Land</span></span>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              isActive(item.href)
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn(
              'shrink-0 transition-colors',
              collapsed ? 'w-5 h-5' : 'w-4 h-4',
              isActive(item.href) ? 'text-primary' : 'group-hover:text-foreground'
            )} />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link
          to="/en"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-2'
          )}
        >
          <TrendingUp className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!collapsed && 'View Site'}
        </Link>
        <button
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 bg-card border-r border-white/5 transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}>
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 h-full bg-card border-r border-white/5 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        collapsed ? 'lg:ml-16' : 'lg:ml-56'
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 glass-strong border-b border-white/5 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {NAV_ITEMS.find(n => isActive(n.href))?.label || 'Admin Panel'}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">TechLand Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white">A</div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground">Admin</p>
                <p className="text-[10px] text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
