import { useState, useCallback } from 'react';
import type { User } from '@/types';

const AUTH_KEY = 'techland_user';

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@techland.app',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80',
  subscription: 'yearly',
  country: 'US',
  joinedAt: '2024-01-15',
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email: string, _password: string) => {
    const mockUser = { ...MOCK_USER, email };
    setUser(mockUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    return true;
  }, []);

  const register = useCallback((name: string, email: string, _password: string) => {
    const newUser: User = { ...MOCK_USER, name, email, subscription: undefined };
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const isLoggedIn = user !== null;
  const hasSubscription = Boolean(user?.subscription);

  return { user, login, register, logout, isLoggedIn, hasSubscription };
}
