import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET - Get all badges or user badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    const supabase = getSupabaseAdminClient()

    // Get all available badges
    const { data: allBadges, error: badgesError } = await supabase
      .from("badges")
      .select("*")
      .order("category", { ascending: true })

    if (badgesError) {
      console.error("Badges fetch error:", badgesError)
    }

    // If userId provided, get user's earned badges
    let userBadges: any[] = []
    if (userId) {
      const { data: earned } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", userId)

      userBadges = earned || []
    }

    // Combine badges with earned status
    const badges = (allBadges || getDefaultBadges()).map(badge => ({
      ...badge,
      earned: userBadges.some(ub => ub.badge_id === badge.id),
      earnedAt: userBadges.find(ub => ub.badge_id === badge.id)?.earned_at
    }))

    return NextResponse.json({ badges })
  } catch (error) {
    console.error("Get badges error:", error)
    return NextResponse.json({ badges: getDefaultBadges() })
  }
}

// POST - Award badge to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { badgeId, userId } = body
    
    const targetUserId = userId || (session.user as any).discord_id || session.user.id

    const supabase = getSupabaseAdminClient()

    // Check if badge exists
    const { data: badge } = await supabase
      .from("badges")
      .select("*")
      .eq("id", badgeId)
      .single()

    if (!badge) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 })
    }

    // Award badge
    const { error } = await supabase
      .from("user_badges")
      .upsert({
        user_id: targetUserId,
        badge_id: badgeId,
        earned_at: new Date().toISOString()
      }, {
        onConflict: "user_id,badge_id"
      })

    if (error) throw error

    return NextResponse.json({ success: true, badge })
  } catch (error) {
    console.error("Award badge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDefaultBadges() {
  return [
    { id: "newcomer", name: "Newcomer", description: "Welcome to FiveM Tools!", icon: "👋", category: "general", rarity: "common" },
    { id: "first_post", name: "First Post", description: "Created your first forum post", icon: "📝", category: "forum", rarity: "common" },
    { id: "active_poster", name: "Active Poster", description: "Created 10 forum posts", icon: "💬", category: "forum", rarity: "uncommon" },
    { id: "forum_veteran", name: "Forum Veteran", description: "Created 50 forum posts", icon: "🏆", category: "forum", rarity: "rare" },
    { id: "first_upload", name: "First Upload", description: "Uploaded your first asset", icon: "📤", category: "assets", rarity: "common" },
    { id: "contributor", name: "Contributor", description: "Uploaded 5 assets", icon: "🎁", category: "assets", rarity: "uncommon" },
    { id: "top_contributor", name: "Top Contributor", description: "Uploaded 20 assets", icon: "⭐", category: "assets", rarity: "rare" },
    { id: "liked", name: "Liked", description: "Received 10 likes", icon: "❤️", category: "social", rarity: "common" },
    { id: "popular", name: "Popular", description: "Received 50 likes", icon: "🔥", category: "social", rarity: "uncommon" },
    { id: "level_5", name: "Rising Star", description: "Reached Level 5", icon: "⬆️", category: "xp", rarity: "common" },
    { id: "level_10", name: "Experienced", description: "Reached Level 10", icon: "📈", category: "xp", rarity: "uncommon" },
    { id: "vip_member", name: "VIP Member", description: "VIP membership holder", icon: "💎", category: "membership", rarity: "epic" },
  ]
}
