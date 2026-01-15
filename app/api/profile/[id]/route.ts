import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    // Method 1: Try discord_id first (most common from session)
    const { data: byDiscord } = await supabase
      .from("users")
      .select("*")
      .eq("discord_id", id)
      .single()
    
    if (byDiscord) {
      user = byDiscord
      console.log("[Profile] Found by discord_id:", user.username)
    }

    // Method 2: Try UUID if not found
    if (!user) {
      const { data: byUuid } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single()
      
      if (byUuid) {
        user = byUuid
        console.log("[Profile] Found by UUID:", user.username)
      }
    }

    // Method 3: Try username as last resort
    if (!user) {
      const { data: byUsername } = await supabase
        .from("users")
        .select("*")
        .ilike("username", id)
        .single()
      
      if (byUsername) {
        user = byUsername
        console.log("[Profile] Found by username:", user.username)
      }
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
      supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", user.discord_id)
    ])

    // Get download details
    const downloadsWithAssets = await Promise.all(
      downloads.map(async (d) => {
        const { data: asset } = await supabase.from("assets").select("title, thumbnail, category").eq("id", d.asset_id).single()
        return { id: d.id, assetId: d.asset_id, createdAt: d.created_at, asset: asset || { title: "Unknown", thumbnail: null, category: "scripts" } }
      })
    )

    // Badges
    const badges = [
      { id: "1", name: "Beginner", description: "Start", image_url: "/badges/badge1.png", min_xp: 0, max_xp: 999, color: "#84CC16", tier: 1 },
      { id: "2", name: "Intermediate", description: "Rising", image_url: "/badges/badge2.png", min_xp: 1000, max_xp: 4999, color: "#3B82F6", tier: 2 },
      { id: "3", name: "Advanced", description: "Skilled", image_url: "/badges/badge3.png", min_xp: 5000, max_xp: 14999, color: "#9333EA", tier: 3 },
      { id: "4", name: "Expert", description: "Elite", image_url: "/badges/badge4.png", min_xp: 15000, max_xp: 49999, color: "#DC2626", tier: 4 },
      { id: "5", name: "Legend", description: "Legendary", image_url: "/badges/badge5.png", min_xp: 50000, max_xp: null, color: "#F59E0B", tier: 5 },
    ]
    
    const earnedBadges = badges.filter(b => (user.xp || 0) >= b.min_xp && (!b.max_xp || (user.xp || 0) <= b.max_xp))

    const response = {
      user: {
        id: user.discord_id || user.id,
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
        current_badge: user.current_badge || "Beginner"
      },
      assets,
      threads,
      downloads: downloadsWithAssets,
      stats: {
        totalUploads: assetCount.count || 0,
        totalDownloads: downloadCount.count || 0,
        totalPosts: threadCount.count || 0,
        coins: user.coins || 0,
        membership: user.membership || "free",
        joinedAt: user.created_at
      },
      downloadCount: downloadCount.count || 0,
      postCount: threadCount.count || 0,
      likeCount: 0,
      points: user.coins || 0,
      badges: { earned: earnedBadges, equipped: [], all: badges }
    }

    console.log("[Profile] Success:", user.username)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error("[Profile] Error:", error.message)
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 })
  }
}
