import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await getSupabaseAdminClient()

    const { data: thread, error } = await supabase.from("forum_threads").select("*").eq("id", id).single()

    if (error || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    // Fetch author
    let author = null
    if (thread.author_id) {
      const { data: authorData } = await supabase
        .from("users")
        .select("discord_id, username, avatar, membership")
        .eq("discord_id", thread.author_id)
        .single()
      author = authorData
    }

    // Fetch category
    let category = null
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

    // Fetch reply authors
    const replyAuthorIds = [...new Set((replies || []).map((r) => r.author_id).filter(Boolean))]
    let replyAuthorsMap: Record<string, any> = {}
    if (replyAuthorIds.length > 0) {
      const { data: replyAuthors } = await supabase
        .from("users")
        .select("discord_id, username, avatar, membership")
        .in("discord_id", replyAuthorIds)
      replyAuthorsMap = (replyAuthors || []).reduce(
        (acc, a) => {
          acc[a.discord_id] = a
          return acc
        },
        {} as Record<string, any>,
      )
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
      category: category?.name || "General",
      categoryColor: category?.color || "#3b82f6",
      authorId: thread.author_id,
      author: author
        ? {
            id: author.discord_id,
            username: author.username,
            avatar: author.avatar,
            membership: author.membership,
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
                id: replyAuthor.discord_id,
                username: replyAuthor.username,
                avatar: replyAuthor.avatar,
                membership: replyAuthor.membership,
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
