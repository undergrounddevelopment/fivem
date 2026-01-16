-- Ensure spin_settings table exists and is standardized
CREATE TABLE IF NOT EXISTS public.spin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default settings if they don't exist
INSERT INTO public.spin_settings (key, value) VALUES
('ticket_cost', '1'),
('is_enabled', 'true'),
('ticket_price_coins', '500')
ON CONFLICT (key) DO NOTHING;

-- Enable Realtime for spin_settings
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'spin_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_settings;
    END IF;
END $$;
