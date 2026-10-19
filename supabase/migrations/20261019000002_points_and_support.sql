-- ==============================================================================
-- Migration: 20261019000002_points_and_support.sql
-- Purpose: Additive Points & Tier System (raising withdrawal limits),
--          Server-verified Ad Watch Sessions, and AI Support Tickets.
-- Safe to re-run. Idempotent.
-- ==============================================================================

-- 1. LEVELS CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.levels (
  name TEXT PRIMARY KEY,
  tier_order INTEGER NOT NULL UNIQUE,
  min_points INTEGER NOT NULL CHECK (min_points >= 0),
  daily_withdrawal_limit INTEGER NOT NULL CHECK (daily_withdrawal_limit > 0),
  max_per_withdrawal INTEGER NOT NULL CHECK (max_per_withdrawal > 0),
  badge_color TEXT NOT NULL DEFAULT '#1E6FD9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read level configurations
DROP POLICY IF EXISTS "Authenticated users can read levels config" ON public.levels;
CREATE POLICY "Authenticated users can read levels config"
  ON public.levels
  FOR SELECT
  USING (true);

-- Seed the 5 configurable tiers (Starter matches existing default limits)
INSERT INTO public.levels (name, tier_order, min_points, daily_withdrawal_limit, max_per_withdrawal, badge_color)
VALUES
  ('Starter',  1,    0,   2500,  1500, '#64748B'),
  ('Bronze',   2,  150,   5000,  3000, '#D97706'),
  ('Silver',   3,  500,  15000,  7500, '#0284C7'),
  ('Gold',     4, 1500,  35000, 15000, '#F59E0B'),
  ('Platinum', 5, 5000, 100000, 50000, '#1E6FD9')
ON CONFLICT (name) DO NOTHING;

-- 2. USER POINTS TABLE
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id TEXT PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  level TEXT NOT NULL DEFAULT 'Starter' REFERENCES public.levels(name),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read only their own user_points" ON public.user_points;
CREATE POLICY "Users can read only their own user_points"
  ON public.user_points
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 3. APPEND-ONLY POINTS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points <> 0),
  reason TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_points_ledger_user_ref UNIQUE (user_id, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_user_created
  ON public.points_ledger (user_id, created_at DESC);

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read only their own points_ledger rows" ON public.points_ledger;
CREATE POLICY "Users can read only their own points_ledger rows"
  ON public.points_ledger
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Prevent UPDATE or DELETE on points_ledger (append-only enforcement)
CREATE OR REPLACE FUNCTION public.prevent_points_ledger_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'points_ledger is append-only. Updates and deletes are prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_points_ledger_immutable ON public.points_ledger;
CREATE TRIGGER trg_points_ledger_immutable
  BEFORE UPDATE OR DELETE ON public.points_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_points_ledger_mutation();

-- 4. ATOMIC SERVER-SIDE POINT AWARD & LEVEL RECALCULATION FUNCTION
CREATE OR REPLACE FUNCTION public.award_user_points_atomic(
  p_user_id TEXT,
  p_points INTEGER,
  p_reason TEXT,
  p_reference_id TEXT
)
RETURNS public.user_points
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id UUID;
  v_new_total INTEGER;
  v_new_level TEXT;
  v_result public.user_points;
BEGIN
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Awarded points must be a positive integer.';
  END IF;

  -- Idempotency check: if reference_id already exists for this user, return current state
  SELECT id INTO v_existing_id
  FROM public.points_ledger
  WHERE user_id = p_user_id AND reference_id = p_reference_id;

  IF v_existing_id IS NOT NULL THEN
    SELECT * INTO v_result FROM public.user_points WHERE user_id = p_user_id;
    RETURN v_result;
  END IF;

  INSERT INTO public.points_ledger (user_id, points, reason, reference_id)
  VALUES (p_user_id, p_points, p_reason, p_reference_id);

  INSERT INTO public.user_points (user_id, total_points, level, updated_at)
  VALUES (p_user_id, p_points, 'Starter', NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = public.user_points.total_points + p_points,
    updated_at = NOW()
  RETURNING total_points INTO v_new_total;

  SELECT name INTO v_new_level
  FROM public.levels
  WHERE min_points <= v_new_total
  ORDER BY min_points DESC
  LIMIT 1;

  UPDATE public.user_points
  SET level = COALESCE(v_new_level, 'Starter'),
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- 5. ATOMIC POINT REVOCATION FUNCTION (When a submission is rejected or flagged)
CREATE OR REPLACE FUNCTION public.revoke_user_points_atomic(
  p_user_id TEXT,
  p_original_reference_id TEXT,
  p_revoke_reason TEXT
)
RETURNS public.user_points
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_orig_points INTEGER;
  v_revoke_ref TEXT := 'REVOKE:' || p_original_reference_id;
  v_existing_revoke UUID;
  v_new_total INTEGER;
  v_new_level TEXT;
  v_result public.user_points;
BEGIN
  SELECT points INTO v_orig_points
  FROM public.points_ledger
  WHERE user_id = p_user_id AND reference_id = p_original_reference_id AND points > 0;

  IF v_orig_points IS NULL THEN
    SELECT * INTO v_result FROM public.user_points WHERE user_id = p_user_id;
    RETURN v_result;
  END IF;

  SELECT id INTO v_existing_revoke
  FROM public.points_ledger
  WHERE user_id = p_user_id AND reference_id = v_revoke_ref;

  IF v_existing_revoke IS NOT NULL THEN
    SELECT * INTO v_result FROM public.user_points WHERE user_id = p_user_id;
    RETURN v_result;
  END IF;

  INSERT INTO public.points_ledger (user_id, points, reason, reference_id)
  VALUES (p_user_id, -v_orig_points, p_revoke_reason, v_revoke_ref);

  UPDATE public.user_points
  SET total_points = GREATEST(0, total_points - v_orig_points),
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING total_points INTO v_new_total;

  SELECT name INTO v_new_level
  FROM public.levels
  WHERE min_points <= COALESCE(v_new_total, 0)
  ORDER BY min_points DESC
  LIMIT 1;

  UPDATE public.user_points
  SET level = COALESCE(v_new_level, 'Starter'),
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- 6. AD WATCH SESSIONS TABLE (Server-side duration & one-reward-per-ad verification)
CREATE TABLE IF NOT EXISTS public.ad_watch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  ad_id TEXT NOT NULL,
  campaign_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  required_seconds INTEGER NOT NULL DEFAULT 15 CHECK (required_seconds > 0),
  completed_at TIMESTAMPTZ,
  reward_kes INTEGER NOT NULL DEFAULT 0 CHECK (reward_kes >= 0),
  points_awarded INTEGER NOT NULL DEFAULT 2 CHECK (points_awarded >= 0),
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'expired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_watch_once_per_user
  ON public.ad_watch_sessions (user_id, ad_id)
  WHERE status = 'completed';

ALTER TABLE public.ad_watch_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read only their own ad_watch_sessions" ON public.ad_watch_sessions;
CREATE POLICY "Users can read only their own ad_watch_sessions"
  ON public.ad_watch_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 7. SUPPORT TICKETS TABLE (Human escalation from AI Support Assistant)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  username TEXT,
  email_or_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read and create their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can read and create their own support tickets"
  ON public.support_tickets
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
