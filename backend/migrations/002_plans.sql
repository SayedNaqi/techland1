-- Subscription plans managed from Admin → Plans (bilingual, prices in integer cents)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly','quarterly','yearly','lifetime')),
  name_en TEXT NOT NULL DEFAULT '',
  name_fa TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  original_price_cents INTEGER CHECK (original_price_cents IS NULL OR original_price_cents >= 0),
  features_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  features_fa JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_value BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed defaults (insert-only: never overwrites admin edits on re-run)
INSERT INTO plans (id, period, name_en, name_fa, price_cents, original_price_cents, features_en, features_fa, is_popular, is_best_value, sort_order) VALUES
('plan-monthly', 'monthly', 'Monthly', 'ماهانه', 599, NULL,
 '["Unlimited streaming","HD & 4K quality","Movie downloads","Series downloads","Ad-free experience","Multi-device access"]'::jsonb,
 '["پخش نامحدود","کیفیت HD و 4K","دانلود فیلم","دانلود سریال","بدون تبلیغات","دسترسی چند دستگاه"]'::jsonb,
 FALSE, FALSE, 1),
('plan-quarterly', 'quarterly', '3 Months', '۳ ماهه', 1499, 1797,
 '["Unlimited streaming","HD & 4K quality","Movie downloads","Series downloads","Ad-free experience","Multi-device access","Offline mode"]'::jsonb,
 '["پخش نامحدود","کیفیت HD و 4K","دانلود فیلم","دانلود سریال","بدون تبلیغات","دسترسی چند دستگاه","حالت آفلاین"]'::jsonb,
 TRUE, FALSE, 2),
('plan-yearly', 'yearly', 'Yearly', 'سالانه', 4999, 7188,
 '["Unlimited streaming","HD & 4K quality","Movie downloads","Series downloads","Ad-free experience","Multi-device access","Offline mode","Priority support","Early access to new content"]'::jsonb,
 '["پخش نامحدود","کیفیت HD و 4K","دانلود فیلم","دانلود سریال","بدون تبلیغات","دسترسی چند دستگاه","حالت آفلاین","پشتیبانی اولویت‌دار","دسترسی زودهنگام به محتوا"]'::jsonb,
 FALSE, TRUE, 3),
('plan-lifetime', 'lifetime', 'Lifetime', 'مادام‌العمر', 14999, NULL,
 '["Unlimited streaming — forever","HD & 4K quality","Movie downloads","Series downloads","Ad-free experience","Multi-device access","Offline mode","Priority support","Early access to new content"]'::jsonb,
 '["پخش نامحدود — برای همیشه","کیفیت HD و 4K","دانلود فیلم","دانلود سریال","بدون تبلیغات","دسترسی چند دستگاه","حالت آفلاین","پشتیبانی اولویت‌دار","دسترسی زودهنگام به محتوا"]'::jsonb,
 FALSE, FALSE, 4)
ON CONFLICT (id) DO NOTHING;
