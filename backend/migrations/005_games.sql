-- Games catalog (Admin → Games). Customers see new games instantly;
-- is_new drives the NEW badge on the public Games page.
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL DEFAULT '',
  title_fa TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_fa TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  genre TEXT[] NOT NULL DEFAULT '{}',
  platform TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  access_type TEXT NOT NULL DEFAULT 'paid' CHECK (access_type IN ('free','paid','vip')),
  rating NUMERIC(3,1),
  release_year INTEGER,
  developer TEXT NOT NULL DEFAULT '',
  publisher TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_games_active ON games (is_active);
CREATE INDEX IF NOT EXISTS idx_games_new ON games (is_new);
