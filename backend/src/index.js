import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/admin-auth.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import publicRoutes from './routes/public.js';
import uploadRoutes from './routes/upload.js';
import { pool } from './db.js';
import fs from 'node:fs';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));

const origins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);
// "*" (dev only, e.g. WSL/DHCP-changing LAN IPs) reflects any origin. Safe here:
// auth uses Bearer tokens, never cookies, so no credentialed-CORS risk.
const corsOrigin = origins.includes('*') ? true : origins;
app.use(cors({ origin: corsOrigin, credentials: false }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'techland-backend' }));
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, db: 'down' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes); // /login, /me, /change-credentials
app.use('/api/admin', adminRoutes);     // /stats, /users, /transactions, /opportunities...
app.use('/api/admin/upload', uploadRoutes); // admin file upload (video files)
app.use('/api/payments', paymentRoutes);
app.use('/api/public', publicRoutes);

// Self-hosted video files (uploaded via Admin → Videos). express.static
// supports Range requests, so seeking works in the native player.
const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media';
try {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  app.use('/media', express.static(MEDIA_DIR, { maxAge: '7d', fallthrough: true }));
} catch (err) {
  console.warn('[api] media dir unavailable:', MEDIA_DIR, err);
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

// Central error handler (never leak stack to clients in production)
app.use((err, _req, res, _next) => {
  console.error('[api] error', err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] TechLand backend listening on :${PORT}`);
  console.log(`[api] CORS origins: ${origins.join(', ')}`);
});
