-- ============================================================================
-- Additive Migration: Create user_settings table for user preferences
-- Safe to re-run. Idempotent.
-- ============================================================================

-- 1. Table Definition
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  data_saver BOOLEAN NOT NULL DEFAULT false,
  reduce_motion BOOLEAN NOT NULL DEFAULT false,
  offline_drafts BOOLEAN NOT NULL DEFAULT true,
  notif_task_alerts BOOLEAN NOT NULL DEFAULT true,
  notif_payout_updates BOOLEAN NOT NULL DEFAULT true,
  notif_referral_activity BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Idempotent)
DROP POLICY IF EXISTS "user_settings_owner_access" ON public.user_settings;
CREATE POLICY "user_settings_owner_access"
  ON public.user_settings
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
