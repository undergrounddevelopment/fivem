-- Add tickets column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tickets INTEGER DEFAULT 0;

-- Create spin_prizes table
CREATE TABLE IF NOT EXISTS public.spin_prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('item', 'coin', 'ticket', 'empty')) NOT NULL,
    value INTEGER DEFAULT 0, -- Amount for coins/tickets, or 0 for items
    image_url TEXT,
    drop_rate FLOAT NOT NULL DEFAULT 0, -- Percentage 0-100
    color TEXT DEFAULT '#343a46c2',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create spin_history table
CREATE TABLE IF NOT EXISTS public.spin_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES public.spin_prizes(id) ON DELETE SET NULL,
    prize_snapshot JSONB, -- Store the prize details at time of winning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial data based on the user's design
INSERT INTO public.spin_prizes (title, type, value, image_url, drop_rate, color) VALUES
('Crow Skull', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-lmvdrrhl.png', 24, '#343a46c2'),
('Oblivion Potion', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-lboxprxz.png', 15, '#343a46c2'),
('Poison Cauldron', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-gydimcwp.png', 5, '#343a46c2'),
('Fly Agaric', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-csqvlgov.png', 50, '#343a46c2'),
('Witch''s Cap', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-nxffhdul.png', 1, '#343a46c2'),
('Flying Broom', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-xiquzhpo.png', 80, '#343a46c2'),
-- Add more slots to make 10 or 12 as per wheel design, duplicating common items for better visuals
('Crow Skull', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-lmvdrrhl.png', 24, '#343a46c2'),
('Oblivion Potion', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-lboxprxz.png', 15, '#343a46c2'),
('Poison Cauldron', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-gydimcwp.png', 5, '#343a46c2'),
('Fly Agaric', 'item', 0, 'https://assets.codepen.io/3685267/wheel-of-fortune-csqvlgov.png', 50, '#343a46c2');

-- Normalize drop rates to ensure they sum up correctly in logic (handled in API) or just leave as weights
