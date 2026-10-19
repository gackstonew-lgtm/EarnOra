-- ============================================================================
-- Earnora Additive Migration: Advertiser Portal & Campaign Wallet
-- Safe to re-run. Idempotent.
-- Enforces integer KES (BIGINT), append-only ledger, Row Level Security (RLS)
-- on every table, and atomic Postgres transaction functions for money movements.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Update profiles.role check constraint to include 'advertiser'
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'advertiser', 'business', 'admin', 'moderator'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Platform Settings (Admin configurable fee % and limits)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  platform_fee_percent INT NOT NULL DEFAULT 15 CHECK (platform_fee_percent BETWEEN 0 AND 50),
  daily_user_submission_limit INT NOT NULL DEFAULT 5 CHECK (daily_user_submission_limit BETWEEN 1 AND 100),
  min_reward_per_task_kes BIGINT NOT NULL DEFAULT 50 CHECK (min_reward_per_task_kes >= 10),
  min_campaign_tasks INT NOT NULL DEFAULT 5 CHECK (min_campaign_tasks >= 1),
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.platform_settings (id, platform_fee_percent, daily_user_submission_limit, min_reward_per_task_kes, min_campaign_tasks)
VALUES (1, 15, 5, 50, 5)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Advertisers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID UNIQUE,
  business_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL,
  business_type VARCHAR(80) NOT NULL,
  website TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended')),
  status_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advertisers_profile_id ON public.advertisers(profile_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON public.advertisers(status);

ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. Wallets Table (Additive columns for Advertiser KES integer balances)
-- ----------------------------------------------------------------------------
ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS advertiser_id UUID UNIQUE REFERENCES public.advertisers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS balance_kes BIGINT NOT NULL DEFAULT 0 CHECK (balance_kes >= 0),
  ADD COLUMN IF NOT EXISTS held_kes BIGINT NOT NULL DEFAULT 0 CHECK (held_kes >= 0),
  ADD COLUMN IF NOT EXISTS total_funded_kes BIGINT NOT NULL DEFAULT 0 CHECK (total_funded_kes >= 0),
  ADD COLUMN IF NOT EXISTS total_spent_kes BIGINT NOT NULL DEFAULT 0 CHECK (total_spent_kes >= 0);

CREATE INDEX IF NOT EXISTS idx_wallets_advertiser_id ON public.wallets(advertiser_id);

-- ----------------------------------------------------------------------------
-- 5. Wallet Transactions (Append-Only Ledger, Integer KES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
  advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE RESTRICT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  tx_type VARCHAR(30) NOT NULL CHECK (tx_type IN ('top_up', 'campaign_hold', 'user_payout', 'refund', 'fee')),
  amount_kes BIGINT NOT NULL CHECK (amount_kes > 0),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('credit', 'debit')),
  balance_before_kes BIGINT NOT NULL CHECK (balance_before_kes >= 0),
  balance_after_kes BIGINT NOT NULL CHECK (balance_after_kes >= 0),
  reference_id VARCHAR(150),
  campaign_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON public.wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_advertiser_id ON public.wallet_transactions(advertiser_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON public.wallet_transactions(reference_id);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Enforce Append-Only on wallet_transactions (Never edit or delete rows)
CREATE OR REPLACE FUNCTION public.prevent_wallet_tx_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'wallet_transactions is an append-only ledger: UPDATE and DELETE operations are strictly prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_transactions_append_only ON public.wallet_transactions;
CREATE TRIGGER trg_wallet_transactions_append_only
  BEFORE UPDATE OR DELETE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_wallet_tx_modification();

-- ----------------------------------------------------------------------------
-- 6. Campaigns Table (Additive columns & constraints for Advertiser Portal)
-- ----------------------------------------------------------------------------
ALTER TABLE public.campaigns
  ALTER COLUMN business_id DROP NOT NULL;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(40) NOT NULL DEFAULT 'restaurant_review'
    CHECK (campaign_type IN ('restaurant_review', 'app_testing', 'survey', 'telco', 'product')),
  ADD COLUMN IF NOT EXISTS instructions TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS proof_requirements JSONB NOT NULL DEFAULT '{"requireText":true,"minWords":40,"requireScreenshot":false,"requireReceipt":false}'::jsonb,
  ADD COLUMN IF NOT EXISTS reward_per_task_kes BIGINT NOT NULL DEFAULT 100 CHECK (reward_per_task_kes > 0),
  ADD COLUMN IF NOT EXISTS platform_fee_kes BIGINT NOT NULL DEFAULT 0 CHECK (platform_fee_kes >= 0),
  ADD COLUMN IF NOT EXISTS total_budget_kes BIGINT NOT NULL DEFAULT 0 CHECK (total_budget_kes >= 0),
  ADD COLUMN IF NOT EXISTS remaining_budget_kes BIGINT NOT NULL DEFAULT 0 CHECK (remaining_budget_kes >= 0),
  ADD COLUMN IF NOT EXISTS max_tasks INT NOT NULL DEFAULT 10 CHECK (max_tasks > 0),
  ADD COLUMN IF NOT EXISTS completed_tasks INT NOT NULL DEFAULT 0 CHECK (completed_tasks >= 0 AND completed_tasks <= max_tasks),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS target_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'campaigns'
      AND constraint_name = 'campaigns_status_check'
  ) THEN
    ALTER TABLE public.campaigns DROP CONSTRAINT campaigns_status_check;
  END IF;

  ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_status_check
    CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected', 'cancelled'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. Campaign Submissions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  headline VARCHAR(200) NOT NULL,
  review_text TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  proof_url TEXT,
  proof_file_name VARCHAR(255),
  proof_mime_type VARCHAR(80),
  proof_size_bytes INT,
  proof_hash VARCHAR(128),
  reward_kes BIGINT NOT NULL CHECK (reward_kes > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT,
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_campaign_submission UNIQUE (campaign_id, user_profile_id)
);

-- Unique index on non-null proof_hash for duplicate-proof detection across submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_submission_proof_hash
  ON public.campaign_submissions(proof_hash)
  WHERE proof_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign ON public.campaign_submissions(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_user ON public.campaign_submissions(user_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_flagged ON public.campaign_submissions(is_flagged, status);

ALTER TABLE public.campaign_submissions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 8. Payments Table (Money-In Gateway Records & Idempotent Callbacks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE RESTRICT,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
  provider VARCHAR(30) NOT NULL CHECK (provider IN ('mpesa_stk', 'paystack', 'flutterwave')),
  gateway_reference VARCHAR(150) UNIQUE NOT NULL,
  checkout_request_id VARCHAR(150) UNIQUE,
  amount_kes BIGINT NOT NULL CHECK (amount_kes > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  raw_callback_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_advertiser ON public.payments(advertiser_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_ref ON public.payments(gateway_reference);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 9. Audit Logs (Ensure RLS is enabled)
-- ----------------------------------------------------------------------------
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_role VARCHAR(30);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 10. Row Level Security (RLS) Helper Functions & Policies
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_advertiser_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT a.id
  FROM public.advertisers a
  JOIN public.profiles p ON p.id = a.profile_id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$;

-- Policies for platform_settings
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for advertisers
DROP POLICY IF EXISTS "Advertisers read own profile or admin reads all" ON public.advertisers;
CREATE POLICY "Advertisers read own profile or admin reads all"
  ON public.advertisers FOR SELECT
  USING (profile_id = public.current_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Advertisers insert own profile" ON public.advertisers;
CREATE POLICY "Advertisers insert own profile"
  ON public.advertisers FOR INSERT
  WITH CHECK (profile_id = public.current_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Advertisers update own profile or admin updates all" ON public.advertisers;
CREATE POLICY "Advertisers update own profile or admin updates all"
  ON public.advertisers FOR UPDATE
  USING (profile_id = public.current_profile_id() OR public.is_admin())
  WITH CHECK (profile_id = public.current_profile_id() OR public.is_admin());

-- Policies for wallets (extend so admins and advertisers see theirs)
DROP POLICY IF EXISTS "Advertisers and admins can read wallets" ON public.wallets;
CREATE POLICY "Advertisers and admins can read wallets"
  ON public.wallets FOR SELECT
  USING (
    profile_id = public.current_profile_id()
    OR advertiser_id = public.current_advertiser_id()
    OR public.is_admin()
  );

-- Policies for wallet_transactions
DROP POLICY IF EXISTS "Advertisers and users read own wallet_transactions or admin reads all" ON public.wallet_transactions;
CREATE POLICY "Advertisers and users read own wallet_transactions or admin reads all"
  ON public.wallet_transactions FOR SELECT
  USING (
    profile_id = public.current_profile_id()
    OR advertiser_id = public.current_advertiser_id()
    OR public.is_admin()
  );

-- Policies for campaigns:
-- Advertisers see their own campaigns, users see active campaigns, admins see all
DROP POLICY IF EXISTS "Campaigns select policy" ON public.campaigns;
CREATE POLICY "Campaigns select policy"
  ON public.campaigns FOR SELECT
  USING (
    status = 'active'
    OR advertiser_id = public.current_advertiser_id()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Advertisers insert own campaigns" ON public.campaigns;
CREATE POLICY "Advertisers insert own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (advertiser_id = public.current_advertiser_id() OR public.is_admin());

DROP POLICY IF EXISTS "Advertisers update own campaigns or admin updates all" ON public.campaigns;
CREATE POLICY "Advertisers update own campaigns or admin updates all"
  ON public.campaigns FOR UPDATE
  USING (advertiser_id = public.current_advertiser_id() OR public.is_admin())
  WITH CHECK (advertiser_id = public.current_advertiser_id() OR public.is_admin());

-- Policies for campaign_submissions:
-- Users see own submissions, advertisers see submissions for their campaigns, admins see all
DROP POLICY IF EXISTS "Submissions select policy" ON public.campaign_submissions;
CREATE POLICY "Submissions select policy"
  ON public.campaign_submissions FOR SELECT
  USING (
    user_profile_id = public.current_profile_id()
    OR advertiser_id = public.current_advertiser_id()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users insert own submissions" ON public.campaign_submissions;
CREATE POLICY "Users insert own submissions"
  ON public.campaign_submissions FOR INSERT
  WITH CHECK (
    user_profile_id = public.current_profile_id()
    AND advertiser_id IS DISTINCT FROM public.current_advertiser_id()
  );

DROP POLICY IF EXISTS "Advertisers and admins update submissions" ON public.campaign_submissions;
CREATE POLICY "Advertisers and admins update submissions"
  ON public.campaign_submissions FOR UPDATE
  USING (advertiser_id = public.current_advertiser_id() OR public.is_admin())
  WITH CHECK (advertiser_id = public.current_advertiser_id() OR public.is_admin());

-- Policies for payments:
DROP POLICY IF EXISTS "Advertisers read own payments or admin reads all" ON public.payments;
CREATE POLICY "Advertisers read own payments or admin reads all"
  ON public.payments FOR SELECT
  USING (advertiser_id = public.current_advertiser_id() OR public.is_admin());

-- Policies for audit_logs:
DROP POLICY IF EXISTS "Admins read all audit logs" ON public.audit_logs;
CREATE POLICY "Admins read all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- ============================================================================
-- 11. Atomic Postgres Functions for Money Movements (Integer KES only)
-- ============================================================================

-- 11a. Idempotent Wallet Top-Up Credit on Confirmed Webhook Success
CREATE OR REPLACE FUNCTION public.credit_advertiser_wallet_from_payment(
  p_gateway_reference VARCHAR,
  p_raw_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_new_balance BIGINT;
BEGIN
  -- Lock the payment row to prevent concurrent webhook double-credit
  SELECT * INTO v_payment
  FROM public.payments
  WHERE gateway_reference = p_gateway_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment reference % not found', p_gateway_reference;
  END IF;

  -- Idempotency check: if already completed, return immediately without crediting again
  IF v_payment.status = 'completed' THEN
    SELECT * INTO v_wallet FROM public.wallets WHERE id = v_payment.wallet_id;
    RETURN jsonb_build_object(
      'idempotent', true,
      'status', 'completed',
      'amount_kes', v_payment.amount_kes,
      'balance_kes', v_wallet.balance_kes
    );
  END IF;

  IF v_payment.status <> 'pending' THEN
    RAISE EXCEPTION 'Payment reference % is in terminal status %', p_gateway_reference, v_payment.status;
  END IF;

  -- Lock wallet row
  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE id = v_payment.wallet_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet % not found', v_payment.wallet_id;
  END IF;

  v_new_balance := v_wallet.balance_kes + v_payment.amount_kes;

  -- Update wallet balance atomically
  UPDATE public.wallets
  SET balance_kes = v_new_balance,
      total_funded_kes = total_funded_kes + v_payment.amount_kes,
      updated_at = NOW()
  WHERE id = v_wallet.id;

  -- Mark payment completed
  UPDATE public.payments
  SET status = 'completed',
      raw_callback_payload = COALESCE(p_raw_payload, raw_callback_payload),
      completed_at = NOW()
  WHERE id = v_payment.id;

  -- Append immutable ledger entry
  INSERT INTO public.wallet_transactions (
    wallet_id, advertiser_id, profile_id, tx_type, amount_kes, direction,
    balance_before_kes, balance_after_kes, reference_id, description, metadata
  ) VALUES (
    v_wallet.id, v_payment.advertiser_id, v_wallet.profile_id, 'top_up',
    v_payment.amount_kes, 'credit', v_wallet.balance_kes, v_new_balance,
    v_payment.gateway_reference,
    'Wallet top-up via ' || UPPER(v_payment.provider) || ' (' || v_payment.invoice_number || ')',
    jsonb_build_object('invoice_number', v_payment.invoice_number, 'provider', v_payment.provider)
  );

  -- Append audit log
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_type, target_id, details)
  VALUES (
    v_wallet.profile_id, 'advertiser', 'WALLET_TOP_UP_CREDITED', 'payment', v_payment.id::text,
    jsonb_build_object('amount_kes', v_payment.amount_kes, 'gateway_reference', v_payment.gateway_reference)
  );

  RETURN jsonb_build_object(
    'idempotent', false,
    'status', 'completed',
    'amount_kes', v_payment.amount_kes,
    'balance_kes', v_new_balance
  );
END;
$$;

-- 11b. Create Campaign & Hold Escrow Budget Atomically (Server-Recalculated Integer KES)
CREATE OR REPLACE FUNCTION public.create_campaign_with_escrow_hold(
  p_advertiser_id UUID,
  p_title VARCHAR,
  p_campaign_type VARCHAR,
  p_description TEXT,
  p_instructions TEXT,
  p_proof_requirements JSONB,
  p_reward_per_task_kes BIGINT,
  p_max_tasks INT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_target_options JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings public.platform_settings%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_rewards_subtotal BIGINT;
  v_platform_fee BIGINT;
  v_total_cost BIGINT;
  v_balance_after_hold BIGINT;
  v_balance_after_fee BIGINT;
  v_campaign_id UUID;
BEGIN
  IF p_reward_per_task_kes <= 0 OR p_max_tasks <= 0 THEN
    RAISE EXCEPTION 'Reward per task and max tasks must be positive integers.';
  END IF;

  SELECT * INTO v_settings FROM public.platform_settings WHERE id = 1;

  IF p_reward_per_task_kes < v_settings.min_reward_per_task_kes THEN
    RAISE EXCEPTION 'Minimum reward per task is KES %', v_settings.min_reward_per_task_kes;
  END IF;

  IF p_max_tasks < v_settings.min_campaign_tasks THEN
    RAISE EXCEPTION 'Minimum tasks per campaign is %', v_settings.min_campaign_tasks;
  END IF;

  -- Server-side integer math: reward * tasks + ceil(subtotal * fee_percent / 100)
  v_rewards_subtotal := p_reward_per_task_kes * p_max_tasks;
  v_platform_fee := CEIL((v_rewards_subtotal * v_settings.platform_fee_percent)::NUMERIC / 100.0)::BIGINT;
  v_total_cost := v_rewards_subtotal + v_platform_fee;

  -- Lock advertiser wallet row
  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE advertiser_id = p_advertiser_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Advertiser wallet not found';
  END IF;

  IF v_wallet.balance_kes < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Required: KES %, Available: KES %', v_total_cost, v_wallet.balance_kes;
  END IF;

  v_balance_after_hold := v_wallet.balance_kes - v_rewards_subtotal;
  v_balance_after_fee := v_balance_after_hold - v_platform_fee;

  -- Deduct total cost from available balance and place rewards subtotal in escrow (held_kes)
  UPDATE public.wallets
  SET balance_kes = v_balance_after_fee,
      held_kes = held_kes + v_rewards_subtotal,
      total_spent_kes = total_spent_kes + v_platform_fee,
      updated_at = NOW()
  WHERE id = v_wallet.id;

  -- Create campaign in pending_approval status
  INSERT INTO public.campaigns (
    advertiser_id, title, category_id, campaign_type, description, instructions,
    proof_requirements, total_budget, allocated_funds, bounty_reward, target_reviews,
    reward_per_task_kes, platform_fee_kes, total_budget_kes, remaining_budget_kes,
    max_tasks, completed_tasks, is_sponsored, status, start_date, end_date, target_options
  ) VALUES (
    p_advertiser_id, p_title, p_campaign_type, p_campaign_type, p_description, p_instructions,
    COALESCE(p_proof_requirements, '{}'::jsonb), v_total_cost, v_rewards_subtotal, p_reward_per_task_kes, p_max_tasks,
    p_reward_per_task_kes, v_platform_fee, v_total_cost, v_rewards_subtotal,
    p_max_tasks, 0, TRUE, 'pending_approval', COALESCE(p_start_date, NOW()), p_end_date, COALESCE(p_target_options, '{}'::jsonb)
  ) RETURNING id INTO v_campaign_id;

  -- Append ledger row 1: Campaign escrow hold
  INSERT INTO public.wallet_transactions (
    wallet_id, advertiser_id, profile_id, tx_type, amount_kes, direction,
    balance_before_kes, balance_after_kes, campaign_id, reference_id, description
  ) VALUES (
    v_wallet.id, p_advertiser_id, v_wallet.profile_id, 'campaign_hold',
    v_rewards_subtotal, 'debit', v_wallet.balance_kes, v_balance_after_hold,
    v_campaign_id, 'HOLD-' || v_campaign_id::text,
    'Campaign escrow hold for "' || p_title || '" (' || p_max_tasks || ' tasks × KES ' || p_reward_per_task_kes || ')'
  );

  -- Append ledger row 2: Platform fee
  IF v_platform_fee > 0 THEN
    INSERT INTO public.wallet_transactions (
      wallet_id, advertiser_id, profile_id, tx_type, amount_kes, direction,
      balance_before_kes, balance_after_kes, campaign_id, reference_id, description
    ) VALUES (
      v_wallet.id, p_advertiser_id, v_wallet.profile_id, 'fee',
      v_platform_fee, 'debit', v_balance_after_hold, v_balance_after_fee,
      v_campaign_id, 'FEE-' || v_campaign_id::text,
      'Earnora platform fee (' || v_settings.platform_fee_percent || '%) for "' || p_title || '"'
    );
  END IF;

  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_type, target_id, details)
  VALUES (
    v_wallet.profile_id, 'advertiser', 'CAMPAIGN_CREATED_AND_FUNDED', 'campaign', v_campaign_id::text,
    jsonb_build_object(
      'rewards_subtotal_kes', v_rewards_subtotal,
      'platform_fee_kes', v_platform_fee,
      'total_cost_kes', v_total_cost
    )
  );

  RETURN jsonb_build_object(
    'campaign_id', v_campaign_id,
    'rewards_subtotal_kes', v_rewards_subtotal,
    'platform_fee_kes', v_platform_fee,
    'total_budget_kes', v_total_cost,
    'wallet_balance_kes', v_balance_after_fee
  );
END;
$$;

-- 11c. Approve Submission & Credit User Available Balance Atomically
CREATE OR REPLACE FUNCTION public.approve_campaign_submission_atomic(
  p_submission_id UUID,
  p_reviewer_profile_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub public.campaign_submissions%ROWTYPE;
  v_camp public.campaigns%ROWTYPE;
  v_adv_wallet public.wallets%ROWTYPE;
  v_user_wallet public.wallets%ROWTYPE;
  v_new_completed INT;
  v_new_remaining BIGINT;
  v_new_camp_status VARCHAR(30);
BEGIN
  -- Lock submission row to prevent double-approval
  SELECT * INTO v_sub
  FROM public.campaign_submissions
  WHERE id = p_submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission % not found', p_submission_id;
  END IF;

  IF v_sub.status <> 'pending' THEN
    RAISE EXCEPTION 'Submission % is already %', p_submission_id, v_sub.status;
  END IF;

  -- Lock campaign row
  SELECT * INTO v_camp
  FROM public.campaigns
  WHERE id = v_sub.campaign_id
  FOR UPDATE;

  IF v_camp.completed_tasks >= v_camp.max_tasks THEN
    RAISE EXCEPTION 'Campaign % has already reached max tasks (%)', v_camp.id, v_camp.max_tasks;
  END IF;

  IF v_camp.remaining_budget_kes < v_camp.reward_per_task_kes THEN
    RAISE EXCEPTION 'Campaign % has insufficient remaining escrow budget', v_camp.id;
  END IF;

  -- Lock advertiser wallet row
  SELECT * INTO v_adv_wallet
  FROM public.wallets
  WHERE advertiser_id = v_camp.advertiser_id
  FOR UPDATE;

  IF v_adv_wallet.held_kes < v_camp.reward_per_task_kes THEN
    RAISE EXCEPTION 'Advertiser escrow held_kes insufficient';
  END IF;

  -- Release from advertiser held_kes into total_spent_kes
  UPDATE public.wallets
  SET held_kes = held_kes - v_camp.reward_per_task_kes,
      total_spent_kes = total_spent_kes + v_camp.reward_per_task_kes,
      updated_at = NOW()
  WHERE id = v_adv_wallet.id;

  -- Ensure user wallet exists and lock it
  INSERT INTO public.wallets (profile_id, available_balance, pending_balance, total_earned, total_withdrawn)
  VALUES (v_sub.user_profile_id, 0, 0, 0, 0)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT * INTO v_user_wallet
  FROM public.wallets
  WHERE profile_id = v_sub.user_profile_id
  FOR UPDATE;

  -- Credit user available balance
  UPDATE public.wallets
  SET available_balance = available_balance + v_camp.reward_per_task_kes,
      pending_balance = GREATEST(0, pending_balance - v_camp.reward_per_task_kes),
      total_earned = total_earned + v_camp.reward_per_task_kes,
      balance_kes = balance_kes + v_camp.reward_per_task_kes,
      updated_at = NOW()
  WHERE id = v_user_wallet.id;

  -- Record in user wallet_ledger
  INSERT INTO public.wallet_ledger (
    wallet_id, transaction_type, amount, balance_before, balance_after, status, reference_id, notes
  ) VALUES (
    v_user_wallet.id, 'reward_earned', v_camp.reward_per_task_kes,
    v_user_wallet.available_balance, v_user_wallet.available_balance + v_camp.reward_per_task_kes,
    'completed', 'SUB-' || v_sub.id::text,
    'Sponsored task reward: ' || v_camp.title
  );

  -- Record in append-only wallet_transactions
  INSERT INTO public.wallet_transactions (
    wallet_id, advertiser_id, profile_id, tx_type, amount_kes, direction,
    balance_before_kes, balance_after_kes, campaign_id, reference_id, description
  ) VALUES (
    v_user_wallet.id, v_camp.advertiser_id, v_sub.user_profile_id, 'user_payout',
    v_camp.reward_per_task_kes, 'credit',
    v_user_wallet.balance_kes, v_user_wallet.balance_kes + v_camp.reward_per_task_kes,
    v_camp.id, 'PAYOUT-' || v_sub.id::text,
    'Reward credited to user for approved task in "' || v_camp.title || '"'
  );

  -- Update campaign counters
  v_new_completed := v_camp.completed_tasks + 1;
  v_new_remaining := v_camp.remaining_budget_kes - v_camp.reward_per_task_kes;
  v_new_camp_status := CASE WHEN v_new_completed >= v_camp.max_tasks THEN 'completed' ELSE v_camp.status END;

  UPDATE public.campaigns
  SET completed_tasks = v_new_completed,
      approved_reviews = v_new_completed,
      remaining_budget_kes = v_new_remaining,
      status = v_new_camp_status,
      updated_at = NOW()
  WHERE id = v_camp.id;

  -- Update submission status
  UPDATE public.campaign_submissions
  SET status = 'approved',
      reviewer_notes = COALESCE(p_notes, reviewer_notes),
      reviewed_by = p_reviewer_profile_id,
      reviewed_at = NOW()
  WHERE id = v_sub.id;

  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (
    p_reviewer_profile_id, 'SUBMISSION_APPROVED_AND_PAID', 'campaign_submission', v_sub.id::text,
    jsonb_build_object('campaign_id', v_camp.id, 'user_profile_id', v_sub.user_profile_id, 'reward_kes', v_camp.reward_per_task_kes)
  );

  RETURN jsonb_build_object(
    'submission_id', v_sub.id,
    'status', 'approved',
    'reward_kes', v_camp.reward_per_task_kes,
    'campaign_completed_tasks', v_new_completed,
    'campaign_remaining_budget_kes', v_new_remaining
  );
END;
$$;

-- 11d. End or Reject Campaign & Refund Unused Escrow Budget Atomically
CREATE OR REPLACE FUNCTION public.end_campaign_and_refund_unused_budget(
  p_campaign_id UUID,
  p_actor_profile_id UUID,
  p_target_status VARCHAR DEFAULT 'completed',
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_camp public.campaigns%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_refund_kes BIGINT := 0;
  v_fee_refund_kes BIGINT := 0;
  v_new_balance BIGINT;
BEGIN
  IF p_target_status NOT IN ('completed', 'rejected') THEN
    RAISE EXCEPTION 'Target status must be completed or rejected';
  END IF;

  SELECT * INTO v_camp
  FROM public.campaigns
  WHERE id = p_campaign_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign % not found', p_campaign_id;
  END IF;

  IF v_camp.status IN ('completed', 'rejected') THEN
    RAISE EXCEPTION 'Campaign % is already in terminal state %', p_campaign_id, v_camp.status;
  END IF;

  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE advertiser_id = v_camp.advertiser_id
  FOR UPDATE;

  v_refund_kes := v_camp.remaining_budget_kes;

  -- If rejected by admin before any tasks completed, also refund platform fee
  IF p_target_status = 'rejected' AND v_camp.completed_tasks = 0 THEN
    v_fee_refund_kes := v_camp.platform_fee_kes;
  END IF;

  v_new_balance := v_wallet.balance_kes + v_refund_kes + v_fee_refund_kes;

  IF (v_refund_kes + v_fee_refund_kes) > 0 THEN
    UPDATE public.wallets
    SET balance_kes = v_new_balance,
        held_kes = GREATEST(0, held_kes - v_refund_kes),
        total_spent_kes = GREATEST(0, total_spent_kes - v_fee_refund_kes),
        updated_at = NOW()
    WHERE id = v_wallet.id;

    INSERT INTO public.wallet_transactions (
      wallet_id, advertiser_id, profile_id, tx_type, amount_kes, direction,
      balance_before_kes, balance_after_kes, campaign_id, reference_id, description
    ) VALUES (
      v_wallet.id, v_camp.advertiser_id, v_wallet.profile_id, 'refund',
      v_refund_kes + v_fee_refund_kes, 'credit',
      v_wallet.balance_kes, v_new_balance,
      v_camp.id, 'REFUND-' || v_camp.id::text,
      'Unused campaign budget refund for "' || v_camp.title || '"'
    );
  END IF;

  UPDATE public.campaigns
  SET status = p_target_status,
      remaining_budget_kes = 0,
      rejection_reason = COALESCE(p_reason, rejection_reason),
      updated_at = NOW()
  WHERE id = v_camp.id;

  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
  VALUES (
    p_actor_profile_id, 'CAMPAIGN_' || UPPER(p_target_status) || '_WITH_REFUND', 'campaign', v_camp.id::text,
    jsonb_build_object('refunded_kes', v_refund_kes + v_fee_refund_kes, 'reason', p_reason)
  );

  RETURN jsonb_build_object(
    'campaign_id', v_camp.id,
    'status', p_target_status,
    'refunded_kes', v_refund_kes + v_fee_refund_kes,
    'wallet_balance_kes', v_new_balance
  );
END;
$$;
