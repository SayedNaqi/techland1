import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { hashPassword, publicUserRow, signUserToken, verifyPassword } from '../auth.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30 });

const RegisterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});
const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

// POST /api/auth/register
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    const { name, email, password } = parsed.data;
    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'exists' });
    const passwordHash = await hashPassword(password);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING *`,
      [name.trim(), email, passwordHash],
    );
    const user = publicUserRow(rows[0]);
    const token = signUserToken(rows[0]);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
    const { email, password } = parsed.data;
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await verifyPassword(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    res.json({ user: publicUserRow(rows[0]), token: signUserToken(rows[0]) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
import { requireUser } from '../auth.js';
router.get('/me', requireUser, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.sub]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ user: publicUserRow(rows[0]) });
  } catch (err) { next(err); }
});

export default router;
