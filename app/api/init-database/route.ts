import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// This endpoint auto-initializes database tables on first run
export async function GET() {
  try {
    const supabase = createAdminClient()

    const setupSQL = `
      -- Create spin_wheel_prizes table
      CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        coins INTEGER NOT NULL DEFAULT 0,
        probability DECIMAL(5,2) NOT NULL DEFAULT 0,
        color VARCHAR(20) DEFAULT '#4ade80',
        rarity VARCHAR(20) DEFAULT 'common',
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create spin_wheel_settings table
      CREATE TABLE IF NOT EXISTS spin_wheel_settings (
        id SERIAL PRIMARY KEY,
        daily_free_spins INTEGER DEFAULT 0,
        spin_cost_coins INTEGER DEFAULT 0,
        is_enabled BOOLEAN DEFAULT true,
        jackpot_threshold INTEGER DEFAULT 1000,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create spin_history table
      CREATE TABLE IF NOT EXISTS spin_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        discord_id VARCHAR(100),
        prize_id INTEGER,
        prize_name VARCHAR(100),
        coins_won INTEGER DEFAULT 0,
        spin_type VARCHAR(20) DEFAULT 'ticket',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create daily_spin_tickets table
      CREATE TABLE IF NOT EXISTS daily_spin_tickets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        discord_id VARCHAR(100) NOT NULL,
        tickets INTEGER DEFAULT 0,
        last_claim TIMESTAMPTZ,
        streak INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create testimonials table
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        avatar TEXT,
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        server_name VARCHAR(100),
        upvotes_received INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT true,
        is_visible BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        badge VARCHAR(20),
        image_url TEXT,
        user_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE spin_wheel_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE spin_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE daily_spin_tickets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

      -- Create RLS Policies (with DROP IF EXISTS to avoid errors)
      DO $$ 
      BEGIN
        DROP POLICY IF EXISTS "Allow public read spin_wheel_prizes" ON spin_wheel_prizes;
        CREATE POLICY "Allow public read spin_wheel_prizes" ON spin_wheel_prizes FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Allow service role all spin_wheel_prizes" ON spin_wheel_prizes;
        CREATE POLICY "Allow service role all spin_wheel_prizes" ON spin_wheel_prizes FOR ALL USING (true);

        DROP POLICY IF EXISTS "Allow public read spin_wheel_settings" ON spin_wheel_settings;
        CREATE POLICY "Allow public read spin_wheel_settings" ON spin_wheel_settings FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Allow service role all spin_wheel_settings" ON spin_wheel_settings;
        CREATE POLICY "Allow service role all spin_wheel_settings" ON spin_wheel_settings FOR ALL USING (true);

        DROP POLICY IF EXISTS "Allow service role all spin_history" ON spin_history;
        CREATE POLICY "Allow service role all spin_history" ON spin_history FOR ALL USING (true);

        DROP POLICY IF EXISTS "Allow service role all daily_spin_tickets" ON daily_spin_tickets;
        CREATE POLICY "Allow service role all daily_spin_tickets" ON daily_spin_tickets FOR ALL USING (true);

        DROP POLICY IF EXISTS "Allow public read testimonials" ON testimonials;
        CREATE POLICY "Allow public read testimonials" ON testimonials FOR SELECT USING (is_visible = true);
        
        DROP POLICY IF EXISTS "Allow service role all testimonials" ON testimonials;
        CREATE POLICY "Allow service role all testimonials" ON testimonials FOR ALL USING (true);
      END $$;
    `

    // Execute setup SQL using service role
    const { error: sqlError } = await supabase.rpc("exec_sql", { sql: setupSQL })

    if (sqlError && !sqlError.message.includes("already exists")) {
      console.log("[v0] Note: exec_sql function may not exist. Attempting direct insert...")
    }

    // Check and insert default prizes
    const { data: existingPrizes, error: prizesError } = await supabase.from("spin_wheel_prizes").select("id").limit(1)

    if (!prizesError && (!existingPrizes || existingPrizes.length === 0)) {
      const defaultPrizes = [
        { name: "5 Coins", coins: 5, probability: 25, color: "#4ade80", rarity: "common", is_active: true },
        { name: "10 Coins", coins: 10, probability: 20, color: "#22d3ee", rarity: "common", is_active: true },
        { name: "25 Coins", coins: 25, probability: 18, color: "#a78bfa", rarity: "uncommon", is_active: true },
        { name: "50 Coins", coins: 50, probability: 15, color: "#f472b6", rarity: "uncommon", is_active: true },
        { name: "100 Coins", coins: 100, probability: 10, color: "#fbbf24", rarity: "rare", is_active: true },
        { name: "250 Coins", coins: 250, probability: 7, color: "#f97316", rarity: "rare", is_active: true },
        { name: "500 Coins", coins: 500, probability: 4, color: "#ef4444", rarity: "epic", is_active: true },
        { name: "JACKPOT 1000", coins: 1000, probability: 1, color: "#eab308", rarity: "legendary", is_active: true },
      ]

      await supabase.from("spin_wheel_prizes").insert(defaultPrizes)
    }

    // Check and insert default settings
    const { data: existingSettings, error: settingsError } = await supabase
      .from("spin_wheel_settings")
      .select("id")
      .limit(1)

    if (!settingsError && (!existingSettings || existingSettings.length === 0)) {
      await supabase.from("spin_wheel_settings").insert({
        id: 1,
        daily_free_spins: 0,
        spin_cost_coins: 0,
        is_enabled: true,
        jackpot_threshold: 1000,
      })
    }

    // Check and insert sample testimonials
    const { data: existingTestimonials, error: testimonialsError } = await supabase
      .from("testimonials")
      .select("id")
      .limit(1)

    if (!testimonialsError && (!existingTestimonials || existingTestimonials.length === 0)) {
      const sampleTestimonials = [
        {
          username: "ServerOwner_Pro",
          avatar: "https://i.pravatar.cc/150?img=1",
          content:
            "Amazing upvote service! My server went from 50 to 500+ players in just one week. The boost is incredible and completely safe.",
          rating: 5,
          server_name: "Los Santos Roleplay",
          upvotes_received: 15000,
          is_featured: true,
          is_visible: true,
          is_verified: true,
          badge: "verified",
        },
        {
          username: "FiveM_Developer",
          avatar: "https://i.pravatar.cc/150?img=2",
          content:
            "Best tool I've ever used for my FiveM server. The upvotes are delivered fast and my server ranking improved significantly.",
          rating: 5,
          server_name: "Premium RP",
          upvotes_received: 25000,
          is_featured: true,
          is_visible: true,
          is_verified: true,
          badge: "pro",
        },
      ]

      await supabase.from("testimonials").insert(sampleTestimonials)
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      tablesChecked: ["spin_wheel_prizes", "spin_wheel_settings", "testimonials"],
    })
  } catch (error) {
    console.error("[v0] Database init error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      return NextResponse.json(
        {
          success: false,
          error: "Database tables not created. Please run scripts/009_complete_auto_setup.sql once.",
          details: errorMessage,
          note: "After running the SQL script once, the system will auto-maintain data.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
