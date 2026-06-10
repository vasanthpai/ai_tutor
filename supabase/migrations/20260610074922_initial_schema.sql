-- ============================================================
-- MIGRATION: initial_schema
-- Creates the first 3 core tables for AI Interview Mentor
-- ============================================================


-- ============================================================
-- TABLE 1: profiles
-- Extends Supabase's built-in auth.users table.
-- auth.users handles email, password, OAuth — we can't modify it.
-- This table stores everything extra we need about a user.
-- ============================================================
CREATE TABLE public.profiles (
  -- Links to Supabase auth. When auth user is deleted, this row is too.
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,

  -- Subscription tier — controls feature access
  tier          TEXT NOT NULL DEFAULT 'free'
                CHECK (tier IN ('free', 'pro', 'sprint')),

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active   TIMESTAMPTZ
);

-- Index for filtering users by tier (e.g. find all pro users)
CREATE INDEX idx_profiles_tier ON public.profiles(tier);

-- Index for sorting/filtering by last active (e.g. churn detection)
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active);


-- ============================================================
-- TABLE 2: user_profiles
-- Stores the interview preparation context for each user.
-- Separate from profiles because this data changes often
-- and has a different purpose (mentor context vs account info).
-- ============================================================
CREATE TABLE public.user_profiles (
  -- One row per user, linked to profiles
  user_id             UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- What role are they preparing for?
  target_role         TEXT NOT NULL DEFAULT 'Software Engineer',

  -- Years of experience affects question difficulty selection
  experience_years    SMALLINT CHECK (experience_years BETWEEN 0 AND 50),

  -- Current and target companies (arrays — one user can have multiple)
  current_company     TEXT,
  target_companies    TEXT[] DEFAULT '{}',

  -- If they have an upcoming interview, we can set urgency mode
  interview_date      DATE,

  -- Self-reported strengths and weaknesses from onboarding
  -- Stored as arrays of skill names e.g. ['DSA', 'System Design']
  declared_strengths  TEXT[] DEFAULT '{}',
  declared_weaknesses TEXT[] DEFAULT '{}',

  -- Flexible JSONB field for anything else we learn about the user
  -- e.g. {"preferred_language": "JavaScript", "interview_style": "whiteboard"}
  metadata            JSONB NOT NULL DEFAULT '{}',

  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- TABLE 3: sessions
-- Each row is one practice session a user completed.
-- A session = one sitting of questions and answers.
-- ============================================================
CREATE TABLE public.sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which user this session belongs to
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Type of session — affects how it's scored and displayed
  session_type    TEXT NOT NULL DEFAULT 'practice'
                  CHECK (session_type IN ('practice', 'assessment', 'mock_interview')),

  -- Status tracks whether session is in progress or completed
  status          TEXT NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Scores — NULL until session is completed
  overall_score   NUMERIC(5, 2) CHECK (overall_score BETWEEN 0 AND 100),

  -- AI-generated summary shown to user after session
  ai_summary      TEXT,

  -- How long the session took in seconds
  duration_secs   INTEGER,

  -- How many questions were asked
  turn_count      SMALLINT NOT NULL DEFAULT 0,

  -- Timestamps
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ
);

-- Most common query: "get all sessions for this user, newest first"
CREATE INDEX idx_sessions_user_date ON public.sessions(user_id, started_at DESC);

-- For analytics: "how many sessions of each type happened this week"
CREATE INDEX idx_sessions_type ON public.sessions(session_type);


-- ============================================================
-- AUTO-UPDATE updated_at TIMESTAMP
-- This trigger automatically sets updated_at = now() whenever
-- a row is updated. Without this, updated_at would be stale.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- This is the most important security feature in Supabase.
-- Without RLS, any logged-in user can read ALL other users' data.
-- With RLS, database enforces that users only see their own rows.
-- ============================================================

-- Enable RLS on all three tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER_PROFILES policies
CREATE POLICY "users can view own user_profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own user_profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own user_profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- SESSIONS policies
CREATE POLICY "users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- When a new user signs up via Supabase Auth, this trigger
-- automatically creates their profile row.
-- Without this, you'd have to manually create it in code
-- every time someone signs up — easy to forget and cause bugs.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();