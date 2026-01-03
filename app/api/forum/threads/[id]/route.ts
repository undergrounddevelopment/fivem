import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = getSupabaseAdminClient()

    const { data: thread, error } = await supabase.from("forum_threads").select("*").eq("id", id).single()

    if (error || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    // Fetch author by discord_id first, then try UUID (backward compatibility)
    let author: { id?: string; discord_id?: string; username: string; avatar: string | null; membership: string; xp?: number; level?: number; current_badge?: string } | null = null
    if (thread.author_id) {
      // Try discord_id match first
      const { data: authorByDiscord } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
        .eq("discord_id", thread.author_id)
        .single()
      
      if (authorByDiscord) {
        author = authorByDiscord
      } else {
        // Try UUID match (backward compatibility)
        const { data: authorByUUID } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
          .eq("id", thread.author_id)
          .single()
        author = authorByUUID
      }
    }

    // Fetch category
    let category: { id: string; name: string; color: string } | null = null
    if (thread.category_id) {
      const { data: categoryData } = await supabase
        .from("forum_categories")
        .select("id, name, color")
        .eq("id", thread.category_id)
        .single()
      category = categoryData
    }

    // Get replies
    const { data: replies } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("thread_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    // Fetch reply authors by discord_id first, then try UUID
    const replyAuthorIds = [...new Set((replies || []).map((r) => r.author_id).filter(Boolean))]
    let replyAuthorsMap: Record<string, any> = {}
    if (replyAuthorIds.length > 0) {
      // Try discord_id match first
      const { data: replyAuthorsByDiscord } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
        .in("discord_id", replyAuthorIds)
      
      for (const a of replyAuthorsByDiscord || []) {
        replyAuthorsMap[a.discord_id] = a
      }

      // For any missing authors, try UUID match
      const missingIds = replyAuthorIds.filter(id => !replyAuthorsMap[id])
      if (missingIds.length > 0) {
        const { data: replyAuthorsByUUID } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
          .in("id", missingIds)
        
        for (const a of replyAuthorsByUUID || []) {
          replyAuthorsMap[a.id] = a
        }
      }
    }

    // Increment views
    await supabase
      .from("forum_threads")
      .update({ views: thread.views + 1 })
      .eq("id", id)

    const formattedThread = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      categoryId: thread.category_id,
      category: category ? category.name : "General",
      categoryColor: category ? category.color : "#3b82f6",
      authorId: thread.author_id,
      author: author
        ? {
            id: author.discord_id || author.id,
            username: author.username || 'Unknown',
            avatar: author.avatar,
            membership: author.membership || 'member',
          }
        : null,
      replies: (replies || []).map((reply) => {
        const replyAuthor = replyAuthorsMap[reply.author_id]
        return {
          id: reply.id,
          content: reply.content,
          authorId: reply.author_id,
          author: replyAuthor
            ? {
                id: replyAuthor.discord_id || replyAuthor.id,
                username: replyAuthor.username || 'Unknown',
                avatar: replyAuthor.avatar,
                membership: replyAuthor.membership || 'member',
              }
            : null,
          likes: reply.likes,
          isEdited: reply.is_edited,
          createdAt: reply.created_at,
          updatedAt: reply.updated_at,
        }
      }),
      repliesCount: thread.replies_count,
      likes: thread.likes,
      views: thread.views + 1,
      isPinned: thread.is_pinned,
      isLocked: thread.is_locked,
      images: thread.images || [],
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
    }

    return NextResponse.json(formattedThread)
  } catch (error) {
    console.error("Get thread error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
