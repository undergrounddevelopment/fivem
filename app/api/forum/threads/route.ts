import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { forumSecurity } from "@/lib/forum-security"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "20")))
    const offset = (page - 1) * limit
    const showPending = searchParams.get("showPending") === "true"

    const supabase = await getSupabaseAdminClient()

    let query = supabase
      .from("forum_threads")
      .select("*", { count: "exact" })
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (!showPending) {
      query = query.eq("status", "approved")
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data: threads, count, error } = await query

    if (error) throw error

    // Fetch authors in bulk
    const authorIds = [...new Set((threads || []).map((t) => t.author_id).filter(Boolean))]
    let authorsMap: Record<string, any> = {}
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from("users")
        .select("discord_id, username, avatar, membership")
        .in("discord_id", authorIds)
      authorsMap = (authors || []).reduce(
        (acc, a) => {
          acc[a.discord_id] = a
          return acc
        },
        {} as Record<string, any>,
      )
    }

    // Fetch categories in bulk
    const categoryIds = [...new Set((threads || []).map((t) => t.category_id).filter(Boolean))]
    let categoriesMap: Record<string, any> = {}
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("forum_categories")
        .select("id, name, color, icon")
        .in("id", categoryIds)
      categoriesMap = (categories || []).reduce(
        (acc, c) => {
          acc[c.id] = c
          return acc
        },
        {} as Record<string, any>,
      )
    }

    const formattedThreads = (threads || []).map((thread) => {
      const author = authorsMap[thread.author_id]
      const category = categoriesMap[thread.category_id]
      return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        categoryId: thread.category_id,
        category: category?.name || "General",
        authorId: thread.author_id,
        author: author
          ? {
              id: author.discord_id,
              username: author.username,
              avatar: author.avatar,
              membership: author.membership,
            }
          : null,
        replies: thread.replies_count,
        likes: thread.likes,
        views: thread.views,
        isPinned: thread.is_pinned,
        isLocked: thread.is_locked,
        status: thread.status,
        images: thread.images || [],
        createdAt: thread.created_at,
        updatedAt: thread.updated_at,
        lastReplyAt: thread.last_reply_at,
      }
    })

    return NextResponse.json({
      threads: formattedThreads,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    logger.error("Fetch threads error", error, {
      endpoint: "/api/forum/threads",
    })
    return NextResponse.json({ threads: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, categoryId, images } = body

    // Validate title
    const titleValidation = forumSecurity.validateTitle(title)
    if (!titleValidation.valid) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 })
    }

    // Validate content
    const contentValidation = forumSecurity.validateContent(content)
    if (!contentValidation.valid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    // Validate category if provided
    if (categoryId) {
      const categoryValid = await forumSecurity.validateCategory(categoryId, supabase)
      if (!categoryValid) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
      }
    }

    // Sanitize inputs
    const sanitizedTitle = forumSecurity.sanitize(title).substring(0, 200)
    const sanitizedContent = forumSecurity.sanitize(content).substring(0, 50000)

    // Validate images
    const validImages = forumSecurity.validateImages(images)

    // Check admin status
    const isAdmin = await forumSecurity.isAdmin(session.user.id, supabase)
    const threadStatus = isAdmin ? "approved" : "pending"

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        category_id: categoryId || null,
        author_id: session.user.id,
        status: threadStatus,
        images: validImages,
        approved_at: isAdmin ? new Date().toISOString() : null,
        approved_by: isAdmin ? session.user.id : null,
      })
      .select("*")
      .single()

    if (error) {
      logger.error("Create thread DB error", error)
      throw error
    }

    // Fetch author
    const { data: author } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership")
      .eq("discord_id", session.user.id)
      .single()

    // Log activity (non-blocking)
    supabase.from("activities").insert({
      user_id: session.user.id,
      type: "post",
      action: `created thread "${sanitizedTitle}"`,
      target_id: thread.id,
    }).then()

    return NextResponse.json(
      {
        ...thread,
        images: thread.images || [],
        author: author
          ? {
              id: author.discord_id,
              username: author.username,
              avatar: author.avatar,
              membership: author.membership,
            }
          : null,
        message: isAdmin ? "Thread published successfully" : "Thread submitted for admin approval",
      },
      { status: 201 },
    )
  } catch (error: any) {
    logger.error("Create thread error", error, {
      endpoint: "/api/forum/threads",
    })
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 })
  }
}
