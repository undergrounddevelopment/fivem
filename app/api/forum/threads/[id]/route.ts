import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL || 
              process.env.fivemvip_SUPABASE_URL || 
              process.env.SUPABASE_URL!
  const key = process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY || 
              process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: thread, error } = await supabase.from("forum_threads").select("*").eq("id", id).single()
    if (error || !thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })

    // Get category
    let categoryName = "General"
    let categoryColor = "#3b82f6"
    if (thread.category_id) {
      const { data } = await supabase.from("forum_categories").select("id, name, color").eq("id", thread.category_id).single()
      if (data) {
        categoryName = data.name || "General"
        categoryColor = data.color || "#3b82f6"
      }
    }

    // Get replies
    const { data: replies } = await supabase.from("forum_replies").select("*").eq("thread_id", id).eq("is_deleted", false).order("created_at", { ascending: true })

    // Get authors by discord_id (author_id is TEXT = discord_id)
    const authorIds = [thread.author_id, ...(replies || []).map(r => r.author_id)].filter(Boolean)
    const authorsMap: Record<string, any> = {}

    if (authorIds.length > 0) {
      const uniqueIds = [...new Set(authorIds)]
      const { data: users } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar, membership, xp, level")
        .in("discord_id", uniqueIds)
      
      for (const u of users || []) {
        authorsMap[u.discord_id] = u
      }
    }

    // Increment views
    supabase.from("forum_threads").update({ views: (thread.views || 0) + 1 }).eq("id", id).then(() => {})

    const author = authorsMap[thread.author_id]
    return NextResponse.json({
      id: thread.id, title: thread.title, content: thread.content,
      categoryId: thread.category_id, category: categoryName, categoryColor: categoryColor,
      authorId: thread.author_id,
      author: { id: author?.discord_id || thread.author_id, username: author?.username, avatar: author?.avatar, membership: author?.membership || "member" },
      replies: (replies || []).map(r => {
        const a = authorsMap[r.author_id]
        return {
          id: r.id, content: r.content, authorId: r.author_id,
          author: { id: a?.discord_id || r.author_id, username: a?.username, avatar: a?.avatar, membership: a?.membership || "member" },
          likes: r.likes || 0, isEdited: r.is_edited || false, createdAt: r.created_at, updatedAt: r.updated_at,
        }
      }),
      repliesCount: thread.replies_count || thread.replies || 0, likes: thread.likes || 0, views: (thread.views || 0) + 1,
      isPinned: thread.is_pinned || false, isLocked: thread.is_locked || false, images: thread.images || [],
      createdAt: thread.created_at, updatedAt: thread.updated_at,
    })
  } catch (e: any) {
    console.error("[Thread GET]", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
