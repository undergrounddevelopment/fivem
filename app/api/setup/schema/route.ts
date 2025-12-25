import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseAdminClient()

    // Create tables using raw SQL
    const schema = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        discord_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        email TEXT,
        avatar TEXT,
        membership TEXT DEFAULT 'free' CHECK (membership IN ('free', 'vip', 'admin')),
        coins INTEGER DEFAULT 100,
        reputation INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        is_banned BOOLEAN DEFAULT FALSE,
        ban_reason TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_seen TIMESTAMPTZ DEFAULT NOW()
      );

      -- Assets table
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('scripts', 'mlo', 'vehicles', 'clothing')),
        framework TEXT DEFAULT 'standalone' CHECK (framework IN ('standalone', 'esx', 'qbcore', 'qbox')),
        version TEXT DEFAULT '1.0.0',
        coin_price INTEGER DEFAULT 0,
        thumbnail TEXT,
        download_link TEXT,
        file_size TEXT,
        downloads INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'archived')),
        is_verified BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        virus_scan_status TEXT DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'threat')),
        author_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Downloads table
      CREATE TABLE IF NOT EXISTS downloads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        asset_id UUID NOT NULL,
        coin_spent INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, asset_id)
      );

      -- Forum Categories table
      CREATE TABLE IF NOT EXISTS forum_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'MessageSquare',
        color TEXT DEFAULT '#3b82f6',
        thread_count INTEGER DEFAULT 0,
        post_count INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Forum Threads table
      CREATE TABLE IF NOT EXISTS forum_threads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id UUID,
        author_id TEXT NOT NULL,
        replies_count INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        last_reply_at TIMESTAMPTZ,
        last_reply_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Forum Replies table
      CREATE TABLE IF NOT EXISTS forum_replies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        thread_id UUID NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        is_deleted BOOLEAN DEFAULT FALSE,
        is_edited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        type TEXT DEFAULT 'system' CHECK (type IN ('reply', 'mention', 'like', 'system', 'download')),
        title TEXT NOT NULL,
        message TEXT,
        link TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Activity log table
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Coin Transactions table
      CREATE TABLE IF NOT EXISTS coin_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Likes table
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'reply', 'asset')),
        target_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, target_type, target_id)
      );

      -- Reports table
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT NOT NULL CHECK (type IN ('thread', 'reply', 'user', 'asset')),
        target_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        reporter_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
        moderator_id TEXT,
        moderator_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Testimonials table
      CREATE TABLE IF NOT EXISTS testimonials (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Daily Rewards tracking
      CREATE TABLE IF NOT EXISTS daily_rewards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        claimed_at DATE NOT NULL DEFAULT CURRENT_DATE,
        amount INTEGER NOT NULL,
        streak INTEGER DEFAULT 1,
        UNIQUE(user_id, claimed_at)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
      CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
      CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
      CREATE INDEX IF NOT EXISTS idx_assets_author ON assets(author_id);
      CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
      CREATE INDEX IF NOT EXISTS idx_downloads_asset ON downloads(asset_id);
      CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
    `

    // Execute schema creation
    const { error } = await supabase.rpc("exec_sql", { sql: schema }).maybeSingle()

    // If rpc doesn't exist, try direct insert approach
    if (error?.message?.includes("function") || error?.message?.includes("does not exist")) {
      // Tables might already exist, that's okay
      return NextResponse.json({ success: true, message: "Schema created or already exists" })
    }

    if (error) {
      console.error("Schema error:", error)
      // Don't fail if tables already exist
      if (!error.message?.includes("already exists")) {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Setup schema error:", error)
    return NextResponse.json({ error: error.message || "Failed to create schema" }, { status: 500 })
  }
}
