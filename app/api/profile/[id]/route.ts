import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = getSupabaseAdminClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("discord_id", id).single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's assets (assets.author_id is UUID matching users.id)
    const { data: assets } = await supabase
      .from("assets")
      .select("*")
      .eq("author_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get user's badges from database
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select("*, badges(*)")
      .eq("user_id", id)

    // Get all available badges for comparison
    const { data: allBadges } = await supabase
      .from("badges")
      .select("*")
      .order("min_xp", { ascending: true })

    // Get user's downloads with asset info
    const { data: downloads } = await supabase
      .from("downloads")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10)

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

    // Get user's threads
    const { data: threads } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("author_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get counts (assets use UUID, forum uses discord_id)
    const { count: assetCount } = await supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "active")

    const { count: downloadCount } = await supabase
      .from("downloads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)

    const { count: threadCount } = await supabase
      .from("forum_threads")
      .select("*", { count: "exact", head: true })
      .eq("author_id", id)

    const { count: likeCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)

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
    const earnedBadges = (allBadges || []).filter(badge => 
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
        all: allBadges || [],
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
