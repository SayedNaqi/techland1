import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('[db] DATABASE_URL is not set. Copy backend/.env.example to backend/.env');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

pool.on('error', (err) => console.error('[db] pool error', err));

export async function query(text, params) {
  return pool.query(text, params);
}
