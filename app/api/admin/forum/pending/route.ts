import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", session.user.id)
      .single()

    if (!user?.is_admin && user?.membership !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { data: threads, error } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("status", "pending")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Fetch authors
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

    // Fetch categories
    const categoryIds = [...new Set((threads || []).map((t) => t.category_id).filter(Boolean))]
    let categoriesMap: Record<string, any> = {}
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("forum_categories")
        .select("id, name, color")
        .in("id", categoryIds)
      categoriesMap = (categories || []).reduce(
        (acc, c) => {
          acc[c.id] = c
          return acc
        },
        {} as Record<string, any>,
      )
    }

    const formattedThreads = (threads || []).map((thread) => ({
      ...thread,
      author: authorsMap[thread.author_id] || null,
      category: categoriesMap[thread.category_id] || null,
    }))

    return NextResponse.json({ threads: formattedThreads })
  } catch (error: any) {
    logger.error("Fetch pending threads error", error)
    return NextResponse.json({ error: "Failed to fetch pending threads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { threadId, action, reason } = await request.json()

    if (!threadId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", session.user.id)
      .single()

    if (!user?.is_admin && user?.membership !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const updateData =
      action === "approve"
        ? {
            status: "approved",
            approved_by: session.user.id,
            approved_at: new Date().toISOString(),
          }
        : {
            status: "rejected",
            rejection_reason: reason || "Rejected by admin",
            approved_by: session.user.id,
          }

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .update(updateData)
      .eq("id", threadId)
      .select()
      .single()

    if (error) throw error

    await supabase.from("notifications").insert({
      user_id: thread.author_id,
      type: "system",
      title: action === "approve" ? "Thread Approved" : "Thread Rejected",
      message:
        action === "approve"
          ? `Your thread "${thread.title}" has been approved and is now visible.`
          : `Your thread "${thread.title}" was rejected. Reason: ${reason || "No reason provided"}`,
      link: action === "approve" ? `/forum/thread/${thread.id}` : null,
    })

    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "moderation",
      action: `${action}d thread "${thread.title}"`,
      target_id: thread.id,
    })

    return NextResponse.json({
      success: true,
      message: `Thread ${action}d successfully`,
      thread,
    })
  } catch (error: any) {
    logger.error("Thread moderation error", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
