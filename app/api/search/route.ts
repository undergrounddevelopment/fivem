import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Parallel search
    const [assets, users, threads] = await Promise.all([
      // Search Assets
      supabase
        .from("assets")
        .select("id, title, category, thumbnail, slug")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("status", "approved")
        .limit(5),

      // Search Users
      supabase
        .from("users")
        .select("id, username, avatar")
        .ilike("username", `%${query}%`)
        .limit(5),
      
      // Search Threads (if table exists)
      supabase
        .from("forum_threads")
        .select("id, title, category")
        .ilike("title", `%${query}%`)
        .limit(5)
    ])

    return NextResponse.json({
      results: {
        assets: assets.data || [],
        users: users.data || [],
        threads: threads.data || []
      }
    })

  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
