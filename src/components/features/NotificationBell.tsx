import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, CheckCheck, Trash2,
  Film, Tv, Crown, ShoppingBag, Info, ChevronRight
} from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  new_content: { icon: Film, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  subscription: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  purchase: { icon: ShoppingBag, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  system: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
};

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Click-outside dismiss
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleNotificationClick = useCallback((notif: Notification) => {
    markAsRead(notif.id);
    if (notif.href) {
      navigate(notif.href.replace('/en/', `/${language}/`));
      setOpen(false);
    }
  }, [markAsRead, navigate, language]);

  const filtered = activeTab === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all"
        aria-label="Notifications"
      >
        <Bell className={cn('w-5 h-5 transition-all', open && 'text-primary')} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-primary text-white rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-1rem)] glass-strong border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-primary/20 text-primary rounded-lg">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 pt-2 gap-1 border-b border-white/5">
            {(['all', 'unread'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-t-lg capitalize transition-all border-b-2 -mb-px',
                  activeTab === tab
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {tab}
                {tab === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black bg-primary/20 text-primary rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-foreground/50">No notifications</p>
                <p className="text-xs text-muted-foreground/40 mt-1">You're all caught up!</p>
              </div>
            ) : (
              filtered.map(notif => {
                const config = TYPE_CONFIG[notif.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 cursor-pointer group transition-all hover:bg-white/[0.03]',
                      !notif.read && 'bg-primary/[0.03]'
                    )}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    {/* Icon */}
                    <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm leading-tight line-clamp-1',
                          notif.read ? 'font-medium text-foreground/80' : 'font-bold text-foreground'
                        )}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground/60">{formatRelative(notif.createdAt)}</span>
                        {notif.href && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{notifications.length} total notifications</span>
              <button
                onClick={() => {
                  markAllAsRead();
                  setOpen(false);
                }}
                className="text-xs text-primary hover:underline"
              >
                Clear all unread
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
