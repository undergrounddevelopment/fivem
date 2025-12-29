-- ============================================
-- ADD SPIN WHEEL TICKETS TABLE
-- Migration untuk menambahkan table yang hilang
-- ============================================

-- Create spin_wheel_tickets table
CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  ticket_type TEXT DEFAULT 'daily' CHECK (ticket_type IN ('daily', 'purchase', 'reward', 'admin')),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spin_tickets_user ON spin_wheel_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_unused ON spin_wheel_tickets(user_id, is_used) 
  WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_spin_tickets_created ON spin_wheel_tickets(created_at DESC);

-- Enable RLS
ALTER TABLE spin_wheel_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own tickets" ON spin_wheel_tickets;
DROP POLICY IF EXISTS "Admins can manage tickets" ON spin_wheel_tickets;

CREATE POLICY "Users can view own tickets" ON spin_wheel_tickets 
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE POLICY "Admins can manage tickets" ON spin_wheel_tickets 
  FOR ALL USING (is_admin());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON spin_wheel_tickets TO authenticated;

-- Verification
SELECT 
  '✅ spin_wheel_tickets table created successfully!' as status,
  COUNT(*) as ticket_count 
FROM spin_wheel_tickets;
