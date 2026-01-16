-- Migration: 20260117_fix_users_rls
-- Purpose: Unblock 'messages' RLS policy by allowing authenticated users to read 'users' table.
-- The 'messages' policy uses a subquery to 'users' to map auth.uid() (UUID) to discord_id.
-- Since we enforced RLS on 'users' without a SELECT policy, this subquery was failing.

-- 1. Enable RLS on users (already done, but safe to repeat or ensure)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Allow Authenticated users to view all user profiles (needed for lookups and message mapping)
-- Using IF NOT EXISTS logic via DO block to prevent errors if policy partly exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Authenticated users can view profiles'
    ) THEN
        CREATE POLICY "Authenticated users can view profiles" 
        ON public.users 
        FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;
END $$;

-- 3. Also allow reading own profile for updates (service role handles strictly private updates usually)
-- But ensuring a user can read their own row is critical.
-- The above "USING (true)" covers this, but being explicit is fine.

-- 4. Re-verify messages policy (Ensure it covers both directions)
-- We'll assume the previous migration created the messages policy correctly.
-- But if it failed due to some reason, we can reinforce it here if needed.
-- For now, unblocking 'users' read access is the priority.
