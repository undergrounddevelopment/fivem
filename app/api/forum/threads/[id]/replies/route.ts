import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = getSupabaseAdminClient()

    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("thread_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    if (error) throw error

    const authorIds = [...new Set((replies || []).map((r) => r.author_id).filter(Boolean))]
    let authorsMap: Record<string, any> = {}

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from("users")
        .select("discord_id, username, avatar, membership")
        .in("discord_id", authorIds)

      if (authors) {
        authorsMap = authors.reduce(
          (acc, author) => {
            acc[author.discord_id] = author
            return acc
          },
          {} as Record<string, any>,
        )
      }
    }

    const formattedReplies = (replies || []).map((reply) => {
      const author = authorsMap[reply.author_id]
      return {
        id: reply.id,
        content: reply.content,
        authorId: reply.author_id,
        author: author
          ? {
              id: author.discord_id,
              username: author.username,
              avatar: author.avatar,
              membership: author.membership,
            }
          : null,
        likes: reply.likes,
        isEdited: reply.is_edited,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
      }
    })

    return NextResponse.json({ replies: formattedReplies })
  } catch (error) {
    console.error("Get replies error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    // Validasi input
    if (!content?.trim() || content.length < 1) {
      return NextResponse.json({ error: "Reply content is required" }, { status: 400 })
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: "Reply content too long (max 10000 characters)" }, { status: 400 })
    }

    const sanitizedContent = content.trim()

    const supabase = getSupabaseAdminClient()

    // Check if thread exists and is not locked
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .select("id, is_locked, is_deleted, status, author_id, title, replies_count")
      .eq("id", id)
      .single()

    if (threadError || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    if (thread.is_deleted) {
      return NextResponse.json({ error: "Thread has been deleted" }, { status: 410 })
    }

    if (thread.is_locked) {
      return NextResponse.json({ error: "Thread is locked" }, { status: 403 })
    }

    if (thread.status !== "approved") {
      return NextResponse.json({ error: "Thread is not approved yet" }, { status: 403 })
    }

    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert({
        content: sanitizedContent,
        thread_id: id,
        author_id: session.user.id,
      })
      .select("*")
      .single()

    if (error) {
      logger.error("Create reply DB error", error)
      throw error
    }

    const { data: author } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership")
      .eq("discord_id", session.user.id)
      .single()

    // Update thread reply count using RPC to avoid race conditions
    await supabase.rpc('increment_thread_replies', { thread_id: id })

    // Update last reply info
    await supabase
      .from("forum_threads")
      .update({
        last_reply_at: new Date().toISOString(),
        last_reply_by: session.user.id,
      })
      .eq("id", id)

    // Notify thread author if different from replier (non-blocking)
    if (thread.author_id !== session.user.id) {
      supabase.from("notifications").insert({
        user_id: thread.author_id,
        type: "reply",
        title: "New reply",
        message: `Someone replied to your thread: ${thread.title}`,
        link: `/forum/thread/${id}`,
        is_read: false,
      })
    }

    // Log activity (non-blocking)
    supabase.from("activities").insert({
      user_id: session.user.id,
      type: "reply",
      action: `replied to thread "${thread.title}"`,
      target_id: id,
    })

    const formattedReply = {
      id: reply.id,
      content: reply.content,
      authorId: reply.author_id,
      author: author
        ? {
            id: author.discord_id,
            username: author.username,
            avatar: author.avatar,
            membership: author.membership,
          }
        : null,
      likes: reply.likes || 0,
      isEdited: reply.is_edited || false,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
    }

    return NextResponse.json(formattedReply, { status: 201 })
  } catch (error: any) {
    logger.error("Create reply error", error)
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 })
  }
}
