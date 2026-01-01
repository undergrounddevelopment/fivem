-- Create missing tables for full access
-- Run this with service role permissions

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    discord_username TEXT,
    discord_avatar TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    favorite_cars TEXT[],
    settings JSONB DEFAULT '{}',
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spin_wheel table
CREATE TABLE IF NOT EXISTS public.spin_wheel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_type TEXT NOT NULL,
    prize_value INTEGER NOT NULL,
    spin_cost INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_won BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE
);

-- Create coins_transactions table
CREATE TABLE IF NOT EXISTS public.coins_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'admin', 'refund')),
    source TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    balance_after INTEGER NOT NULL
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('coins', 'spin_ticket', 'download', 'special')),
    value INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    requirements JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table (for blog/announcements)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Settings (admin only)
CREATE POLICY "Admins can view settings" ON public.settings FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));
CREATE POLICY "Admins can insert settings" ON public.settings FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Spin wheel
CREATE POLICY "Users can view own spins" ON public.spin_wheel FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spins" ON public.spin_wheel FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coins transactions
CREATE POLICY "Users can view own transactions" ON public.coins_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.coins_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rewards (public read, admin write)
CREATE POLICY "Everyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Admin logs (admin only)
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Posts
CREATE POLICY "Everyone can view published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS coins_transactions_user_id_idx ON public.coins_transactions(user_id);
CREATE INDEX IF NOT EXISTS coins_transactions_created_at_idx ON public.coins_transactions(created_at);
CREATE INDEX IF NOT EXISTS spin_wheel_user_id_idx ON public.spin_wheel(user_id);
CREATE INDEX IF NOT EXISTS spin_wheel_created_at_idx ON public.spin_wheel(created_at);
CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON public.admin_logs(created_at);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts(published_at);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('site_name', '"FiveM Tools"', 'Site name'),
('site_description', '"Best FiveM tools and resources"', 'Site description'),
('coins_per_download', '10', 'Coins awarded per download'),
('spin_cost', '10', 'Cost per spin in coins'),
('daily_bonus_coins', '50', 'Daily login bonus coins'),
('max_downloads_per_day', '5', 'Maximum downloads per free user'),
('enable_registration', 'true', 'Allow new user registration')
ON CONFLICT (key) DO NOTHING;

-- Insert default rewards
INSERT INTO public.rewards (name, description, type, value, cost, is_active) VALUES
('100 Coins', 'Get 100 coins for your account', 'coins', 100, 500, true),
('Spin Ticket x3', 'Get 3 free spin tickets', 'spin_ticket', 3, 300, true),
('Extra Download', 'Get 1 extra download slot', 'download', 1, 200, true),
('VIP Access', '1 week VIP access', 'special', 7, 1000, true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
