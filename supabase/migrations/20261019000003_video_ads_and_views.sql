-- ==============================================================================
-- Migration: 20261019000003_video_ads_and_views.sql
-- Purpose: Additive Video Ads columns on campaigns, video_ads table, and
--          ad_views table with server-verified heartbeats and RLS.
-- ==============================================================================

-- 1. Extend campaigns table with video ad fields (additive)
ALTER TABLE IF EXISTS public.campaigns
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_type TEXT CHECK (video_type IN ('hosted', 'embedded')),
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 15 CHECK (duration_seconds > 0 AND duration_seconds <= 60),
  ADD COLUMN IF NOT EXISTS min_watch_seconds INTEGER DEFAULT 15 CHECK (min_watch_seconds > 0 AND min_watch_seconds <= 60),
  ADD COLUMN IF NOT EXISTS reward_kes INTEGER DEFAULT 15 CHECK (reward_kes >= 0),
  ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 2 CHECK (reward_points >= 0);

-- 2. Dedicated video_ads table for standalone & campaign-linked video ads
CREATE TABLE IF NOT EXISTS public.video_ads (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  advertiser_id TEXT,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'hosted' CHECK (video_type IN ('hosted', 'embedded')),
  thumbnail_url TEXT NOT NULL,
  advertiser_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 15 CHECK (duration_seconds > 0 AND duration_seconds <= 60),
  min_watch_seconds INTEGER NOT NULL DEFAULT 15 CHECK (min_watch_seconds > 0 AND min_watch_seconds <= duration_seconds),
  reward_kes INTEGER NOT NULL DEFAULT 15 CHECK (reward_kes > 0),
  reward_points INTEGER NOT NULL DEFAULT 2 CHECK (reward_points > 0),
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'rejected')),
  rights_attested BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.video_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active video_ads"
  ON public.video_ads
  FOR SELECT
  USING (status = 'active');

-- 3. ad_views table with heartbeat tracking and unique (user_id, ad_id) constraint
CREATE TABLE IF NOT EXISTS public.ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  ad_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_heartbeat_at TIMESTAMPTZ,
  watched_seconds INTEGER NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  reward_kes INTEGER NOT NULL DEFAULT 0 CHECK (reward_kes >= 0),
  reward_points INTEGER NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  CONSTRAINT uq_ad_views_user_ad UNIQUE (user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_views_user_started
  ON public.ad_views (user_id, started_at DESC);

ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read only their own ad_views rows"
  ON public.ad_views
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 4. Atomic server-side function to complete an ad view and credit reward once
CREATE OR REPLACE FUNCTION public.complete_ad_view_atomic(
  p_user_id TEXT,
  p_ad_id TEXT,
  p_min_watch_seconds INTEGER,
  p_reward_kes INTEGER,
  p_reward_points INTEGER
)
RETURNS public.ad_views
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_view public.ad_views;
  v_elapsed_sec NUMERIC;
BEGIN
  SELECT * INTO v_view
  FROM public.ad_views
  WHERE user_id = p_user_id AND ad_id = p_ad_id
  FOR UPDATE;

  IF v_view.id IS NULL THEN
    RAISE EXCEPTION 'Ad view session not found.';
  END IF;

  IF v_view.rewarded_at IS NOT NULL THEN
    RAISE EXCEPTION 'Reward already claimed for this ad.';
  END IF;

  v_elapsed_sec := EXTRACT(EPOCH FROM (NOW() - v_view.started_at));

  IF v_elapsed_sec < p_min_watch_seconds OR v_view.watched_seconds < p_min_watch_seconds THEN
    RAISE EXCEPTION 'Minimum watch duration (%) seconds not yet satisfied.', p_min_watch_seconds;
  END IF;

  UPDATE public.ad_views
  SET completed_at = NOW(),
      rewarded_at = NOW(),
      reward_kes = p_reward_kes,
      reward_points = p_reward_points
  WHERE id = v_view.id
  RETURNING * INTO v_view;

  -- Award points idempotently via points ledger function
  PERFORM public.award_user_points_atomic(
    p_user_id,
    p_reward_points,
    'watched_ad',
    'AD_WATCH:' || p_ad_id
  );

  RETURN v_view;
END;
$$;
