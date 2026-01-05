import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

// Direct Supabase - 100% working
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = getSupabase()

    // Lookup user by discord_id (URL param is discord_id)
    const { data: user, error } = await supabase.from("users").select("*").eq("discord_id", id).single()

    if (error || !user) {
      console.log("[Profile API] User not found for discord_id:", id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[Profile API] Found user:", user.username, "UUID:", user.id, "Discord:", user.discord_id)

    // Batch fetch user data in parallel for optimization
    // IMPORTANT: forum_threads.author_id = UUID (user.id), NOT discord_id
    const [
      assetsResult,
      userBadgesResult,
      allBadgesResult,
      downloadsResult,
      threadsResult
    ] = await Promise.all([
      supabase.from("assets").select("*").eq("author_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(10),
      supabase.from("user_badges").select("*, badges(*)").eq("user_id", user.id),
      supabase.from("badges").select("*").order("min_xp", { ascending: true }),
      supabase.from("downloads").select("*").eq("user_id", user.discord_id).order("created_at", { ascending: false }).limit(10),
      supabase.from("forum_threads").select("*").eq("author_id", user.id).eq("is_deleted", false).order("created_at", { ascending: false }).limit(10),
    ])

    const assets = assetsResult.data
    const userBadges = userBadgesResult.data
    const allBadges = allBadgesResult.data
    const downloads = downloadsResult.data
    const threads = threadsResult.data

    // Get asset details for downloads
    const downloadsWithAssets = await Promise.all(
      (downloads || []).map(async (download) => {
        const { data: asset } = await supabase
          .from("assets")
          .select("title, thumbnail, category")
          .eq("id", download.asset_id)
          .single()
        return {
          id: download.id,
          assetId: download.asset_id,
          createdAt: download.created_at,
          asset: asset || { title: "Unknown", thumbnail: null, category: "scripts" },
        }
      }),
    )

    // Get counts in parallel
    // assets.author_id = UUID, forum_threads.author_id = UUID, downloads.user_id = discord_id
    const [
      { count: assetCount },
      { count: downloadCount },
      { count: threadCount },
      { count: likeCount }
    ] = await Promise.all([
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("status", "active"),
      supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", user.discord_id),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("is_deleted", false),
      supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", user.discord_id),
    ])

    const formattedUser = {
      id: user.discord_id,
      discordId: user.discord_id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      membership: user.membership,
      coins: user.coins,
      reputation: user.reputation,
      isAdmin: user.is_admin,
      isBanned: user.is_banned,
      createdAt: user.created_at,
      lastSeen: user.last_seen,
      xp: user.xp || 0,
      level: user.level || 1,
      current_badge: user.current_badge || 'beginner',
    }

    const stats = {
      totalUploads: assetCount || 0,
      totalDownloads: downloadCount || 0,
      totalPosts: threadCount || 0,
      coins: user.coins,
      membership: user.membership,
      joinedAt: user.created_at,
    }

    // Calculate earned badges based on XP
    // Use fallback badges if database badges table is empty or doesn't exist
    const fallbackBadges = [
      { id: 'beginner', name: 'Beginner Bolt', description: 'Start your journey', image_url: '/badges/badge1.png', min_xp: 0, max_xp: 999, color: '#84CC16', tier: 1 },
      { id: 'intermediate', name: 'Intermediate Bolt', description: 'Rising star', image_url: '/badges/badge2.png', min_xp: 1000, max_xp: 4999, color: '#3B82F6', tier: 2 },
      { id: 'advanced', name: 'Advanced Bolt', description: 'Skilled contributor', image_url: '/badges/badge3.png', min_xp: 5000, max_xp: 14999, color: '#9333EA', tier: 3 },
      { id: 'expert', name: 'Expert Bolt', description: 'Elite status', image_url: '/badges/badge4.png', min_xp: 15000, max_xp: 49999, color: '#DC2626', tier: 4 },
      { id: 'legend', name: 'Legend Bolt', description: 'Legendary rank', image_url: '/badges/badge5.png', min_xp: 50000, max_xp: null, color: '#F59E0B', tier: 5 },
    ]
    
    const badgesToUse = (allBadges && allBadges.length > 0) ? allBadges : fallbackBadges
    
    const earnedBadges = badgesToUse.filter(badge => 
      (user.xp || 0) >= badge.min_xp && 
      (!badge.max_xp || (user.xp || 0) <= badge.max_xp)
    )

    return NextResponse.json({
      user: formattedUser,
      assets: assets || [],
      downloads: downloadsWithAssets,
      threads: threads || [],
      stats,
      downloadCount: downloadCount || 0,
      postCount: threadCount || 0,
      likeCount: likeCount || 0,
      points: user.coins || 0,
      badges: {
        earned: earnedBadges,
        equipped: userBadges || [],
        all: badgesToUse,
      },
    })
  } catch (error: any) {
    logger.error("Profile error", error, {
      profileId: id,
      endpoint: `/api/profile/${id}`,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
