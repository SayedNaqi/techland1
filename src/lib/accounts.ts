/* Demo-grade local accounts (browser only, no server).
 * Admin gate + user profiles linked to payments.
 * For production this must move to a secure backend — see notes in Admin/Payment pages.
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  subscriptionPlanId?: string;
  subscriptionStatus?: 'active' | 'pending' | 'expired' | 'cancelled';
  subscriptionSince?: string;
}

const USERS_KEY = 'techland_users';
const CURRENT_KEY = 'techland_current_user_id';
const ADMIN_KEY = 'techland_admin_auth';
const ADMIN_SESSION = 'techland_admin_session';

/** Simple non-crypto hash for demo only — never use for real passwords. */
export function hashPassword(pw: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < pw.length; i++) {
    const ch = pw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

function loadUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(list: UserProfile[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  } catch {
    /* session-only */
  }
}

export function listUsers(): UserProfile[] {
  return loadUsers().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function registerUser(name: string, email: string, password: string): { ok: boolean; error?: string; user?: UserProfile } {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: 'name' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return { ok: false, error: 'email' };
  if (password.length < 6) return { ok: false, error: 'password' };
  const users = loadUsers();
  if (users.some((u) => u.email === cleanEmail)) return { ok: false, error: 'exists' };
  const user: UserProfile = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  saveUsers([user, ...users]);
  try {
    localStorage.setItem(CURRENT_KEY, user.id);
  } catch {
    /* ignore */
  }
  return { ok: true, user };
}

export function loginUser(email: string, password: string): { ok: boolean; user?: UserProfile } {
  const cleanEmail = email.trim().toLowerCase();
  const user = loadUsers().find((u) => u.email === cleanEmail && u.passwordHash === hashPassword(password));
  if (!user) return { ok: false };
  try {
    localStorage.setItem(CURRENT_KEY, user.id);
  } catch {
    /* ignore */
  }
  return { ok: true, user };
}

export function logoutUser() {
  try {
    localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

export function currentUser(): UserProfile | null {
  try {
    const id = localStorage.getItem(CURRENT_KEY);
    if (!id) return null;
    return loadUsers().find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export function setUserSubscription(userId: string, planId: string | undefined, status: UserProfile['subscriptionStatus']) {
  const users = loadUsers().map((u) =>
    u.id === userId
      ? { ...u, subscriptionPlanId: planId, subscriptionStatus: status, subscriptionSince: new Date().toISOString() }
      : u,
  );
  saveUsers(users);
}

export function deleteUser(userId: string) {
  saveUsers(loadUsers().filter((u) => u.id !== userId));
  try {
    if (localStorage.getItem(CURRENT_KEY) === userId) localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------- Admin gate ---------- */

interface AdminCreds {
  username: string;
  passwordHash: string;
}

const DEFAULT_ADMIN: AdminCreds = { username: 'admin', passwordHash: hashPassword('admin123') };

function loadAdminCreds(): AdminCreds {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return DEFAULT_ADMIN;
    const parsed = JSON.parse(raw) as AdminCreds;
    if (!parsed.username || !parsed.passwordHash) return DEFAULT_ADMIN;
    return parsed;
  } catch {
    return DEFAULT_ADMIN;
  }
}

export function getAdminUsername(): string {
  return loadAdminCreds().username;
}

export function adminLogin(username: string, password: string): boolean {
  const creds = loadAdminCreds();
  if (username.trim().toLowerCase() !== creds.username.toLowerCase()) return false;
  if (hashPassword(password) !== creds.passwordHash) return false;
  try {
    sessionStorage.setItem(ADMIN_SESSION, '1');
  } catch {
    /* ignore */
  }
  return true;
}

export function isAdminAuthed(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION) === '1';
  } catch {
    return false;
  }
}

export function adminLogout() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION);
  } catch {
    /* ignore */
  }
}

export function changeAdminCreds(username: string, newPassword: string) {
  const next: AdminCreds = {
    username: username.trim() || loadAdminCreds().username,
    passwordHash: newPassword ? hashPassword(newPassword) : loadAdminCreds().passwordHash,
  };
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
