-- 1. Clear existing placeholder prizes
TRUNCATE TABLE public.spin_wheel_prizes CASCADE;

-- 2. Insert 10 "Real" Elite prizes
INSERT INTO public.spin_wheel_prizes (name, type, value, probability, color, image_url, is_active) VALUES
('500 Coins', 'coins', 500, 30, '#3b82f6', 'https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png', true),
('1,000 Coins', 'coins', 1000, 20, '#60a5fa', 'https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png', true),
('2,500 Coins', 'coins', 2500, 10, '#93c5fd', 'https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png', true),
('5,000 Coins', 'coins', 5000, 5, '#bfdbfe', 'https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png', true),
('10,000 Coins', 'coins', 10000, 2, '#dbeafe', 'https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png', true),
('1 Spin Ticket', 'ticket', 1, 15, '#a78bfa', 'https://assets.codepen.io/3685267/wheel-of-fortune-aetkeerk.png', true),
('5 Spin Tickets', 'ticket', 5, 8, '#c4b5fd', 'https://assets.codepen.io/3685267/wheel-of-fortune-aetkeerk.png', true),
('10 Spin Tickets', 'ticket', 10, 5, '#ddd6fe', 'https://assets.codepen.io/3685267/wheel-of-fortune-aetkeerk.png', true),
('Boost FiveM License', 'item', 0, 1, '#f59e0b', 'https://assets.codepen.io/3685267/wheel-of-fortune-fxjdpdcn.png', true),
('Mystery Gift Box', 'item', 0, 4, '#10b981', 'https://assets.codepen.io/3685267/wheel-of-fortune-lboxprxz.png', true);

-- Update configuration to standard prices if needed
INSERT INTO public.spin_settings (key, value) 
VALUES ('ticket_cost', '1'), ('is_enabled', 'true'), ('ticket_price_coins', '500')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
