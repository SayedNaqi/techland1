-- Movies & series catalog (Admin → Videos). Playback is via OK.ru / VK embeds
-- stored per part (movie = 1 part, series = N episode parts).
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('movie','series')),
  title_en TEXT NOT NULL DEFAULT '',
  title_fa TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_fa TEXT NOT NULL DEFAULT '',
  poster_url TEXT NOT NULL DEFAULT '',
  backdrop_url TEXT NOT NULL DEFAULT '',
  year INTEGER,
  genre TEXT[] NOT NULL DEFAULT '{}',
  duration_min INTEGER,
  country TEXT NOT NULL DEFAULT '',
  rating NUMERIC(3,1),
  seasons INTEGER,
  episodes INTEGER,
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  access_type TEXT NOT NULL DEFAULT 'subscription' CHECK (access_type IN ('free','subscription')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_videos_kind ON videos (kind);
CREATE INDEX IF NOT EXISTS idx_videos_active ON videos (is_active);
