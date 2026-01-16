-- Add claim_status and claimed_at to spin_wheel_history
ALTER TABLE public.spin_wheel_history 
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed',
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- Update existing records: Coins/Tickets are auto-awarded, Items are unclaimed
UPDATE public.spin_wheel_history h
SET claim_status = 'auto_awarded'
FROM public.spin_wheel_prizes p
WHERE h.prize_id = p.id AND p.type IN ('coins', 'coin', 'ticket');

UPDATE public.spin_wheel_history h
SET claim_status = 'unclaimed'
FROM public.spin_wheel_prizes p
WHERE h.prize_id = p.id AND (p.type = 'item' OR p.type IS NULL);

-- Ensure prize columns are consistent
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spin_wheel_history' AND column_name='prize_name') THEN
        ALTER TABLE public.spin_wheel_history ADD COLUMN prize_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spin_wheel_history' AND column_name='prize_value') THEN
        ALTER TABLE public.spin_wheel_history ADD COLUMN prize_value INTEGER;
    END IF;
END $$;
