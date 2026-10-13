import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { hashPassword, requireAdmin, signAdminToken, verifyPassword } from '../auth.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// POST /api/admin/login  { username, password }
router.post('/login', limiter, async (req, res, next) => {
  try {
    const schema = z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(128) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
    const username = parsed.data.username.trim();
    const { rows } = await query('SELECT * FROM admins WHERE lower(username) = lower($1)', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await verifyPassword(parsed.data.password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const token = signAdminToken(rows[0]);
    res.json({
      token,
      admin: { id: rows[0].id, username: rows[0].username },
      mustChangePassword: !!rows[0].must_change_password,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/me
router.get('/me', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id, username, must_change_password FROM admins WHERE id = $1', [req.admin.sub]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ admin: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/admin/change-credentials  { username?, newPassword? }
router.post('/change-credentials', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().trim().min(3).max(64).optional(),
      newPassword: z.string().min(8).max(128).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    const { username, newPassword } = parsed.data;
    if (!username && !newPassword) return res.status(400).json({ error: 'nothing_to_change' });
    if (username) {
      const clash = await query('SELECT id FROM admins WHERE lower(username)=lower($1) AND id <> $2', [username, req.admin.sub]);
      if (clash.rowCount > 0) return res.status(409).json({ error: 'username_taken' });
      await query('UPDATE admins SET username=$1, updated_at=now() WHERE id=$2', [username.trim(), req.admin.sub]);
    }
    if (newPassword) {
      const passwordHash = await hashPassword(newPassword);
      await query('UPDATE admins SET password_hash=$1, must_change_password=FALSE, updated_at=now() WHERE id=$2', [passwordHash, req.admin.sub]);
    }
    await query(`INSERT INTO audit_logs (admin_id, action, entity) VALUES ($1,'change-credentials','admin')`, [req.admin.sub]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
