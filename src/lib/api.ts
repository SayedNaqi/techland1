/**
 * TechLand API client — secure backend (PostgreSQL + JWT).
 *
 * When VITE_API_URL is set (e.g. http://localhost:4000), the app talks to the
 * real backend: bcrypt password hashing + short-lived JWT happens server-side,
 * stats come from Postgres (not this browser). When unset, the app falls back
 * to the previous demo localStorage mode.
 */

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
export const isBackendEnabled = API_BASE.length > 0;

const USER_TOKEN_KEY = 'techland_api_user_token';
const ADMIN_TOKEN_KEY = 'techland_api_admin_token';

export function getUserToken(): string | null {
  try { return localStorage.getItem(USER_TOKEN_KEY); } catch { return null; }
}
export function setUserToken(t: string | null) {
  try { t ? localStorage.setItem(USER_TOKEN_KEY, t) : localStorage.removeItem(USER_TOKEN_KEY); } catch { /* ignore */ }
}
export function getAdminToken(): string | null {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; }
}
export function setAdminToken(t: string | null) {
  try { t ? localStorage.setItem(ADMIN_TOKEN_KEY, t) : localStorage.removeItem(ADMIN_TOKEN_KEY); } catch { /* ignore */ }
}

async function apiFetch<T>(path: string, opts: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || `request_failed_${res.status}`) as Error & { status?: number; details?: unknown };
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data as T;
}

// ---------- Types ----------
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  subscriptionPlanId?: string;
  subscriptionStatus?: 'active' | 'pending' | 'expired' | 'cancelled';
  subscriptionSince?: string;
  createdAt: string;
}
export interface ApiTx {
  id: string;
  planId: string;
  gateway: string;
  amountUSD: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  email?: string;
  reference?: string;
  userId?: string;
  userName?: string;
}

// ---------- User auth ----------
export const apiRegister = (name: string, email: string, password: string) =>
  apiFetch<{ user: ApiUser; token: string }>('/api/auth/register', { method: 'POST', body: { name, email, password } });
export const apiLogin = (email: string, password: string) =>
  apiFetch<{ user: ApiUser; token: string }>('/api/auth/login', { method: 'POST', body: { email, password } });
export const apiMe = (token: string) =>
  apiFetch<{ user: ApiUser }>('/api/auth/me', { token });

// ---------- Admin auth ----------
export const apiAdminLogin = (username: string, password: string) =>
  apiFetch<{ token: string; admin: { id: string; username: string }; mustChangePassword: boolean }>('/api/admin/login', {
    method: 'POST', body: { username, password },
  });
export const apiChangeAdminCreds = (token: string, payload: { username?: string; newPassword?: string }) =>
  apiFetch<{ ok: boolean }>('/api/admin/change-credentials', { method: 'POST', token, body: payload });

// ---------- Admin data (REAL Postgres stats) ----------
export interface AdminStats {
  users: number; transactions: number; revenueCents: number; revenueUSD: number;
  pending: number; opportunities: number; guides: number; visaTopics: number;
  transactionsByStatus: Record<string, number>;
}
export const apiAdminStats = (token: string) => apiFetch<AdminStats>('/api/admin/stats', { token });
export const apiAdminUsers = (token: string) =>
  apiFetch<{ total: number; users: ApiUser[] }>('/api/admin/users?limit=200', { token });
export const apiSetSubscription = (token: string, id: string, planId: string | null, status: NonNullable<ApiUser['subscriptionStatus']>) =>
  apiFetch<{ user: ApiUser }>(`/api/admin/users/${id}/subscription`, { method: 'PATCH', token, body: { planId, status } });
export const apiDeleteUser = (token: string, id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE', token });
export const apiAdminTransactions = (token: string) =>
  apiFetch<{ transactions: ApiTx[] }>('/api/admin/transactions?limit=200', { token });
export const apiSetTxStatus = (token: string, id: string, status: ApiTx['status']) =>
  apiFetch<{ ok: boolean }>(`/api/admin/transactions/${id}/status`, { method: 'PATCH', token, body: { status } });
export const apiAdminSettings = (token: string) =>
  apiFetch<{ settings: Record<string, unknown> }>('/api/admin/settings', { token });
export const apiSaveAdminSettings = (token: string, settings: Record<string, unknown>) =>
  apiFetch<{ settings: Record<string, unknown> }>('/api/admin/settings', { method: 'PUT', token, body: settings });

// ---------- Payments (user) ----------
export const apiSubmitHesabPay = (token: string, planId: string, reference: string) =>
  apiFetch<{ transaction: ApiTx }>('/api/payments/hesabpay', { method: 'POST', token, body: { planId, reference } });
export const apiMyPayments = (token: string) =>
  apiFetch<{ transactions: ApiTx[] }>('/api/payments/mine', { token });

// ---------- Videos (movies & series, OK/VK/Bunny embeds) ----------
export interface ApiVideoPart {
  label: { en: string; fa: string };
  embedUrl: string;
  directUrl?: string;
  source: 'ok' | 'vk' | 'bunny' | 'custom';
}
export interface ApiVideo {
  id: string;
  slug: string;
  kind: 'movie' | 'series';
  title: { en: string; fa: string };
  description: { en: string; fa: string };
  posterUrl?: string;
  backdropUrl?: string;
  year?: number;
  genre: string[];
  durationMin?: number;
  country?: string;
  rating?: number;
  seasons?: number;
  episodes?: number;
  parts: ApiVideoPart[];
  accessType: 'free' | 'subscription';
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
}
export interface VideoInput {
  slug?: string;
  kind?: 'movie' | 'series';
  titleEn?: string;
  titleFa?: string;
  descriptionEn?: string;
  descriptionFa?: string;
  posterUrl?: string;
  backdropUrl?: string;
  year?: number | null;
  genre?: string[];
  durationMin?: number | null;
  country?: string;
  rating?: number | null;
  seasons?: number | null;
  episodes?: number | null;
  parts?: Array<{ labelEn?: string; labelFa?: string; embedUrl?: string; directUrl?: string }>;
  accessType?: 'free' | 'subscription';
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
export const apiAdminVideos = (token: string) =>
  apiFetch<{ videos: ApiVideo[] }>('/api/admin/videos', { token });
export const apiCreateVideo = (token: string, payload: VideoInput & { slug: string }) =>
  apiFetch<{ video: ApiVideo }>('/api/admin/videos', { method: 'POST', token, body: payload });
export const apiUpdateVideo = (token: string, slug: string, payload: VideoInput) =>
  apiFetch<{ video: ApiVideo }>(`/api/admin/videos/${slug}`, { method: 'PUT', token, body: payload });
export const apiDeleteVideo = (token: string, slug: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/videos/${slug}`, { method: 'DELETE', token });

// ---------- Games (store catalog with uploaded posters) ----------
export interface ApiGame {
  id: string;
  slug: string;
  title: { en: string; fa: string };
  description: { en: string; fa: string };
  thumbnailUrl?: string;
  screenshots: string[];
  genre: string[];
  platform: string[];
  price?: number;
  currency: string;
  accessType: 'free' | 'paid' | 'vip';
  rating?: number;
  releaseYear?: number;
  developer?: string;
  publisher?: string;
  size?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
}
export interface GameInput {
  slug?: string;
  titleEn?: string;
  titleFa?: string;
  descriptionEn?: string;
  descriptionFa?: string;
  thumbnailUrl?: string;
  screenshots?: string[];
  genre?: string[];
  platform?: string[];
  price?: number | null;
  currency?: string;
  accessType?: 'free' | 'paid' | 'vip';
  rating?: number | null;
  releaseYear?: number | null;
  developer?: string;
  publisher?: string;
  size?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
export const apiPublicGames = () =>
  apiFetch<{ games: ApiGame[] }>('/api/public/games');
export const apiAdminGames = (token: string) =>
  apiFetch<{ games: ApiGame[] }>('/api/admin/games', { token });
export const apiCreateGame = (token: string, payload: GameInput & { slug: string }) =>
  apiFetch<{ game: ApiGame }>('/api/admin/games', { method: 'POST', token, body: payload });
export const apiUpdateGame = (token: string, slug: string, payload: GameInput) =>
  apiFetch<{ game: ApiGame }>(`/api/admin/games/${slug}`, { method: 'PUT', token, body: payload });
export const apiDeleteGame = (token: string, slug: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/games/${slug}`, { method: 'DELETE', token });

// ---------- Ads (banners on Movies / Series / Watch) ----------
export type AdSlotName = 'movies_hero' | 'series_hero' | 'watch_top' | 'watch_bottom';
export interface ApiAd {
  id: string;
  slot: AdSlotName;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  html?: string;
  isActive?: boolean;
}
export interface AdInput {
  slot?: AdSlotName;
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  html?: string;
  isActive?: boolean;
  sortOrder?: number;
}
export const apiPublicAds = (slot: AdSlotName) =>
  apiFetch<{ ads: ApiAd[] }>(`/api/public/ads?slot=${slot}`);
export const apiAdminAds = (token: string) =>
  apiFetch<{ ads: ApiAd[] }>('/api/admin/ads', { token });
export const apiCreateAd = (token: string, payload: AdInput & { slot: AdSlotName }) =>
  apiFetch<{ ad: ApiAd }>('/api/admin/ads', { method: 'POST', token, body: payload });
export const apiUpdateAd = (token: string, id: string, payload: AdInput) =>
  apiFetch<{ ad: ApiAd }>(`/api/admin/ads/${id}`, { method: 'PUT', token, body: payload });
export const apiDeleteAd = (token: string, id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/ads/${id}`, { method: 'DELETE', token });

/** Upload a video file (MP4/WebM/MOV/M3U8) — returns its public /media/... URL. */
export async function apiUploadVideoFile(file: File): Promise<{ url: string; size: number | null }> {
  const token = getAdminToken();
  if (!isBackendEnabled || !token) throw new Error('backend_not_configured');
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/upload/video-file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; size?: number | null; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || `upload_failed_${res.status}`);
  return { url: data.url, size: data.size ?? null };
}

/** Upload a game poster / screenshot (JPG/PNG/WebP/GIF/AVIF, max 8 MB) — returns its public /media/... URL. */
export async function apiUploadImage(file: File): Promise<{ url: string; size: number | null }> {
  const token = getAdminToken();
  if (!isBackendEnabled || !token) throw new Error('backend_not_configured');
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; size?: number | null; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || `upload_failed_${res.status}`);
  return { url: data.url, size: data.size ?? null };
}

/** Absolute URL for a /media/... path returned by the upload API. */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
// ---------- Plans ----------
export interface ApiPlan {
  id: string;
  period: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  name: { en: string; fa: string };
  priceUSD: number;
  originalPriceUSD?: number;
  features: { en: string[]; fa: string[] };
  isPopular?: boolean;
  isBestValue?: boolean;
  isActive?: boolean;
}
export interface PlanInput {
  id?: string;
  period?: ApiPlan['period'];
  nameEn?: string;
  nameFa?: string;
  priceUSD?: number;
  originalPriceUSD?: number | null;
  featuresEn?: string[];
  featuresFa?: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
export const apiPublicPlans = () =>
  apiFetch<{ plans: ApiPlan[] }>('/api/public/plans');
export const apiAdminPlans = (token: string) =>
  apiFetch<{ plans: ApiPlan[] }>('/api/admin/plans', { token });
export const apiCreatePlan = (token: string, payload: PlanInput & { id: string }) =>
  apiFetch<{ plan: ApiPlan }>('/api/admin/plans', { method: 'POST', token, body: payload });
export const apiUpdatePlan = (token: string, id: string, payload: PlanInput) =>
  apiFetch<{ plan: ApiPlan }>(`/api/admin/plans/${id}`, { method: 'PUT', token, body: payload });
export const apiDeletePlan = (token: string, id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/plans/${id}`, { method: 'DELETE', token });
