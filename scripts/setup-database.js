import pkg from "pg"
const { Client } = pkg

const DATABASE_URL =
  "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

async function setupDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log("🔌 Connecting to database...")
    await client.connect()
    console.log("✅ Connected successfully!\n")

    // Create all tables
    console.log("📦 Creating tables...")

    // 1. Banners table
    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        link_url TEXT,
        position TEXT CHECK (position IN ('top', 'hero', 'sidebar', 'footer')) DEFAULT 'hero',
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        click_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID
      );
    `)
    console.log("✅ Banners table created")

    // 2. Announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'promo')) DEFAULT 'info',
        link_url TEXT,
        link_text TEXT,
        is_active BOOLEAN DEFAULT true,
        is_dismissible BOOLEAN DEFAULT true,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID
      );
    `)
    console.log("✅ Announcements table created")

    // 3. File uploads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type TEXT NOT NULL,
        checksum TEXT NOT NULL,
        uploaded_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("✅ File uploads table created")

    // 4. Spin wheel prizes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        prize_type TEXT CHECK (prize_type IN ('coins', 'tickets', 'bonus', 'item')) NOT NULL,
        value INTEGER NOT NULL,
        probability DECIMAL(5,2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("✅ Spin wheel prizes table created")

    // 5. Spin history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS spin_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        prize_id UUID REFERENCES spin_wheel_prizes(id),
        prize_name TEXT NOT NULL,
        prize_value INTEGER NOT NULL,
        prize_type TEXT NOT NULL,
        spun_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("✅ Spin history table created")

    // 6. Daily claims table
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
        streak INTEGER DEFAULT 1,
        tickets_claimed INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, claim_date)
      );
    `)
    console.log("✅ Daily claims table created")

    // 7. Forum categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT DEFAULT '📁',
        color TEXT DEFAULT '#3b82f6',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("✅ Forum categories table created")

    // 8. Admin audit log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id UUID,
        changes JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("✅ Admin audit log table created")

    // Create indexes
    console.log("\n📊 Creating indexes...")
    await client.query(`CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, start_date, end_date);`)
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, start_date, end_date);`,
    )
    await client.query(`CREATE INDEX IF NOT EXISTS idx_spin_history_user ON spin_history(user_id, spun_at DESC);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON daily_claims(user_id, claim_date DESC);`)
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_forum_categories_active ON forum_categories(is_active, sort_order);`,
    )
    console.log("✅ Indexes created")

    // Insert default data
    console.log("\n🌱 Seeding default data...")

    // Default spin prizes
    await client.query(`
      INSERT INTO spin_wheel_prizes (name, description, prize_type, value, probability, color, icon)
      VALUES 
        ('10 Coins', 'Better luck next time!', 'coins', 10, 30.00, '#fbbf24', '🪙'),
        ('25 Coins', 'Nice spin!', 'coins', 25, 25.00, '#f59e0b', '🪙'),
        ('50 Coins', 'Great!', 'coins', 50, 20.00, '#3b82f6', '💰'),
        ('100 Coins', 'Excellent!', 'coins', 100, 15.00, '#8b5cf6', '💰'),
        ('1 Free Spin', 'Spin again!', 'tickets', 1, 8.00, '#10b981', '🎟️'),
        ('250 Coins', 'Amazing!', 'coins', 250, 1.50, '#ef4444', '💎'),
        ('Jackpot!', 'You won the jackpot!', 'coins', 1000, 0.50, '#dc2626', '🎉')
      ON CONFLICT DO NOTHING;
    `)
    console.log("✅ Spin prizes seeded")

    // Default forum categories
    await client.query(`
      INSERT INTO forum_categories (name, description, icon, color, sort_order)
      VALUES 
        ('General Discussion', 'Talk about anything', '💬', '#3b82f6', 1),
        ('Support', 'Get help and support', '🆘', '#10b981', 2),
        ('Announcements', 'Official announcements', '📢', '#8b5cf6', 3),
        ('Feedback', 'Share your thoughts', '💡', '#f59e0b', 4)
      ON CONFLICT (name) DO NOTHING;
    `)
    console.log("✅ Forum categories seeded")

    // Default banner
    await client.query(`
      INSERT INTO banners (title, description, image_url, link_url, position, is_active)
      VALUES 
        ('Welcome to FiveM Tools V7', 'Your #1 resource hub for FiveM scripts, MLO, vehicles, and more!', 
         'https://r2.fivemanage.com/IKG5gF4pHPjLHEhuHxEh0/Untitleddesign-26.png', 
         '/', 'hero', true)
      ON CONFLICT DO NOTHING;
    `)
    console.log("✅ Default banner seeded")

    // Default announcement
    await client.query(`
      INSERT INTO announcements (title, content, type, is_active, is_dismissible)
      VALUES 
        ('🎉 Welcome!', 'Welcome to FiveM Tools V7! Explore our massive collection of free resources.', 
         'info', true, true)
      ON CONFLICT DO NOTHING;
    `)
    console.log("✅ Default announcement seeded")

    // Verification
    console.log("\n✅ Database setup completed successfully!")
    console.log("\n📋 Verification:")

    const tables = [
      "banners",
      "announcements",
      "file_uploads",
      "spin_wheel_prizes",
      "spin_history",
      "daily_claims",
      "forum_categories",
      "admin_audit_log",
    ]

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`)
      console.log(`   ${table}: ${result.rows[0].count} records`)
    }

    console.log("\n🎉 All admin features are now ready to use!")
    console.log("   - Banner Management: /admin/banners")
    console.log("   - Announcement Management: /admin/announcements")
    console.log("   - Forum Settings: /admin/forum-settings")
    console.log("   - Spin Wheel Manager: /admin/spin-wheel")
  } catch (error) {
    console.error("❌ Error setting up database:", error)
    throw error
  } finally {
    await client.end()
    console.log("\n🔌 Database connection closed")
  }
}

setupDatabase()
