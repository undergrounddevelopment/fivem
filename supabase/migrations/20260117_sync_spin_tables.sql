-- Syncing Database names with Code (fixing prefix mismatch)

-- 1. spin_wheel_prizes
CREATE TABLE IF NOT EXISTS public.spin_wheel_prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'item', 'coins', 'ticket', 'empty'
    value INTEGER DEFAULT 0,
    image_url TEXT,
    probability DECIMAL DEFAULT 10,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed if empty
INSERT INTO public.spin_wheel_prizes (name, type, value, probability, color)
SELECT title, type, value, drop_rate::decimal, color 
FROM public.spin_prizes
ON CONFLICT DO NOTHING;

-- 2. spin_wheel_history
CREATE TABLE IF NOT EXISTS public.spin_wheel_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES public.spin_wheel_prizes(id) ON DELETE SET NULL,
    prize_name TEXT,
    prize_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. spin_wheel_tickets (if doesn't exist)
CREATE TABLE IF NOT EXISTS public.spin_wheel_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    tickets INTEGER DEFAULT 0,
    last_earned TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Realtime for these new names
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'spin_wheel_prizes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_prizes;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'spin_wheel_history'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_history;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'spin_wheel_tickets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_wheel_tickets;
    END IF;
END $$;
