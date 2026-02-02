-- ===========================================
-- LA MAILLE - Supabase Schema
-- Run this in Supabase SQL Editor
-- ===========================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(REPLACE(NEW.email, '@', '_'))
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- ===========================================
-- SAVED PATTERNS TABLE
-- ===========================================

-- Create saved_patterns table
CREATE TABLE IF NOT EXISTS public.saved_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_id TEXT NOT NULL,
  name TEXT,
  thumbnail_url TEXT,
  pattern_data JSONB NOT NULL,
  garment_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.saved_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own patterns
CREATE POLICY "Users can view own patterns" ON public.saved_patterns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns" ON public.saved_patterns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns" ON public.saved_patterns
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns" ON public.saved_patterns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS saved_patterns_user_id_idx ON public.saved_patterns (user_id);
CREATE INDEX IF NOT EXISTS saved_patterns_created_at_idx ON public.saved_patterns (created_at DESC);

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS on_saved_pattern_updated ON public.saved_patterns;
CREATE TRIGGER on_saved_pattern_updated
  BEFORE UPDATE ON public.saved_patterns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
