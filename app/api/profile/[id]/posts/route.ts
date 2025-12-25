import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()

    // Get user first to get discord_id
    const { data: user } = await supabase
      .from("users")
      .select("discord_id")
      .or(`id.eq.${id},discord_id.eq.${id}`)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recent posts
    const { data: posts, error } = await supabase
      .from("forum_threads")
      .select("id, title, likes, replies_count, created_at, category_id")
      .eq("author_id", user.discord_id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
