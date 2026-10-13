-- TechLand initial schema (PostgreSQL 16)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Admins ----------
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  subscription_plan_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active','pending','expired','cancelled')),
  subscription_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_created ON users (created_at DESC);

-- ---------- Transactions (HesabPay review queue) ----------
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL,
  gateway TEXT NOT NULL DEFAULT 'hesabpay',
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  email TEXT,
  reference TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions (created_at DESC);

-- ---------- CMS content (payload keeps full bilingual record) ----------
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'scholarship',
  status TEXT NOT NULL DEFAULT 'demo',
  title_en TEXT NOT NULL DEFAULT '',
  title_fa TEXT NOT NULL DEFAULT '',
  org_en TEXT NOT NULL DEFAULT '',
  country_en TEXT NOT NULL DEFAULT '',
  official_source_url TEXT,
  deadline TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL DEFAULT '',
  title_fa TEXT NOT NULL DEFAULT '',
  category_en TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visa_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL DEFAULT '',
  title_fa TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Site settings (singleton id=1) ----------
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name_en TEXT NOT NULL DEFAULT 'TechLand',
  site_name_fa TEXT NOT NULL DEFAULT 'تک‌لند',
  tagline_en TEXT NOT NULL DEFAULT '',
  tagline_fa TEXT NOT NULL DEFAULT '',
  contact_note_en TEXT NOT NULL DEFAULT '',
  contact_note_fa TEXT NOT NULL DEFAULT '',
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  test_mode BOOLEAN NOT NULL DEFAULT TRUE,
  hesabpay_qr_image TEXT NOT NULL DEFAULT '',
  hesabpay_account_label TEXT NOT NULL DEFAULT 'HesabPay',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ---------- Audit log ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
