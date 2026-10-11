import { useState, useCallback, useEffect } from 'react';

const KEY = 'techland_notifications';

export interface Notification {
  id: string;
  type: 'new_content' | 'subscription' | 'purchase' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  icon?: string;
  href?: string;
}

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'new_content',
    title: 'New Movie Added',
    message: 'Dune: Part Two is now available in 4K HD.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    href: '/en/movies/m1',
  },
  {
    id: 'n2',
    type: 'new_content',
    title: 'New Series — Season 2',
    message: 'The Last of Us Season 2 has been added. New episodes every week.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    href: '/en/series/s3',
  },
  {
    id: 'n3',
    type: 'subscription',
    title: 'Subscription Renewal Reminder',
    message: 'Your Yearly plan expires in 14 days. Renew now to keep uninterrupted access.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    href: '/en/subscriptions',
  },
  {
    id: 'n4',
    type: 'purchase',
    title: 'Purchase Confirmed',
    message: 'Cyberpunk 2077 has been added to your game library.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    href: '/en/profile',
  },
  {
    id: 'n5',
    type: 'purchase',
    title: 'Software Unlocked',
    message: 'Adobe Photoshop 2025 is ready for download in My Software.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    href: '/en/profile',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Welcome to TechLand!',
    message: 'Explore movies, games, software, and the tech shop. Enjoy your experience.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function load(): Notification[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      localStorage.setItem(KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(stored);
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

function save(notifications: Notification[]) {
  localStorage.setItem(KEY, JSON.stringify(notifications));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(load);

  useEffect(() => {
    save(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `n${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
}
