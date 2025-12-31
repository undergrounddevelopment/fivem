import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    const { data: users, error } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership")
      .eq("is_banned", false)
      .order("created_at", { ascending: true })
      .limit(200)

    if (error) {
      console.error("Top contributors users error:", error)
      return NextResponse.json([])
    }

    const ids = (users || []).map((u) => u.discord_id).filter(Boolean)
    if (ids.length === 0) return NextResponse.json([])

    // Fallback aggregation if PostgREST cannot group: we fetch small slices.
    // To avoid heavy load, we do a light query for recent activity.
    const { data: recentThreads } = await supabase
      .from("forum_threads")
      .select("author_id")
      .eq("is_deleted", false)
      .limit(1000)

    const { data: recentReplies } = await supabase
      .from("forum_replies")
      .select("author_id")
      .eq("is_deleted", false)
      .limit(2000)

    const threadCounts: Record<string, number> = {}
    const replyCounts: Record<string, number> = {}

    for (const t of recentThreads || []) {
      if (!t.author_id) continue
      threadCounts[t.author_id] = (threadCounts[t.author_id] || 0) + 1
    }

    for (const r of recentReplies || []) {
      if (!r.author_id) continue
      replyCounts[r.author_id] = (replyCounts[r.author_id] || 0) + 1
    }

    const contributors = (users || []).map((u) => {
      const threads = threadCounts[u.discord_id] || 0
      const replies = replyCounts[u.discord_id] || 0
      const points = threads * 10 + replies * 5
      return {
        id: u.discord_id,
        username: u.username,
        avatar: u.avatar,
        membership: u.membership,
        points,
        threads,
        replies,
        assets: 0,
      }
    })

    contributors.sort((a, b) => b.points - a.points)

    return NextResponse.json(contributors.slice(0, 10))
  } catch (error) {
    console.error("Top contributors error:", error)
    return NextResponse.json([])
  }
}
