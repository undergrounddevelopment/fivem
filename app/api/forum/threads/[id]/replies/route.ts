import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/server"

function getSupabase() {
  return createAdminClient()
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("thread_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Get authors by discord_id only
    const authorIds = [...new Set((replies || []).map(r => r.author_id).filter(Boolean))]
    const authorsMap: Record<string, any> = {}

    if (authorIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar, membership")
        .in("discord_id", authorIds)
      
      for (const u of users || []) {
        authorsMap[u.discord_id] = u
      }
    }

    const formatted = (replies || []).map(r => {
      const author = authorsMap[r.author_id]
      return {
        id: r.id,
        content: r.content,
        authorId: author?.discord_id || r.author_id,
        author: {
          id: author?.discord_id || r.author_id,
          username: author?.username || "User",
          avatar: author?.avatar,
          membership: author?.membership || "member",
        },
        likes: r.likes || 0,
        isEdited: r.is_edited || false,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }
    })

    return NextResponse.json({ replies: formatted })
  } catch (e: any) {
    console.error("[Replies GET]", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 })
    }

    const { id: threadId } = await params
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 })
    }

    const supabase = getSupabase()
    const discordId = session.user.id // Discord ID from session

    console.log("[Reply POST] Discord ID:", discordId, "Thread:", threadId)

    // Auto-Ban Check
    const { checkAutoBan } = await import('@/lib/autoBan')
    const isBanned = await checkAutoBan(discordId, content, 'comment')
    if (isBanned) {
      return NextResponse.json({ error: 'Account banned due to policy violation' }, { status: 403 })
    }

    // Get user UUID from discord_id
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id, discord_id, username, avatar, membership")
      .eq("discord_id", discordId)
      .single()

    if (userErr || !user) {
      console.error("[Reply POST] User lookup failed:", userErr)
      return NextResponse.json({ error: "User not found. Please re-login." }, { status: 404 })
    }

    console.log("[Reply POST] Found user:", user.username, "UUID:", user.id)

    // Check thread
    const { data: thread, error: threadErr } = await supabase
      .from("forum_threads")
      .select("id, is_locked, is_deleted")
      .eq("id", threadId)
      .single()

    if (threadErr || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }
    if (thread.is_deleted) {
      return NextResponse.json({ error: "Thread deleted" }, { status: 410 })
    }
    if (thread.is_locked) {
      return NextResponse.json({ error: "Thread locked" }, { status: 403 })
    }

    // Insert reply with DB UUID
    const { data: reply, error: insertErr } = await supabase
      .from("forum_replies")
      .insert({
        thread_id: threadId,
        author_id: user.id, // Use DB UUID
        content: content.trim(),
        likes: 0,
        is_deleted: false,
        is_edited: false,
      })
      .select()
      .single()

    if (insertErr) {
      console.error("[Reply POST] Insert error:", insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Update thread timestamp AND increment replies_count
    const { data: threadData } = await supabase.from("forum_threads")
      .select("replies_count")
      .eq("id", threadId)
      .single()
    
    await supabase.from("forum_threads")
      .update({ 
        updated_at: new Date().toISOString(),
        replies_count: (threadData?.replies_count || 0) + 1
      })
      .eq("id", threadId)

    return NextResponse.json({
      id: reply.id,
      content: reply.content,
      authorId: user.discord_id,
      author: {
        id: user.discord_id,
        username: user.username,
        avatar: user.avatar,
        membership: user.membership || "member",
      },
      likes: 0,
      isEdited: false,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
    }, { status: 201 })

  } catch (e: any) {
    console.error("[Reply POST] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
