// Applies every backend/migrations/*.sql in order, then bootstraps the admin account.
// All migrations are idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING),
// so re-running (e.g. on every `docker compose up`) never wipes admin edits.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing. Copy backend/.env.example to backend/.env');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
for (const file of files) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  await client.query(sql);
  console.log(`[migrate] applied ${file}`);
}

const { rows } = await client.query('SELECT COUNT(*)::int AS c FROM admins');
if (rows[0].c === 0) {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  if (password.length < 8) console.warn('[migrate] WARNING: bootstrap admin password is short; change it after first login.');
  const hash = await bcrypt.hash(password, 12);
  await client.query('INSERT INTO admins (username, password_hash, must_change_password) VALUES ($1,$2,TRUE)', [username, hash]);
  console.log(`[migrate] bootstrap admin created: ${username} (change password in Admin → Settings)`);
} else {
  console.log('[migrate] admins table already has accounts — bootstrap skipped');
}

await client.end();
console.log('[migrate] done');
