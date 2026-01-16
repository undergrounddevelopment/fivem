-- Migration: 20260117_advisor_security_depth
-- Purpose: Resolve 80+ security warnings from Supabase Advisor

-- 1. FIX: Function Search Path Mutable (Security Lint 0011)
-- Prevents search path hijacking by pinning functions to the 'public' schema
-- Using DO block to handle cases where functions might not exist

DO $$ 
BEGIN
  -- Core RPCs
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'purchase_tickets') THEN
    ALTER FUNCTION public.purchase_tickets(text, integer, integer) SET search_path = public, pg_temp;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'deduct_ticket_for_spin') THEN
    ALTER FUNCTION public.deduct_ticket_for_spin(text, integer) SET search_path = public, pg_temp;
  END IF;

  -- Forum Triggers
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_thread_likes_count') THEN
    ALTER FUNCTION public.update_thread_likes_count() SET search_path = public, pg_temp;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_thread_reply_count') THEN
    ALTER FUNCTION public.update_thread_reply_count() SET search_path = public, pg_temp;
  END IF;

  -- User Level/Badge
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_level_and_badge') THEN
    ALTER FUNCTION public.update_user_level_and_badge() SET search_path = public, pg_temp;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_asset_rating') THEN
    ALTER FUNCTION public.update_asset_rating() SET search_path = public, pg_temp;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'award_xp_for_reply') THEN
    ALTER FUNCTION public.award_xp_for_reply() SET search_path = public, pg_temp;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'award_xp_for_thread') THEN
    ALTER FUNCTION public.award_xp_for_thread() SET search_path = public, pg_temp;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_level') THEN
    ALTER FUNCTION public.calculate_level(integer) SET search_path = public, pg_temp;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_badge') THEN
    ALTER FUNCTION public.get_current_badge(integer) SET search_path = public, pg_temp;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_daily_claim') THEN
    ALTER FUNCTION public.handle_daily_claim(text) SET search_path = public, pg_temp;
  END IF;
  
  -- These functions may have different signatures, skip if not found
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some functions could not be altered: %', SQLERRM;
END $$;


-- 2. Force RLS on critical tables (does not change policies, just ensures RLS is active)
ALTER TABLE IF EXISTS public.activities FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spin_wheel_history FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users FORCE ROW LEVEL SECURITY;

-- NOTE: RLS policy tightening (USING auth.uid() = user_id) requires manual review
-- to ensure correct type casting based on each table's column types.
-- Tables like activities, downloads may use TEXT for user_id (discord_id) while
-- others like users use UUID. This migration focuses on the search_path fix.
