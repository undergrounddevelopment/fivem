import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()

    // Get user first to get discord_id
    const { data: user } = await supabase
      .from("users")
      .select("discord_id, downloads")
      .or(`id.eq.${id},discord_id.eq.${id}`)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const discordId = user.discord_id

    // Count forum posts
    const { count: postsCount } = await supabase
      .from("forum_threads")
      .select("*", { count: "exact", head: true })
      .eq("author_id", discordId)

    // Count assets
    const { count: assetsCount } = await supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .eq("author_id", discordId)

    // Count likes given
    const { count: likesGiven } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", discordId)

    // Count likes received on threads
    const { data: userThreads } = await supabase.from("forum_threads").select("likes").eq("author_id", discordId)

    const threadLikes = userThreads?.reduce((sum, t) => sum + (t.likes || 0), 0) || 0

    // Count likes received on replies
    const { data: userReplies } = await supabase.from("forum_replies").select("likes").eq("author_id", discordId)

    const replyLikes = userReplies?.reduce((sum, r) => sum + (r.likes || 0), 0) || 0

    return NextResponse.json({
      downloads: user.downloads || 0,
      posts: postsCount || 0,
      assets: assetsCount || 0,
      likesGiven: likesGiven || 0,
      likesReceived: threadLikes + replyLikes,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
