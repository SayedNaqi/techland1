import { Router } from 'express';
import { query } from '../db.js';
import { listPlans } from '../plans.js';
import { videoRowToApi } from '../videos.js';

const router = Router();

// Public catalog — reads persisted CMS rows (falls back to [] when empty).
// The React frontend keeps its static seed data as fallback when API is not configured.
router.get('/opportunities', async (req, res, next) => {
  try {
    const status = (req.query.status || 'published').toString();
    const { rows } = await query(
      `SELECT payload, slug FROM opportunities WHERE status=$1 ORDER BY updated_at DESC LIMIT 200`,
      [status],
    );
    res.json({ items: rows.map((r) => ({ ...(r.payload || {}), slug: r.slug })) });
  } catch (err) { next(err); }
});

router.get('/guides', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT payload, slug FROM guides ORDER BY updated_at DESC LIMIT 200');
    res.json({ items: rows.map((r) => ({ ...(r.payload || {}), slug: r.slug })) });
  } catch (err) { next(err); }
});

router.get('/visa-topics', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT payload, slug FROM visa_topics ORDER BY updated_at DESC LIMIT 200');
    res.json({ items: rows.map((r) => ({ ...(r.payload || {}), slug: r.slug })) });
  } catch (err) { next(err); }
});

router.get('/settings', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT site_name_en, site_name_fa, tagline_en, tagline_fa, contact_note_en, contact_note_fa, hesabpay_account_label FROM site_settings WHERE id=1',
    );
    const s = rows[0] || {};
    res.json({
      settings: {
        siteNameEn: s.site_name_en, siteNameFa: s.site_name_fa,
        taglineEn: s.tagline_en, taglineFa: s.tagline_fa,
        contactNoteEn: s.contact_note_en, contactNoteFa: s.contact_note_fa,
        hesabpayAccountLabel: s.hesabpay_account_label,
      },
    });
  } catch (err) { next(err); }
});

// QR image is served separately (can be large data-URL); public page uses it for display only.
router.get('/settings/qr', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT hesabpay_qr_image FROM site_settings WHERE id=1');
    res.json({ hesabpayQrImage: rows[0]?.hesabpay_qr_image || '' });
  } catch (err) { next(err); }
});

router.get('/plans', async (_req, res, next) => {
  try {
    // Admin-managed plans from Postgres (Admin → Plans). Falls back to static
    // defaults when the table is empty (e.g. backend started without migrations).
    const plans = await listPlans({ activeOnly: true });
    if (plans.length > 0) return res.json({ plans });
    res.json({
      plans: [
        { id: 'plan-monthly', period: 'monthly', name: { en: 'Monthly', fa: 'ماهانه' }, priceUSD: 5.99, features: { en: [], fa: [] } },
        { id: 'plan-quarterly', period: 'quarterly', name: { en: '3 Months', fa: '۳ ماهه' }, priceUSD: 14.99, originalPriceUSD: 17.97, features: { en: [], fa: [] }, isPopular: true },
        { id: 'plan-yearly', period: 'yearly', name: { en: 'Yearly', fa: 'سالانه' }, priceUSD: 49.99, originalPriceUSD: 71.88, features: { en: [], fa: [] }, isBestValue: true },
        { id: 'plan-lifetime', period: 'lifetime', name: { en: 'Lifetime', fa: 'مادام‌العمر' }, priceUSD: 149.99, features: { en: [], fa: [] } },
      ],
    });
  } catch (err) { next(err); }
});

// Movies & series catalog (only active items).
router.get('/videos', async (req, res, next) => {
  try {
    const kind = (req.query.kind || '').toString();
    const { rows } = await query(
      kind === 'movie' || kind === 'series'
        ? 'SELECT * FROM videos WHERE kind=$1 AND is_active = TRUE ORDER BY sort_order, updated_at DESC LIMIT 200'
        : 'SELECT * FROM videos WHERE is_active = TRUE ORDER BY sort_order, updated_at DESC LIMIT 200',
      kind === 'movie' || kind === 'series' ? [kind] : [],
    );
    res.json({ videos: rows.map(videoRowToApi) });
  } catch (err) { next(err); }
});

router.get('/videos/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM videos WHERE slug=$1 AND is_active = TRUE', [req.params.slug.toLowerCase()]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ video: videoRowToApi(rows[0]) });
  } catch (err) { next(err); }
});

// Active ads for a slot (public — used by <AdSlot> on Movies / Series / Watch).
router.get('/ads', async (req, res, next) => {
  try {
    const slot = (req.query.slot || '').toString();
    if (!['movies_hero', 'series_hero', 'watch_top', 'watch_bottom'].includes(slot)) {
      return res.status(400).json({ error: 'invalid_slot' });
    }
    const { rows } = await query(
      'SELECT * FROM ads WHERE slot=$1 AND is_active = TRUE ORDER BY sort_order, updated_at DESC LIMIT 10',
      [slot],
    );
    res.json({
      ads: rows.map((r) => ({
        id: r.id, title: r.title,
        imageUrl: r.image_url || undefined, linkUrl: r.link_url || undefined,
        html: r.html || undefined,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
