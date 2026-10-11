import type { Language } from '@/types';

export type PaymentGateway = 'hesabpay';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface PaymentPlan {
  id: string;
  period: BillingPeriod;
  name: Record<Language, string>;
  priceUSD: number;
  originalPriceUSD?: number;
  features: Record<Language, string[]>;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export interface PaymentTransaction {
  id: string;
  planId: string;
  gateway: PaymentGateway;
  amountUSD: number;
  status: PaymentStatus;
  createdAt: string;
  email?: string;
  reference?: string;
  userId?: string;
  userName?: string;
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'plan-monthly',
    period: 'monthly',
    name: { en: 'Monthly', fa: 'ماهانه' },
    priceUSD: 5.99,
    features: {
      en: ['Unlimited streaming', 'HD & 4K quality', 'Movie downloads', 'Series downloads', 'Ad-free experience', 'Multi-device access'],
      fa: ['پخش نامحدود', 'کیفیت HD و 4K', 'دانلود فیلم', 'دانلود سریال', 'بدون تبلیغات', 'دسترسی چند دستگاه'],
    },
  },
  {
    id: 'plan-quarterly',
    period: 'quarterly',
    name: { en: '3 Months', fa: '۳ ماهه' },
    priceUSD: 14.99,
    originalPriceUSD: 17.97,
    isPopular: true,
    features: {
      en: ['Unlimited streaming', 'HD & 4K quality', 'Movie downloads', 'Series downloads', 'Ad-free experience', 'Multi-device access', 'Offline mode'],
      fa: ['پخش نامحدود', 'کیفیت HD و 4K', 'دانلود فیلم', 'دانلود سریال', 'بدون تبلیغات', 'دسترسی چند دستگاه', 'حالت آفلاین'],
    },
  },
  {
    id: 'plan-yearly',
    period: 'yearly',
    name: { en: 'Yearly', fa: 'سالانه' },
    priceUSD: 49.99,
    originalPriceUSD: 71.88,
    isBestValue: true,
    features: {
      en: ['Unlimited streaming', 'HD & 4K quality', 'Movie downloads', 'Series downloads', 'Ad-free experience', 'Multi-device access', 'Offline mode', 'Priority support', 'Early access to new content'],
      fa: ['پخش نامحدود', 'کیفیت HD و 4K', 'دانلود فیلم', 'دانلود سریال', 'بدون تبلیغات', 'دسترسی چند دستگاه', 'حالت آفلاین', 'پشتیبانی اولویت‌دار', 'دسترسی زودهنگام به محتوا'],
    },
  },
  {
    id: 'plan-lifetime',
    period: 'lifetime',
    name: { en: 'Lifetime', fa: 'مادام‌العمر' },
    priceUSD: 149.99,
    features: {
      en: ['Unlimited streaming — forever', 'HD & 4K quality', 'Movie downloads', 'Series downloads', 'Ad-free experience', 'Multi-device access', 'Offline mode', 'Priority support', 'Early access to new content'],
      fa: ['پخش نامحدود — برای همیشه', 'کیفیت HD و 4K', 'دانلود فیلم', 'دانلود سریال', 'بدون تبلیغات', 'دسترسی چند دستگاه', 'حالت آفلاین', 'پشتیبانی اولویت‌دار', 'دسترسی زودهنگام به محتوا'],
    },
  },
];

const TX_KEY = 'techland_transactions';

function readTx(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY);
    return raw ? (JSON.parse(raw) as PaymentTransaction[]) : [];
  } catch {
    return [];
  }
}

function writeTx(list: PaymentTransaction[]) {
  try {
    localStorage.setItem(TX_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — checkout still works for this session */
  }
}

export function listTransactions(): PaymentTransaction[] {
  return readTx().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveTransaction(tx: PaymentTransaction) {
  writeTx([tx, ...readTx()]);
}

export function updateTransactionStatus(id: string, status: PaymentStatus) {
  writeTx(readTx().map((t) => (t.id === id ? { ...t, status } : t)));
}

/** HesabPay QR payment: the user scans the merchant QR in the HesabPay app,
 * pays, then submits the HesabPay reference number here for admin review.
 * Approving the transaction in the admin panel activates the membership. */
export function recordHesabPayPayment(input: {
  planId: string;
  userId: string;
  userName: string;
  email: string;
  reference: string;
}): PaymentTransaction {
  const plan = PAYMENT_PLANS.find((p) => p.id === input.planId);
  if (!plan) throw new Error('Unknown plan');
  const tx: PaymentTransaction = {
    id: `tx-${Date.now()}`,
    planId: plan.id,
    gateway: 'hesabpay',
    amountUSD: plan.priceUSD,
    status: 'pending',
    createdAt: new Date().toISOString(),
    email: input.email,
    reference: input.reference.trim(),
    userId: input.userId,
    userName: input.userName,
  };
  saveTransaction(tx);
  return tx;
}
