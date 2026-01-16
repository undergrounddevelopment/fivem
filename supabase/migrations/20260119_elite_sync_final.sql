--;
-- 1. Core Settings Management
CREATE TABLE IF NOT EXISTS public.spin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.spin_settings (key, value) VALUES
('ticket_cost', '1'),
('is_enabled', 'true'),
('ticket_price_coins', '500')
ON CONFLICT (key) DO NOTHING;

--;
-- 2. Prize Management
CREATE TABLE IF NOT EXISTS public.spin_wheel_prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'item', 'coins', 'ticket', 'license'
    value INTEGER DEFAULT 0,
    image_url TEXT,
    probability DECIMAL DEFAULT 10,
    color TEXT DEFAULT '#343a46c2',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--;
-- 3. Winner History & Inventory
CREATE TABLE IF NOT EXISTS public.spin_wheel_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES public.spin_wheel_prizes(id) ON DELETE SET NULL,
    prize_name TEXT,
    prize_value INTEGER,
    claim_status TEXT DEFAULT 'unclaimed', -- 'auto_awarded', 'unclaimed', 'pending', 'claimed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--;
-- 4. Ticket Synchronization
CREATE TABLE IF NOT EXISTS public.spin_wheel_tickets (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    tickets INTEGER DEFAULT 0,
    last_earned TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--;
-- 5. Elite Privilege Management (Eligible Spins)
CREATE TABLE IF NOT EXISTS public.spin_wheel_eligible_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    spins_remaining INTEGER DEFAULT 0,
    reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    granted_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--;
-- 6. Advanced Force Win Control
CREATE TABLE IF NOT EXISTS public.spin_wheel_force_wins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Discord ID for better lookup
    prize_id UUID REFERENCES public.spin_wheel_prizes(id) ON DELETE CASCADE,
    max_uses INTEGER,
    use_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Global Search Index for Performance
CREATE INDEX IF NOT EXISTS idx_spin_history_user ON public.spin_wheel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_force_wins_user ON public.spin_wheel_force_wins(user_id);

-- 8. Enable Realtime for EVERYTHING
DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_settings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_prizes;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_history;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_tickets;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_eligible_users;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_force_wins;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 9. Security Policies
ALTER TABLE public.spin_wheel_eligible_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_force_wins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manage eligible" ON public.spin_wheel_eligible_users;
CREATE POLICY "Service role manage eligible" ON public.spin_wheel_eligible_users TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage force wins" ON public.spin_wheel_force_wins;
CREATE POLICY "Service role manage force wins" ON public.spin_wheel_force_wins TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Settings are public readable" ON public.spin_settings;
CREATE POLICY "Settings are public readable" ON public.spin_settings FOR SELECT USING (true);
