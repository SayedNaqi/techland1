import { query } from './db.js';

// Static fallback (mirrors frontend PAYMENT_PLANS) — used only if the plans table is empty.
export const PLAN_PRICE_FALLBACK_CENTS = {
  'plan-monthly': 599,
  'plan-quarterly': 1499,
  'plan-yearly': 4999,
  'plan-lifetime': 14999,
};

export function planRowToApi(r) {
  return {
    id: r.id,
    period: r.period,
    name: { en: r.name_en, fa: r.name_fa },
    priceUSD: r.price_cents / 100,
    originalPriceUSD: r.original_price_cents != null ? r.original_price_cents / 100 : undefined,
    features: { en: r.features_en || [], fa: r.features_fa || [] },
    isPopular: !!r.is_popular,
    isBestValue: !!r.is_best_value,
    isActive: r.is_active !== false,
  };
}

export async function listPlans({ activeOnly = true } = {}) {
  const { rows } = await query(
    activeOnly
      ? 'SELECT * FROM plans WHERE is_active = TRUE ORDER BY sort_order, id'
      : 'SELECT * FROM plans ORDER BY sort_order, id',
  );
  return rows.map(planRowToApi);
}

export async function getPlanPriceCents(planId) {
  const { rows } = await query('SELECT price_cents FROM plans WHERE id = $1', [planId]);
  if (rows.length > 0) return rows[0].price_cents;
  if (PLAN_PRICE_FALLBACK_CENTS[planId] != null) return PLAN_PRICE_FALLBACK_CENTS[planId];
  return null;
}

export const toCents = (usd) => Math.round(Number(usd) * 100);
