import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireUser } from '../auth.js';
import { getPlanPriceCents } from '../plans.js';

const router = Router();

// POST /api/payments/hesabpay  (auth: user) { planId, reference, email? }
// planId can be any active plan from the admin-managed plans table.
// POST /api/payments/hesabpay  (auth: user) { planId, reference, email? }
// planId can be any active plan from the admin-managed plans table.
router.post('/hesabpay', requireUser, async (req, res, next) => {
  try {
    const schema = z.object({
      planId: z.string().trim().min(1).max(64),
      reference: z.string().trim().min(2).max(64),
      email: z.string().email().max(254).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });

    const { rows: urows } = await query('SELECT * FROM users WHERE id=$1', [req.user.sub]);
    if (urows.length === 0) return res.status(404).json({ error: 'user_not_found' });
    const user = urows[0];

    // Price is read from the admin-managed plans table (Admin → Plans), not hardcoded.
    const priceCents = await getPlanPriceCents(parsed.data.planId);
    if (priceCents == null) return res.status(400).json({ error: 'unknown_plan' });

    const { rows } = await query(
      `INSERT INTO transactions (user_id, plan_id, gateway, amount_cents, status, email, reference, user_name)
       VALUES ($1,$2,'hesabpay',$3,'pending',$4,$5,$6) RETURNING *`,
      [user.id, parsed.data.planId, priceCents, parsed.data.email ?? user.email, parsed.data.reference.trim(), user.name],
    );
    await query(`UPDATE users SET subscription_plan_id=$1, subscription_status='pending', subscription_since=now() WHERE id=$2`,
      [parsed.data.planId, user.id]);

    const t = rows[0];
    res.status(201).json({
      transaction: {
        id: t.id, planId: t.plan_id, gateway: t.gateway,
        // Recorded amount — always the value stored at payment time, never a static map.
        amountUSD: t.amount_cents / 100,
        status: t.status, createdAt: new Date(t.created_at).toISOString(),
        email: t.email, reference: t.reference, userId: t.user_id, userName: t.user_name,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/payments/mine (auth: user)
router.get('/mine', requireUser, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [req.user.sub]);
    res.json({
      transactions: rows.map((t) => ({
        id: t.id, planId: t.plan_id, gateway: t.gateway,
        amountUSD: t.amount_cents / 100, status: t.status,
        createdAt: new Date(t.created_at).toISOString(),
        reference: t.reference ?? undefined,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
