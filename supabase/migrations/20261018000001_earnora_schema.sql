-- ============================================================================
-- Earnora Relational Database Schema & Row Level Security (PostgreSQL / Supabase)
-- Target Platform: Kenya & East African Regional Expansion
-- Safe to re-run. Idempotent.
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 2: TABLES & SAFE ADDITIVE COLUMNS / CONSTRAINTS
-- ============================================================================

-- 2.1 Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150),
    country VARCHAR(50) NOT NULL DEFAULT 'Kenya',
    calling_code VARCHAR(10) NOT NULL DEFAULT '+254',
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'advertiser', 'business', 'admin', 'moderator')),
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by VARCHAR(50) DEFAULT 'Earnora',
    streak_days INT NOT NULL DEFAULT 1,
    last_checkin_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure email column and updated role CHECK constraint exist on pre-existing profiles table
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email VARCHAR(150);

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

-- 2.2 OTP Verification Records Table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(30) NOT NULL CHECK (purpose IN ('registration', 'login', 'reset_password', 'withdrawal')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    resend_available_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Businesses & Brand Accounts
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(100),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(30),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Review Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    total_budget NUMERIC(12,2) NOT NULL CHECK (total_budget >= 0),
    allocated_funds NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (allocated_funds <= total_budget),
    bounty_reward NUMERIC(10,2) NOT NULL CHECK (bounty_reward > 0),
    target_reviews INT NOT NULL CHECK (target_reviews > 0),
    approved_reviews INT NOT NULL DEFAULT 0,
    is_sponsored BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Review Submissions Table (Enforces 1 review per user per item)
CREATE TABLE IF NOT EXISTS public.review_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    task_id VARCHAR(50) NOT NULL,
    reviewer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    headline VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    word_count INT NOT NULL,
    pros TEXT NOT NULL,
    cons TEXT NOT NULL,
    photo_url TEXT,
    photo_attestation BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_score NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'submitted', 'pending_review', 'approved', 'rejected', 'under_appeal')),
    rejection_reason TEXT,
    reward_amount NUMERIC(10,2) NOT NULL CHECK (reward_amount >= 0),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraint: One review per user per item / task
    CONSTRAINT unique_user_task_review UNIQUE(reviewer_profile_id, task_id)
);

-- 2.6 Wallets & Immutable Financial Ledger
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0),
    pending_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (pending_balance >= 0),
    total_earned NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_earned >= 0),
    total_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_withdrawn >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('reward_earned', 'ad_watch_reward', 'referral_bonus', 'streak_bonus', 'mpesa_withdrawal', 'withdrawal_refund', 'campaign_funding')),
    amount NUMERIC(10,2) NOT NULL,
    balance_before NUMERIC(12,2) NOT NULL,
    balance_after NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'reversed')),
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'wallet_ledger'
          AND constraint_name = 'wallet_ledger_transaction_type_check'
    ) THEN
        ALTER TABLE public.wallet_ledger DROP CONSTRAINT wallet_ledger_transaction_type_check;
    END IF;

    ALTER TABLE public.wallet_ledger
        ADD CONSTRAINT wallet_ledger_transaction_type_check
        CHECK (transaction_type IN ('reward_earned', 'ad_watch_reward', 'referral_bonus', 'streak_bonus', 'mpesa_withdrawal', 'withdrawal_refund', 'campaign_funding'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2.7 Daraja M-Pesa B2C Payout Logs
CREATE TABLE IF NOT EXISTS public.mpesa_disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    conversation_id VARCHAR(100) UNIQUE,
    originator_conversation_id VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 100),
    result_code INT,
    result_desc TEXT,
    mpesa_receipt_number VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'reversed')),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2.8 Fraud Logs & Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_verifications(phone_number, is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_profile_id ON public.wallets(profile_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet_id ON public.wallet_ledger(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_submissions_reviewer ON public.review_submissions(reviewer_profile_id, created_at DESC);

-- ============================================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
-- Server-only tables (RLS enabled with no client policies so only service_role / SECURITY DEFINER functions access them):
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) POLICIES (IDEMPOTENT)
-- Money movements stay strictly server-side (no client INSERT/UPDATE/DELETE on wallets, wallet_ledger, or mpesa_disbursements).
-- ============================================================================

-- 5.1 Profiles: Users can read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 5.2 Wallets: Users can read their own wallet (read-only)
DROP POLICY IF EXISTS "Users can read their own wallet" ON public.wallets;
CREATE POLICY "Users can read their own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- 5.3 Wallet Ledger: Users can SELECT their own ledger rows matched through wallet -> profile -> auth.uid() (read-only)
DROP POLICY IF EXISTS "Users can read their own wallet ledger" ON public.wallet_ledger;
CREATE POLICY "Users can read their own wallet ledger"
ON public.wallet_ledger FOR SELECT
USING (
    auth.uid() = (
        SELECT p.user_id
        FROM public.wallets w
        JOIN public.profiles p ON p.id = w.profile_id
        WHERE w.id = wallet_id
    )
);

-- 5.4 Review Submissions: Users can SELECT their own review submissions via reviewer_profile_id (read-only)
DROP POLICY IF EXISTS "Users can read their own review submissions" ON public.review_submissions;
CREATE POLICY "Users can read their own review submissions"
ON public.review_submissions FOR SELECT
USING (
    auth.uid() = (
        SELECT user_id
        FROM public.profiles
        WHERE id = reviewer_profile_id
    )
);

-- ============================================================================
-- SECTION 6: FUNCTIONS & TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
