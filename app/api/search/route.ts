import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const type = searchParams.get("type") || "all"
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50)

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const supabase = await getSupabaseAdminClient()
    const results: any = { assets: [], threads: [], users: [] }
    let total = 0

    // Search assets
    if (type === "all" || type === "assets") {
      const { data: assets, count } = await supabase
        .from("assets")
        .select("id, title, description, thumbnail, category, framework, rating, downloads", { count: "exact" })
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .eq("status", "active")
        .order("downloads", { ascending: false })
        .limit(limit)

      results.assets = assets || []
      total += count || 0
    }

    // Search forum threads
    if (type === "all" || type === "threads") {
      const { data: threads, count } = await supabase
        .from("forum_threads")
        .select("id, title, content, author_id, created_at, views, likes, replies_count", { count: "exact" })
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .eq("status", "approved")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(limit)

      // Get author info
      if (threads && threads.length > 0) {
        const authorIds = [...new Set(threads.map((t) => t.author_id))]
        const { data: users } = await supabase
          .from("users")
          .select("discord_id, username, avatar")
          .in("discord_id", authorIds)

        const userMap = new Map(users?.map((u) => [u.discord_id, u]) || [])
        results.threads = threads.map((thread) => ({
          ...thread,
          author: userMap.get(thread.author_id),
        }))
      }
      total += count || 0
    }

    // Search users
    if (type === "all" || type === "users") {
      const { data: users, count } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar, membership, reputation", { count: "exact" })
        .ilike("username", `%${query}%`)
        .eq("is_banned", false)
        .order("reputation", { ascending: false })
        .limit(limit)

      results.users = users || []
      total += count || 0
    }

    return NextResponse.json({ results, total, query })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
