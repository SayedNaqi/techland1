-- Direct (self-hosted) playback + on-site ads.
-- Video parts may carry direct_url (MP4/HLS on our own storage) alongside embed_url.
-- No schema change needed for parts (JSONB); this migration adds the ads table.
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL CHECK (slot IN ('movies_hero','series_hero','watch_top','watch_bottom')),
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  html TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ads_slot ON ads (slot);
