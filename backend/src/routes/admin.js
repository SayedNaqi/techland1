import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { publicUserRow, requireAdmin } from '../auth.js';
import { listPlans, planRowToApi, toCents } from '../plans.js';
import { normalizeDirectUrl, normalizeEmbedUrl, videoRowToApi } from '../videos.js';

const router = Router();
router.use(requireAdmin);

// ---------- helpers ----------
const toDollars = (cents) => Number((cents / 100).toFixed(2));

async function audit(adminId, action, entity = '', entityId = '') {
  await query('INSERT INTO audit_logs (admin_id, action, entity, entity_id) VALUES ($1,$2,$3,$4)', [adminId, action, entity, entityId]);
}

// ---------- GET /api/admin/stats (REAL stats from Postgres, not browser) ----------
router.get('/stats', async (req, res, next) => {
  try {
    const [[u], [t], [rev], [pend], [opp], [gui], [visa]] = await Promise.all([
      query('SELECT COUNT(*)::int AS c FROM users').then((r) => r.rows),
      query('SELECT COUNT(*)::int AS c FROM transactions').then((r) => r.rows),
      query(`SELECT COALESCE(SUM(amount_cents),0)::int AS cents FROM transactions WHERE status='completed'`).then((r) => r.rows),
      query(`SELECT COUNT(*)::int AS c FROM transactions WHERE status='pending'`).then((r) => r.rows),
      query('SELECT COUNT(*)::int AS c FROM opportunities').then((r) => r.rows),
      query('SELECT COUNT(*)::int AS c FROM guides').then((r) => r.rows),
      query('SELECT COUNT(*)::int AS c FROM visa_topics').then((r) => r.rows),
    ]);
    const byStatus = await query(`SELECT status, COUNT(*)::int AS c FROM transactions GROUP BY status`);
    const recentUsers = await query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    res.json({
      users: u.c,
      transactions: t.c,
      revenueCents: rev.cents,
      revenueUSD: toDollars(rev.cents),
      pending: pend.c,
      opportunities: opp.c,
      guides: gui.c,
      visaTopics: visa.c,
      transactionsByStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, r.c])),
      recentUsers: recentUsers.rows,
    });
  } catch (err) { next(err); }
});

// ---------- Users ----------
router.get('/users', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const q = (req.query.q || '').toString().trim();
    let rows;
    if (q) {
      ({ rows } = await query(
        `SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [`%${q}%`, limit, offset],
      ));
    } else {
      ({ rows } = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]));
    }
    const total = await query(q
      ? 'SELECT COUNT(*)::int AS c FROM users WHERE name ILIKE $1 OR email ILIKE $1'
      : 'SELECT COUNT(*)::int AS c FROM users', q ? [`%${q}%`] : []);
    res.json({ total: total.rows[0].c, users: rows.map(publicUserRow) });
  } catch (err) { next(err); }
});

router.patch('/users/:id/subscription', async (req, res, next) => {
  try {
    const schema = z.object({
      planId: z.string().max(64).nullable().optional(),
      status: z.enum(['active', 'pending', 'expired', 'cancelled']),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
    const { rows } = await query(
      `UPDATE users SET subscription_plan_id=$1, subscription_status=$2, subscription_since=now(), updated_at=now()
       WHERE id=$3 RETURNING *`,
      [parsed.data.planId ?? null, parsed.data.status, req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'update-subscription', 'user', req.params.id);
    res.json({ user: publicUserRow(rows[0]) });
  } catch (err) { next(err); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM users WHERE id=$1', [req.params.id]);
    await audit(req.admin.sub, 'delete-user', 'user', req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- Transactions ----------
router.get('/transactions', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const status = (req.query.status || '').toString();
    const params = [];
    let where = '';
    if (['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      where = 'WHERE t.status = $1';
      params.push(status);
    }
    const { rows } = await query(
      `SELECT t.*, u.email AS u_email FROM transactions t LEFT JOIN users u ON u.id=t.user_id
       ${where} ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );
    res.json({
      transactions: rows.map((r) => ({
        id: r.id,
        planId: r.plan_id,
        gateway: r.gateway,
        amountUSD: toDollars(r.amount_cents),
        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
        email: r.email ?? r.u_email ?? undefined,
        reference: r.reference ?? undefined,
        userId: r.user_id ?? undefined,
        userName: r.user_name ?? undefined,
      })),
    });
  } catch (err) { next(err); }
});

// PATCH /api/admin/transactions/:id/status { status } — also syncs user subscription
router.patch('/transactions/:id/status', async (req, res, next) => {
  try {
    const parsed = z.object({ status: z.enum(['pending', 'completed', 'failed', 'refunded']) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
    const { rows } = await query('SELECT * FROM transactions WHERE id=$1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const tx = rows[0];
    await query('UPDATE transactions SET status=$1, updated_at=now() WHERE id=$2', [parsed.data.status, tx.id]);
    if (tx.user_id) {
      if (parsed.data.status === 'completed') {
        await query(`UPDATE users SET subscription_plan_id=$1, subscription_status='active', subscription_since=now() WHERE id=$2`, [tx.plan_id, tx.user_id]);
      } else if (parsed.data.status === 'failed') {
        await query(`UPDATE users SET subscription_status='expired' WHERE id=$1`, [tx.user_id]);
      } else if (parsed.data.status === 'refunded') {
        await query(`UPDATE users SET subscription_plan_id=NULL, subscription_status='cancelled' WHERE id=$1`, [tx.user_id]);
      } else if (parsed.data.status === 'pending') {
        await query(`UPDATE users SET subscription_plan_id=$1, subscription_status='pending' WHERE id=$2`, [tx.plan_id, tx.user_id]);
      }
    }
    await audit(req.admin.sub, `tx-${parsed.data.status}`, 'transaction', tx.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- Plans (Admin → Plans: prices, names, features) ----------
const PlanBody = z.object({
  period: z.enum(['monthly', 'quarterly', 'yearly', 'lifetime']).optional(),
  nameEn: z.string().trim().min(1).max(80).optional(),
  nameFa: z.string().trim().max(80).optional(),
  priceUSD: z.number().min(0).max(100000).optional(),
  originalPriceUSD: z.number().min(0).max(100000).nullable().optional(),
  featuresEn: z.array(z.string().max(200)).max(30).optional(),
  featuresFa: z.array(z.string().max(200)).max(30).optional(),
  isPopular: z.boolean().optional(),
  isBestValue: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});

router.get('/plans', async (_req, res, next) => {
  try {
    res.json({ plans: await listPlans({ activeOnly: false }) });
  } catch (err) { next(err); }
});

// Create a new plan: POST /api/admin/plans { id: 'plan-custom', ... }
router.post('/plans', async (req, res, next) => {
  try {
    const idParsed = z.object({ id: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,64}$/) }).safeParse(req.body);
    if (!idParsed.success) return res.status(400).json({ error: 'invalid_plan_id' });
    const parsed = PlanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    const b = parsed.data;
    const { rows } = await query(
      `INSERT INTO plans (id, period, name_en, name_fa, price_cents, original_price_cents,
        features_en, features_fa, is_popular, is_best_value, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING RETURNING *`,
      [idParsed.data.id, b.period ?? 'monthly', b.nameEn ?? idParsed.data.id, b.nameFa ?? '',
        b.priceUSD != null ? toCents(b.priceUSD) : 0,
        b.originalPriceUSD != null ? toCents(b.originalPriceUSD) : null,
        JSON.stringify(b.featuresEn ?? []), JSON.stringify(b.featuresFa ?? []),
        b.isPopular ?? false, b.isBestValue ?? false, b.isActive ?? true, b.sortOrder ?? 99],
    );
    if (rows.length === 0) return res.status(409).json({ error: 'plan_exists' });
    await audit(req.admin.sub, 'create-plan', 'plan', idParsed.data.id);
    res.status(201).json({ plan: planRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

// Update a plan: PUT /api/admin/plans/:id { priceUSD, nameEn, ... }
// Only provided fields are touched (dynamic SET — no undefined→NULL accidents).
router.put('/plans/:id', async (req, res, next) => {
  try {
    const parsed = PlanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    const b = parsed.data;
    const sets = [];
    const params = [req.params.id];
    const push = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };
    if (b.period !== undefined) push('period', b.period);
    if (b.nameEn !== undefined) push('name_en', b.nameEn);
    if (b.nameFa !== undefined) push('name_fa', b.nameFa);
    if (b.priceUSD !== undefined) push('price_cents', toCents(b.priceUSD));
    if (b.originalPriceUSD !== undefined) push('original_price_cents', b.originalPriceUSD == null ? null : toCents(b.originalPriceUSD));
    if (b.featuresEn !== undefined) push('features_en', JSON.stringify(b.featuresEn));
    if (b.featuresFa !== undefined) push('features_fa', JSON.stringify(b.featuresFa));
    if (b.isPopular !== undefined) push('is_popular', b.isPopular);
    if (b.isBestValue !== undefined) push('is_best_value', b.isBestValue);
    if (b.isActive !== undefined) push('is_active', b.isActive);
    if (b.sortOrder !== undefined) push('sort_order', b.sortOrder);
    if (sets.length === 0) return res.status(400).json({ error: 'nothing_to_change' });
    const { rows } = await query(
      `UPDATE plans SET ${sets.join(', ')}, updated_at = now() WHERE id = $1 RETURNING *`,
      params,
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'update-plan', 'plan', req.params.id);
    res.json({ plan: planRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

// Delete a plan (past transactions keep their recorded plan_id/amount — history is preserved).
router.delete('/plans/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM plans WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'delete-plan', 'plan', req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});
// ---------- Videos (Admin → Videos: movies & series with OK/VK/Bunny embeds) ----------
const VideoPart = z.object({
  labelEn: z.string().max(120).optional().default(''),
  labelFa: z.string().max(120).optional().default(''),
  embedUrl: z.string().trim().max(2000).optional().default(''),
  directUrl: z.string().trim().max(2000).optional().default(''),
});
const VideoBody = z.object({
  kind: z.enum(['movie', 'series']).optional(),
  titleEn: z.string().trim().min(1).max(160).optional(),
  titleFa: z.string().trim().max(160).optional(),
  descriptionEn: z.string().max(5000).optional(),
  descriptionFa: z.string().max(5000).optional(),
  posterUrl: z.string().trim().max(2000).optional(),
  backdropUrl: z.string().trim().max(2000).optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  genre: z.array(z.string().trim().max(40)).max(10).optional(),
  durationMin: z.number().int().min(1).max(10000).nullable().optional(),
  country: z.string().trim().max(80).optional(),
  rating: z.number().min(0).max(10).nullable().optional(),
  seasons: z.number().int().min(1).max(100).nullable().optional(),
  episodes: z.number().int().min(1).max(2000).nullable().optional(),
  parts: z.array(VideoPart).max(500).optional(),
  accessType: z.enum(['free', 'subscription']).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

function toPartsJson(parts) {
  return JSON.stringify(parts.map((p) => {
    // At least one playable source is required: self-hosted file and/or OK/VK/Bunny embed.
    const direct = normalizeDirectUrl(p.directUrl || '');
    if (direct === null) throw new Error('invalid_direct_url');
    const embed = p.embedUrl && p.embedUrl.trim() ? normalizeEmbedUrl(p.embedUrl) : '';
    if (embed === null) throw new Error('invalid_embed_url');
    if (!direct && !embed) throw new Error('no_playable_source');
    return {
      label_en: p.labelEn || '',
      label_fa: p.labelFa || '',
      embed_url: embed || '',
      direct_url: direct || '',
    };
  }));
}

router.get('/videos', async (req, res, next) => {
  try {
    const kind = (req.query.kind || '').toString();
    const { rows } = await query(
      kind === 'movie' || kind === 'series'
        ? 'SELECT * FROM videos WHERE kind=$1 ORDER BY sort_order, updated_at DESC LIMIT 500'
        : 'SELECT * FROM videos ORDER BY sort_order, updated_at DESC LIMIT 500',
      kind === 'movie' || kind === 'series' ? [kind] : [],
    );
    res.json({ videos: rows.map(videoRowToApi) });
  } catch (err) { next(err); }
});

router.post('/videos', async (req, res, next) => {
  try {
    const idParsed = z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,120}$/) }).safeParse(req.body);
    if (!idParsed.success) return res.status(400).json({ error: 'invalid_slug' });
    const parsed = VideoBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    const b = parsed.data;
    if (!b.titleEn) return res.status(400).json({ error: 'title_required' });
    let partsJson = '[]';
    try {
      partsJson = toPartsJson(b.parts ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'invalid_input';
      return res.status(400).json({ error: msg });
    }
    const { rows } = await query(
      `INSERT INTO videos (slug, kind, title_en, title_fa, description_en, description_fa,
        poster_url, backdrop_url, year, genre, duration_min, country, rating,
        seasons, episodes, parts, access_type, is_featured, is_new, is_trending, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17,$18,$19,$20,$21,$22)
       ON CONFLICT (slug) DO NOTHING RETURNING *`,
      [idParsed.data.slug, b.kind ?? 'movie', b.titleEn, b.titleFa ?? '', b.descriptionEn ?? '',
        b.descriptionFa ?? '', b.posterUrl ?? '', b.backdropUrl ?? '', b.year ?? null,
        b.genre ?? [], b.durationMin ?? null, b.country ?? '', b.rating ?? null,
        b.seasons ?? null, b.episodes ?? null, partsJson, b.accessType ?? 'subscription',
        b.isFeatured ?? false, b.isNew ?? false, b.isTrending ?? false, b.isActive ?? true,
        b.sortOrder ?? 0],
    );
    if (rows.length === 0) return res.status(409).json({ error: 'slug_exists' });
    await audit(req.admin.sub, 'create-video', 'video', idParsed.data.slug);
    res.status(201).json({ video: videoRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

router.put('/videos/:slug', async (req, res, next) => {
  try {
    const parsed = VideoBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    const b = parsed.data;
    let partsJson;
    if (b.parts !== undefined) {
      try {
        partsJson = toPartsJson(b.parts);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'invalid_input';
        return res.status(400).json({ error: msg });
      }
    }
    const sets = [];
    const params = [req.params.slug.toLowerCase()];
    const push = (col, val, cast = '') => { params.push(val); sets.push(`${col} = $${params.length}${cast}`); };
    if (b.kind !== undefined) push('kind', b.kind);
    if (b.titleEn !== undefined) push('title_en', b.titleEn);
    if (b.titleFa !== undefined) push('title_fa', b.titleFa);
    if (b.descriptionEn !== undefined) push('description_en', b.descriptionEn);
    if (b.descriptionFa !== undefined) push('description_fa', b.descriptionFa);
    if (b.posterUrl !== undefined) push('poster_url', b.posterUrl);
    if (b.backdropUrl !== undefined) push('backdrop_url', b.backdropUrl);
    if (b.year !== undefined) push('year', b.year);
    if (b.genre !== undefined) push('genre', b.genre);
    if (b.durationMin !== undefined) push('duration_min', b.durationMin);
    if (b.country !== undefined) push('country', b.country);
    if (b.rating !== undefined) push('rating', b.rating);
    if (b.seasons !== undefined) push('seasons', b.seasons);
    if (b.episodes !== undefined) push('episodes', b.episodes);
    if (partsJson !== undefined) push('parts', partsJson, '::jsonb');
    if (b.accessType !== undefined) push('access_type', b.accessType);
    if (b.isFeatured !== undefined) push('is_featured', b.isFeatured);
    if (b.isNew !== undefined) push('is_new', b.isNew);
    if (b.isTrending !== undefined) push('is_trending', b.isTrending);
    if (b.isActive !== undefined) push('is_active', b.isActive);
    if (b.sortOrder !== undefined) push('sort_order', b.sortOrder);
    if (sets.length === 0) return res.status(400).json({ error: 'nothing_to_change' });
    const { rows } = await query(
      `UPDATE videos SET ${sets.join(', ')}, updated_at = now() WHERE slug = $1 RETURNING *`,
      params,
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'update-video', 'video', req.params.slug);
    res.json({ video: videoRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

router.delete('/videos/:slug', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM videos WHERE slug = $1', [req.params.slug.toLowerCase()]);
    if (rowCount === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'delete-video', 'video', req.params.slug);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- Ads (banners on Movies / Series / Watch pages) ----------
const AD_SLOTS = ['movies_hero', 'series_hero', 'watch_top', 'watch_bottom'];
const AdBody = z.object({
  slot: z.enum(['movies_hero', 'series_hero', 'watch_top', 'watch_bottom']).optional(),
  title: z.string().trim().max(160).optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  linkUrl: z.string().trim().max(2000).optional(),
  html: z.string().max(20000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

function adRowToApi(r) {
  return {
    id: r.id, slot: r.slot, title: r.title,
    imageUrl: r.image_url || undefined, linkUrl: r.link_url || undefined,
    html: r.html || undefined, isActive: r.is_active !== false,
  };
}

router.get('/ads', async (req, res, next) => {
  try {
    const slot = (req.query.slot || '').toString();
    const { rows } = await query(
      AD_SLOTS.includes(slot)
        ? 'SELECT * FROM ads WHERE slot=$1 ORDER BY sort_order, updated_at DESC LIMIT 100'
        : 'SELECT * FROM ads ORDER BY slot, sort_order, updated_at DESC LIMIT 200',
      AD_SLOTS.includes(slot) ? [slot] : [],
    );
    res.json({ ads: rows.map(adRowToApi) });
  } catch (err) { next(err); }
});

router.post('/ads', async (req, res, next) => {
  try {
    const parsed = AdBody.safeParse(req.body);
    if (!parsed.success || !parsed.data.slot) return res.status(400).json({ error: 'invalid_input' });
    const b = parsed.data;
    const { rows } = await query(
      `INSERT INTO ads (slot, title, image_url, link_url, html, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [b.slot, b.title ?? '', b.imageUrl ?? '', b.linkUrl ?? '', b.html ?? '', b.isActive ?? true, b.sortOrder ?? 0],
    );
    await audit(req.admin.sub, 'create-ad', 'ad', rows[0].id);
    res.status(201).json({ ad: adRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

router.put('/ads/:id', async (req, res, next) => {
  try {
    const parsed = AdBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
    const b = parsed.data;
    const sets = [];
    const params = [req.params.id];
    const push = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };
    if (b.slot !== undefined) push('slot', b.slot);
    if (b.title !== undefined) push('title', b.title);
    if (b.imageUrl !== undefined) push('image_url', b.imageUrl);
    if (b.linkUrl !== undefined) push('link_url', b.linkUrl);
    if (b.html !== undefined) push('html', b.html);
    if (b.isActive !== undefined) push('is_active', b.isActive);
    if (b.sortOrder !== undefined) push('sort_order', b.sortOrder);
    if (sets.length === 0) return res.status(400).json({ error: 'nothing_to_change' });
    const { rows } = await query(
      `UPDATE ads SET ${sets.join(', ')}, updated_at = now() WHERE id = $1 RETURNING *`, params,
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'update-ad', 'ad', req.params.id);
    res.json({ ad: adRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

router.delete('/ads/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM ads WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not_found' });
    await audit(req.admin.sub, 'delete-ad', 'ad', req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- CMS: opportunities / guides / visa-topics (generic CRUD) ----------
function crud(table, pick) {
  const r = Router();
  r.get('/', async (req, res, next) => {
    try {
      const { rows } = await query(`SELECT * FROM ${table} ORDER BY updated_at DESC LIMIT 200`);
      res.json({ items: rows.map(pick) });
    } catch (err) { next(err); }
  });
  r.post('/', async (req, res, next) => {
    try {
      const { slug, payload } = req.body || {};
      if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'slug_required' });
      const p = payload && typeof payload === 'object' ? payload : req.body;
      const titleEn = p?.title?.en ?? req.body.title_en ?? '';
      const titleFa = p?.title?.fa ?? req.body.title_fa ?? '';
      const extra = table === 'opportunities'
        ? [req.body.kind ?? p?.kind ?? 'scholarship', req.body.status ?? p?.status ?? 'demo', p?.organization?.en ?? '', p?.country?.en ?? '', p?.officialSourceUrl ?? null, p?.deadline ?? null]
        : table === 'guides' ? [p?.category?.en ?? ''] : [];
      const cols = table === 'opportunities'
        ? '(slug, kind, status, title_en, title_fa, org_en, country_en, official_source_url, deadline, payload)'
        : table === 'guides' ? '(slug, title_en, title_fa, category_en, payload)' : '(slug, title_en, title_fa, payload)';
      const vals = table === 'opportunities'
        ? [slug.toLowerCase(), ...extra, titleEn, titleFa].slice(0, 0) : [];
      // Build explicitly per table to keep SQL static (no injection: table is internal constant)
      let row;
      if (table === 'opportunities') {
        ({ rows: [row] } = await query(
          `INSERT INTO opportunities (slug, kind, status, title_en, title_fa, org_en, country_en, official_source_url, deadline, payload)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (slug) DO UPDATE SET kind=EXCLUDED.kind, status=EXCLUDED.status, title_en=EXCLUDED.title_en,
             title_fa=EXCLUDED.title_fa, org_en=EXCLUDED.org_en, country_en=EXCLUDED.country_en,
             official_source_url=EXCLUDED.official_source_url, deadline=EXCLUDED.deadline, payload=EXCLUDED.payload, updated_at=now()
           RETURNING *`,
          [slug.toLowerCase(), req.body.kind ?? p?.kind ?? 'scholarship', req.body.status ?? p?.status ?? 'demo',
            titleEn, titleFa, p?.organization?.en ?? '', p?.country?.en ?? '',
            p?.officialSourceUrl ?? null, p?.deadline ?? null, JSON.stringify(p)],
        ));
      } else if (table === 'guides') {
        ({ rows: [row] } = await query(
          `INSERT INTO guides (slug, title_en, title_fa, category_en, payload)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (slug) DO UPDATE SET title_en=EXCLUDED.title_en, title_fa=EXCLUDED.title_fa,
             category_en=EXCLUDED.category_en, payload=EXCLUDED.payload, updated_at=now()
           RETURNING *`,
          [slug.toLowerCase(), titleEn, titleFa, p?.category?.en ?? '', JSON.stringify(p)],
        ));
      } else {
        ({ rows: [row] } = await query(
          `INSERT INTO visa_topics (slug, title_en, title_fa, payload)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (slug) DO UPDATE SET title_en=EXCLUDED.title_en, title_fa=EXCLUDED.title_fa,
             payload=EXCLUDED.payload, updated_at=now()
           RETURNING *`,
          [slug.toLowerCase(), titleEn, titleFa, JSON.stringify(p)],
        ));
      }
      void cols; void vals; void extra;
      res.status(201).json({ item: pick(row) });
    } catch (err) { next(err); }
  });
  r.delete('/:slug', async (req, res, next) => {
    try {
      await query(`DELETE FROM ${table} WHERE slug=$1`, [req.params.slug.toLowerCase()]);
      res.json({ ok: true });
    } catch (err) { next(err); }
  });
  return r;
}

const pickPayload = (r) => ({ ...(r.payload || {}), slug: r.slug, updatedAt: r.updated_at });
router.use('/opportunities', crud('opportunities', pickPayload));
router.use('/guides', crud('guides', pickPayload));
router.use('/visa-topics', crud('visa_topics', pickPayload));

// ---------- Settings ----------
router.get('/settings', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM site_settings WHERE id=1');
    res.json({ settings: mapSettings(rows[0]) });
  } catch (err) { next(err); }
});

router.put('/settings', async (req, res, next) => {
  try {
    const schema = z.object({
      siteNameEn: z.string().max(120).optional(),
      siteNameFa: z.string().max(120).optional(),
      taglineEn: z.string().max(300).optional(),
      taglineFa: z.string().max(300).optional(),
      contactNoteEn: z.string().max(1000).optional(),
      contactNoteFa: z.string().max(1000).optional(),
      maintenanceMode: z.boolean().optional(),
      testMode: z.boolean().optional(),
      hesabpayQrImage: z.string().max(1_200_000).optional(),
      hesabpayAccountLabel: z.string().max(120).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
    const b = parsed.data;
    await query(
      `UPDATE site_settings SET
        site_name_en=COALESCE($1,site_name_en), site_name_fa=COALESCE($2,site_name_fa),
        tagline_en=COALESCE($3,tagline_en), tagline_fa=COALESCE($4,tagline_fa),
        contact_note_en=COALESCE($5,contact_note_en), contact_note_fa=COALESCE($6,contact_note_fa),
        maintenance_mode=COALESCE($7,maintenance_mode), test_mode=COALESCE($8,test_mode),
        hesabpay_qr_image=COALESCE($9,hesabpay_qr_image), hesabpay_account_label=COALESCE($10,hesabpay_account_label),
        updated_at=now() WHERE id=1`,
      [b.siteNameEn ?? null, b.siteNameFa ?? null, b.taglineEn ?? null, b.taglineFa ?? null,
        b.contactNoteEn ?? null, b.contactNoteFa ?? null, b.maintenanceMode ?? null, b.testMode ?? null,
        b.hesabpayQrImage ?? null, b.hesabpayAccountLabel ?? null],
    );
    await audit(req.admin.sub, 'update-settings', 'settings', '1');
    const { rows } = await query('SELECT * FROM site_settings WHERE id=1');
    res.json({ settings: mapSettings(rows[0]) });
  } catch (err) { next(err); }
});

export function mapSettings(r) {
  if (!r) return null;
  return {
    siteNameEn: r.site_name_en, siteNameFa: r.site_name_fa,
    taglineEn: r.tagline_en, taglineFa: r.tagline_fa,
    contactNoteEn: r.contact_note_en, contactNoteFa: r.contact_note_fa,
    maintenanceMode: r.maintenance_mode, testMode: r.test_mode,
    hesabpayQrImage: r.hesabpay_qr_image, hesabpayAccountLabel: r.hesabpay_account_label,
  };
}

export default router;
