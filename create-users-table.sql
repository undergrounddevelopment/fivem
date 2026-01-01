-- Create users table first
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discord_id TEXT UNIQUE,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar TEXT,
    membership TEXT DEFAULT 'free',
    coins INTEGER DEFAULT 100,
    reputation INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE,
    spin_tickets INTEGER DEFAULT 0,
    role TEXT DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    bio TEXT
);

-- Create other essential tables
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.spin_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_type TEXT NOT NULL,
    prize_value INTEGER NOT NULL,
    spin_cost INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    asset_id UUID,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Everyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY "Users can view own profile details" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile details" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY "Users can view own spin history" ON public.spin_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spin history" ON public.spin_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own downloads" ON public.downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own downloads" ON public.downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
