import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"

export async function GET(request: Request) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    if (!security.checkRateLimit(`top_contributors_${clientIP}`, 100, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const supabase = getSupabaseAdminClient()

    // Get users with most contributions (posts + replies + assets)
    const { data: users, error } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership, is_admin, coins")
      .eq("is_banned", false)
      .order("coins", { ascending: false })
      .limit(10)

    if (error) throw error

    // Get contribution counts for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const [threadsResult, repliesResult, assetsResult] = await Promise.all([
          supabase
            .from("forum_threads")
            .select("*", { count: "exact", head: true })
            .eq("author_id", user.discord_id)
            .eq("status", "approved"),
          supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("author_id", user.discord_id),
          supabase
            .from("assets")
            .select("*", { count: "exact", head: true })
            .eq("author_id", user.discord_id)
            .eq("status", "active"),
        ])

        const threads = threadsResult.count || 0
        const replies = repliesResult.count || 0
        const assets = assetsResult.count || 0

        // Calculate points: coins + (threads * 100) + (replies * 20) + (assets * 500)
        const points = (user.coins || 0) + threads * 100 + replies * 20 + assets * 500

        return {
          id: user.discord_id,
          username: user.username,
          avatar: user.avatar,
          membership: user.is_admin ? "admin" : user.membership,
          points,
          threads,
          replies,
          assets,
        }
      }),
    )

    // Sort by points descending
    usersWithStats.sort((a, b) => b.points - a.points)

    return NextResponse.json({
      contributors: usersWithStats.slice(0, 5),
    })
  } catch (error: any) {
    console.error("Top contributors error:", error)
    return NextResponse.json({ contributors: [] })
  }
}
