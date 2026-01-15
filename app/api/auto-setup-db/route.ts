import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

let setupExecuted = false

export async function GET() {
  if (setupExecuted) {
    return NextResponse.json({
      success: true,
      message: "Database already initialized",
      alreadyRan: true,
    })
  }

  try {
    console.log("[v0] Starting automatic database setup...")

    const supabase = createAdminClient()

    const setupSQL = `
      -- 1. Banners table
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200),
        description TEXT,
        image_url TEXT NOT NULL,
        link TEXT,
        position VARCHAR(50) DEFAULT 'top',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. Announcements table
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200),
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_active BOOLEAN DEFAULT true,
        is_dismissible BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        link TEXT,
        link_text VARCHAR(100),
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. File uploads table
      CREATE TABLE IF NOT EXISTS file_uploads (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        file_url TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        checksum VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 4. Forum categories
      CREATE TABLE IF NOT EXISTS forum_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 5. Spin wheel prizes
      CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) DEFAULT 'coins',
        amount INTEGER NOT NULL DEFAULT 0,
        probability DECIMAL(5,2) NOT NULL DEFAULT 0,
        color VARCHAR(20) DEFAULT '#4ade80',
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 6. Spin history
      CREATE TABLE IF NOT EXISTS spin_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        discord_id VARCHAR(100),
        prize_id INTEGER REFERENCES spin_wheel_prizes(id),
        prize_name VARCHAR(100),
        prize_type VARCHAR(50),
        prize_amount INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 7. Daily claims
      CREATE TABLE IF NOT EXISTS daily_claims (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        claim_date DATE NOT NULL,
        claim_type VARCHAR(50) DEFAULT 'spin_ticket',
        streak INTEGER DEFAULT 1,
        tickets_claimed INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, claim_date)
      );

      -- 8. Admin audit log
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id SERIAL PRIMARY KEY,
        admin_id VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100),
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
      CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
      CREATE INDEX IF NOT EXISTS idx_spin_history_user ON spin_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_daily_claims_user_date ON daily_claims(user_id, claim_date);
      CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);

      -- Enable RLS
      ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
      ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
      ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE spin_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
    `

    // Try executing SQL (this requires PostgreSQL REST extension or direct connection)
    // For Supabase, we'll use the REST API to check tables and insert data
    console.log("[v0] Checking existing tables...")

    // Check if banners table exists
    const { data: bannersCheck, error: bannersError } = await supabase.from("banners").select("id").limit(1)

    const tablesExist = !bannersError

    if (!tablesExist) {
      return NextResponse.json(
        {
          success: false,
          message: "Tables not created yet. Run the SQL script manually once.",
          instructions: "Go to Supabase SQL Editor and run: scripts/010-admin-features-complete.sql",
          sqlScript: setupSQL,
          note: "After running once, all data will be auto-maintained.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Tables exist, checking data...")

    // Insert default data if tables are empty
    const { data: existingBanners } = await supabase.from("banners").select("id").limit(1)

    if (!existingBanners || existingBanners.length === 0) {
      await supabase.from("banners").insert({
        title: "Welcome to FiveM Tools",
        description: "Your one-stop shop for FiveM resources",
        image_url: "/placeholder.svg?height=200&width=1200",
        link: "/",
        position: "hero",
        is_active: true,
      })
      console.log("[v0] Inserted default banner")
    }

    const { data: existingAnnouncements } = await supabase.from("announcements").select("id").limit(1)

    if (!existingAnnouncements || existingAnnouncements.length === 0) {
      await supabase.from("announcements").insert({
        message: "Welcome to FiveM Tools! Join our Discord for updates and support.",
        type: "info",
        is_active: true,
        is_dismissible: true,
      })
      console.log("[v0] Inserted default announcement")
    }

    const { data: existingPrizes } = await supabase.from("spin_wheel_prizes").select("id").limit(1)

    if (!existingPrizes || existingPrizes.length === 0) {
      const defaultPrizes = [
        { name: "10 Coins", type: "coins", amount: 10, probability: 30, color: "#fbbf24", icon: "🪙", is_active: true },
        { name: "25 Coins", type: "coins", amount: 25, probability: 25, color: "#f59e0b", icon: "🪙", is_active: true },
        { name: "50 Coins", type: "coins", amount: 50, probability: 15, color: "#d97706", icon: "💰", is_active: true },
        {
          name: "100 Coins",
          type: "coins",
          amount: 100,
          probability: 10,
          color: "#b45309",
          icon: "💰",
          is_active: true,
        },
        {
          name: "1 Ticket",
          type: "tickets",
          amount: 1,
          probability: 10,
          color: "#3b82f6",
          icon: "🎫",
          is_active: true,
        },
        {
          name: "2 Tickets",
          type: "tickets",
          amount: 2,
          probability: 5,
          color: "#2563eb",
          icon: "🎫",
          is_active: true,
        },
        {
          name: "Jackpot 500",
          type: "coins",
          amount: 500,
          probability: 3,
          color: "#ef4444",
          icon: "💎",
          is_active: true,
        },
        {
          name: "Try Again",
          type: "nothing",
          amount: 0,
          probability: 2,
          color: "#6b7280",
          icon: "🔄",
          is_active: true,
        },
      ]

      await supabase.from("spin_wheel_prizes").insert(defaultPrizes)
      console.log("[v0] Inserted default spin prizes")
    }

    const { data: existingCategories } = await supabase.from("forum_categories").select("id").limit(1)

    if (!existingCategories || existingCategories.length === 0) {
      const defaultCategories = [
        {
          name: "General Discussion",
          slug: "general",
          description: "General FiveM topics",
          icon: "💬",
          color: "#3b82f6",
          display_order: 1,
        },
        {
          name: "Script Releases",
          slug: "scripts",
          description: "Share your scripts",
          icon: "📦",
          color: "#10b981",
          display_order: 2,
        },
        {
          name: "MLO Releases",
          slug: "mlo",
          description: "Share MLO maps",
          icon: "🏢",
          color: "#8b5cf6",
          display_order: 3,
        },
        {
          name: "Vehicle Releases",
          slug: "vehicles",
          description: "Share vehicles",
          icon: "🚗",
          color: "#f59e0b",
          display_order: 4,
        },
        {
          name: "Support & Help",
          slug: "support",
          description: "Get help",
          icon: "🆘",
          color: "#ef4444",
          display_order: 5,
        },
      ]

      await supabase.from("forum_categories").insert(defaultCategories)
      console.log("[v0] Inserted default forum categories")
    }

    setupExecuted = true

    console.log("[v0] Database setup completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database initialized and populated with default data",
      tables: [
        "banners",
        "announcements",
        "file_uploads",
        "forum_categories",
        "spin_wheel_prizes",
        "spin_history",
        "daily_claims",
        "admin_audit_log",
      ],
    })
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        note: "If tables don't exist, run scripts/010-admin-features-complete.sql in Supabase SQL Editor once.",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET()
}
