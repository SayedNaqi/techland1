import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || '';
if (!SECRET || SECRET.length < 32) {
  console.warn('[auth] WARNING: JWT_SECRET is missing or too short (<32 chars). Set a strong secret in backend/.env');
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, role: 'admin', username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ADMIN_TTL || '12h' },
  );
}

export function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, role: 'user', email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_USER_TTL || '7d' },
  );
}

function bearerToken(req) {
  const h = req.headers.authorization || '';
  const [scheme, token] = h.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function requireAdmin(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

export function requireUser(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'user') return res.status(403).json({ error: 'forbidden' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

export function publicUserRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    subscriptionPlanId: r.subscription_plan_id ?? undefined,
    subscriptionStatus: r.subscription_status ?? undefined,
    subscriptionSince: r.subscription_since ? new Date(r.subscription_since).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
  };
}
