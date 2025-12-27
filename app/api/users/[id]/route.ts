import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = getSupabaseAdminClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("discord_id", id).single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get counts
    const [assetsResult, downloadsResult, threadsResult, repliesResult] = await Promise.all([
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("author_id", id),
      supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", id),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("author_id", id),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("author_id", id),
    ])

    const formattedUser = {
      id: user.discord_id,
      discordId: user.discord_id,
      username: user.username,
      avatar: user.avatar,
      membership: user.membership,
      coins: user.coins,
      createdAt: user.created_at,
      isAdmin: user.is_admin,
      _count: {
        assets: assetsResult.count || 0,
        downloads: downloadsResult.count || 0,
        forumThreads: threadsResult.count || 0,
        forumReplies: repliesResult.count || 0,
      },
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
