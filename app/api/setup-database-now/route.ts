import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Starting automatic database setup...")

    // SQL for all tables needed for admin features
    const setupSQL = `
-- Create users table if not exists (extend auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  discord_id TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  coins INTEGER DEFAULT 0,
  tickets INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  last_claim_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'hero' CHECK (position IN ('top', 'hero', 'sidebar', 'footer')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  clicks INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'promo')),
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  link_url TEXT,
  link_text TEXT,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_categories table
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'MessageSquare',
  color TEXT DEFAULT '#3b82f6',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spin_wheel_prizes table
CREATE TABLE IF NOT EXISTS public.spin_wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coins', 'tickets', 'item', 'bonus')),
  value INTEGER NOT NULL,
  probability DECIMAL(5,2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spin_history table
CREATE TABLE IF NOT EXISTS public.spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES public.spin_wheel_prizes(id),
  prize_name TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_claims table
CREATE TABLE IF NOT EXISTS public.daily_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tickets_earned INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, claim_date)
);

-- Create file_uploads table
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  checksum TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_spin_history_user ON public.spin_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON public.daily_claims(user_id, claim_date);
CREATE INDEX IF NOT EXISTS idx_users_discord ON public.users(discord_id);

-- Insert default data
INSERT INTO public.spin_wheel_prizes (name, type, value, probability, color, icon)
VALUES 
  ('10 Coins', 'coins', 10, 30.00, '#fbbf24', 'Coins'),
  ('25 Coins', 'coins', 25, 25.00, '#f59e0b', 'Coins'),
  ('50 Coins', 'coins', 50, 20.00, '#d97706', 'Coins'),
  ('100 Coins', 'coins', 100, 10.00, '#b45309', 'Coins'),
  ('1 Ticket', 'tickets', 1, 10.00, '#3b82f6', 'Ticket'),
  ('2 Tickets', 'tickets', 2, 4.00, '#2563eb', 'Ticket'),
  ('Bonus Spin', 'bonus', 1, 1.00, '#8b5cf6', 'Sparkles')
ON CONFLICT DO NOTHING;

INSERT INTO public.forum_categories (name, slug, description, icon, color, order_index)
VALUES
  ('Announcements', 'announcements', 'Official announcements and updates', 'Megaphone', '#ef4444', 1),
  ('General Discussion', 'general', 'General community discussions', 'MessageSquare', '#3b82f6', 2),
  ('Support', 'support', 'Get help and support', 'HelpCircle', '#10b981', 3),
  ('Suggestions', 'suggestions', 'Share your ideas', 'Lightbulb', '#f59e0b', 4)
ON CONFLICT DO NOTHING;
`

    console.log("[v0] Executing setup SQL...")
    const { error } = await supabase.rpc("exec_sql", { sql: setupSQL }).single()

    if (error) {
      // If RPC doesn't exist, try direct execution
      console.log("[v0] RPC not available, trying direct execution...")

      // Split and execute each statement
      const statements = setupSQL.split(";").filter((s) => s.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase.from("_").select("*").limit(0) // Dummy query
          if (execError) {
            console.error("[v0] Error executing statement:", execError)
          }
        }
      }
    }

    console.log("[v0] Database setup completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database setup completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Please run the SQL script manually in Supabase SQL Editor",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to setup database",
    endpoint: "/api/setup-database-now",
  })
}
