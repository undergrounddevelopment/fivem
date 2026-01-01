-- FiveM Tools V7 - Complete Database Schema
-- Generated: 2025-12-31T14:43:28.598Z


-- Table: users
-- Columns: id, discord_id, username, email, avatar, membership, coins, reputation, downloads, points, is_banned, ban_reason, is_admin, created_at, updated_at, last_seen, spin_tickets, role, is_active, xp, level, bio


-- Table: assets
-- Columns: id, title, description, category, framework, version, coin_price, thumbnail, download_link, file_size, downloads, tags, status, is_verified, is_featured, virus_scan_status, author_id, created_at, updated_at, features, installation, changelog, rating, rating_count, youtube_link, github_link, docs_link, linkvertise_url, require_linkvertise, average_rating


-- Table: downloads
-- Columns: id, user_id, asset_id, coin_spent, created_at


-- Table: forum_categories
-- Columns: id, name, description, icon, color, sort_order, is_active, thread_count, post_count, created_at, updated_at


-- Table: forum_threads
-- Columns: id, title, content, category_id, author_id, status, rejection_reason, is_pinned, is_locked, is_deleted, replies_count, likes, views, images, last_reply_at, last_reply_by, approved_by, approved_at, created_at, updated_at


-- Table: notifications
-- Columns: id, user_id, type, title, message, link, is_read, created_at


-- Table: activities
-- Columns: id, user_id, type, action, target_id, metadata, created_at


-- Table: coin_transactions
-- Columns: id, user_id, amount, type, description, reference_id, created_at


-- Table: daily_rewards
-- Columns: id, user_id, claimed_at, amount, streak


-- Table: announcements
-- Columns: id, title, message, type, is_active, is_dismissible, sort_order, created_at, updated_at


-- Table: banners
-- Columns: id, title, image_url, link, position, is_active, sort_order, created_at, updated_at


-- Table: messages
-- Columns: id, sender_id, receiver_id, content, is_read, created_at


-- Table: site_settings
-- Columns: id, key, value, updated_at, site_name, site_description, maintenance_mode, category


-- Table: public_notifications
-- Columns: id, title, message, type, link, asset_id, is_active, created_by, created_at, expires_at


-- Table: spin_wheel_prizes
-- Columns: id, name, type, value, probability, color, icon, is_active, sort_order, created_at, updated_at


-- Table: spin_wheel_history
-- Columns: id, user_id, prize_id, prize_name, prize_type, prize_value, was_forced, created_at


-- Table: spin_wheel_tickets
-- Columns: id, user_id, ticket_type, is_used, used_at, expires_at, created_at


-- Table: spin_wheel_settings
-- Columns: id, key, value, updated_at


-- Table: daily_claims
-- Columns: id, user_id, claim_type, claim_date, claimed_at


-- Table: spin_history
-- Columns: id, user_id, prize_id, coins_won, prize_name, created_at, spin_type


CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  membership TEXT DEFAULT 'free' CHECK (membership IN ('free', 'vip', 'premium', 'admin')),
  coins INTEGER DEFAULT 100,
  reputation INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  is_admin BOOLEAN DEFAULT false,
  spin_tickets INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_membership ON users(membership);
CREATE INDEX idx_users_is_admin ON users(is_admin);
