import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getEarnedBadges, BADGES, getLevelFromXP } from "@/lib/xp-badges"


function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    console.log("[Profile] Looking up:", id)
    const supabase = getSupabase()
    
    let user = null

    // Smart ID Detection
    const isDiscordId = /^\d{17,20}$/.test(id)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Method 1: Discord ID (Priority if matches snowflake format)
    if (isDiscordId) {
      console.log("[Profile] Detected Discord ID format")
      const { data: byDiscord } = await supabase
        .from("users")
        .select("*")
        .eq("discord_id", id)
        .single()
      
      if (byDiscord) user = byDiscord
    }

    // Method 2: UUID (Priority if matches UUID format)
    if (!user && isUuid) {
      console.log("[Profile] Detected UUID format")
      const { data: byUuid } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single()
      
      if (byUuid) user = byUuid
    }

    // Method 3: Username (Fallback or if vague format)
    // Only search username if not found yet, and if it's NOT a clear UUID (usernames can be numbers so check discord ID format too)
    if (!user) {
      const { data: byUsername } = await supabase
        .from("users")
        .select("*")
        .ilike("username", id)
        .single()
      
      if (byUsername) user = byUsername
    }

    // Method 4: Fallback - If it looked like Discord ID but failed, try searching generic 'id' column just in case
    // This handles cases where maybe it IS a UUID but regex failed, or vice versa
    if (!user && !isUuid && !isDiscordId) {
       // Generic search
    }

    if (!user) {
      console.log("[Profile] User not found:", id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch related data
    const [assetsRes, threadsRes, downloadsRes] = await Promise.all([
      supabase.from("assets").select("*").eq("author_id", user.id).eq("status", "approved").order("created_at", { ascending: false }).limit(10),
      supabase.from("forum_threads").select("*").eq("author_id", user.id).eq("is_deleted", false).order("created_at", { ascending: false }).limit(10),
      supabase.from("downloads").select("*").eq("user_id", user.discord_id).order("created_at", { ascending: false }).limit(10)
    ])

    const assets = assetsRes.data || []
    const threads = threadsRes.data || []
    const downloads = downloadsRes.data || []

    // Get counts
    const [assetCount, threadCount, downloadCount] = await Promise.all([
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("status", "approved"),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("is_deleted", false),
      supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", user.discord_id || '0')
    ])

    // Get download details
    const downloadsWithAssets = await Promise.all(
      downloads.map(async (d) => {
        const { data: asset } = await supabase.from("assets").select("title, thumbnail, category").eq("id", d.asset_id).single()
        return { id: d.id, assetId: d.asset_id, createdAt: d.created_at, asset: asset || { title: "Unknown", thumbnail: null, category: "scripts" } }
      })
    )

    const [replyCountRes, threadsLikeRes, repliesLikeRes, assetsLikeRes] = await Promise.all([
      supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("is_deleted", false),
      supabase.from("forum_threads").select("likes").eq("author_id", user.id),
      supabase.from("forum_replies").select("likes").eq("author_id", user.id),
      supabase.from("assets").select("likes").eq("author_id", user.id)
    ])

    const totalLikes = (threadsLikeRes.data || []).reduce((acc, curr) => acc + (curr.likes || 0), 0) +
                       (repliesLikeRes.data || []).reduce((acc, curr) => acc + (curr.likes || 0), 0) +
                       (assetsLikeRes.data || []).reduce((acc, curr) => acc + (curr.likes || 0), 0)
    
    // Construct user stats object for badge calculator
    const calcStats = {
      level: user.level || 1,
      posts: (threadCount.count || 0) + (replyCountRes.count || 0), // Total posts = threads + replies
      threads: threadCount.count || 0,
      likes_received: totalLikes,
      assets: assetCount.count || 0,
      asset_downloads: downloadCount.count || 0,
      membership: user.membership || "free",
      created_at: user.created_at
    }

    const earnedBadges = getEarnedBadges(calcStats)
    const levelInfo = getLevelFromXP(user.xp || 0)

    const response = {
      user: {
        id: user.discord_id || user.id, // Prefer Discord ID if available for cleaner URLs
        discordId: user.discord_id,
        username: user.username || "Unknown",
        email: user.email,
        avatar: user.avatar || `https://cdn.discordapp.com/embed/avatars/${(user.discord_id || user.id || '0').charCodeAt(0) % 6}.png`,
        membership: user.membership || "free",
        coins: user.coins || 0,
        reputation: user.reputation || 0,
        isAdmin: user.is_admin || false,
        isBanned: user.is_banned || false,
        createdAt: user.created_at,
        lastSeen: user.last_seen,
        xp: user.xp || 0,
        level: user.level || 1, 
        current_badge: levelInfo.title,
        banner: user.banner || null,
        bio: user.bio || null,
        social_links: user.social_links || null
      },
      assets,
      threads,
      downloads: downloadsWithAssets,
      stats: {
        totalUploads: assetCount.count || 0,
        totalDownloads: downloadCount.count || 0,
        totalPosts: calcStats.posts,
        coins: user.coins || 0,
        membership: user.membership || "free",
        joinedAt: user.created_at,
        // Add robust stats for BadgesDisplay
        level: user.level || 1,
        xp: user.xp || 0,
        posts: calcStats.posts,
        threads: calcStats.threads,
        likes_received: calcStats.likes_received,
        assets: calcStats.assets,
        asset_downloads: calcStats.asset_downloads,
        created_at: user.created_at // Duplicate for compatibility
      },
      downloadCount: downloadCount.count || 0,
      postCount: calcStats.posts,
      likeCount: totalLikes, // Real like count!
      points: user.coins || 0,
      badges: { 
        earned: earnedBadges, 
        equipped: [], 
        all: BADGES // Return all potential badges for "locked" view
      }
    }

    console.log("[Profile] Success:", user.username)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error("[Profile] Error:", error.message)
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 })
  }
}
