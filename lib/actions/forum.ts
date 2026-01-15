"use server"

import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Direct Supabase - 100% working
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return { id: session.user.id }
}

// Helper to get authors - handles both UUID and discord_id
async function getAuthorsMap(supabase: any, authorIds: string[]) {
  if (!authorIds.length) return {}
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]
  const map: Record<string, any> = {}

  // Separate UUIDs from discord_ids
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const uuids = uniqueIds.filter(id => uuidRegex.test(id))
  const discordIds = uniqueIds.filter(id => !uuidRegex.test(id))

  // Query by UUID
  if (uuids.length > 0) {
    const { data: u1 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("id", uuids)
    for (const u of u1 || []) map[u.id] = u
  }

  // Query by discord_id (for non-UUID author_ids or missing UUIDs)
  const missingUuids = uuids.filter(id => !map[id])
  const allDiscordIds = [...discordIds, ...missingUuids]
  
  if (allDiscordIds.length > 0) {
    const { data: u2 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("discord_id", allDiscordIds)
    for (const u of u2 || []) map[u.discord_id] = u
  }
  
  return map
}

function formatAuthor(author: any, fallbackId: string) {
  if (author?.username) {
    return {
      id: author.discord_id || author.id || fallbackId,
      username: author.username,
      avatar: author.avatar,
      membership: author.membership || "member",
      xp: author.xp || 0,
      level: author.level || 1,
    }
  }
  return { id: fallbackId, username: "User", avatar: null, membership: "member", xp: 0, level: 1 }
}

export async function getForumCategories() {
  try {
    const supabase = getSupabase()
    const { data: categories, error } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
    
    if (error) throw error
    if (!categories?.length) return []

    const result = await Promise.all(categories.map(async (cat) => {
      const { count: threadCount } = await supabase
        .from("forum_threads")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id)
        .eq("is_deleted", false)

      return { ...cat, threadCount: threadCount || 0, thread_count: threadCount || 0, postCount: threadCount || 0 }
    }))

    return result
  } catch (e) {
    console.error("[getForumCategories]", e)
    return []
  }
}

export async function getForumThreads(categoryId?: string, limit = 50) {
  try {
    const supabase = getSupabase()
    let query = supabase
      .from("forum_threads")
      .select("*")
      .eq("is_deleted", false)
      .or("status.eq.approved,status.is.null")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (categoryId) query = query.eq("category_id", categoryId)

    const { data: threads, error } = await query
    if (error) throw error
    if (!threads?.length) return []

    const authorIds = threads.map(t => t.author_id).filter(Boolean)
    const authorsMap = await getAuthorsMap(supabase, authorIds)

    return threads.map(t => ({
      ...t,
      author: formatAuthor(authorsMap[t.author_id], t.author_id)
    }))
  } catch (e) {
    console.error("[getForumThreads]", e)
    return []
  }
}

export async function getForumThread(threadId: string) {
  try {
    const supabase = getSupabase()
    const { data: thread, error } = await supabase.from("forum_threads").select("*").eq("id", threadId).single()
    if (error) throw error
    if (!thread) return null

    const authorsMap = await getAuthorsMap(supabase, [thread.author_id])
    return { ...thread, author: formatAuthor(authorsMap[thread.author_id], thread.author_id) }
  } catch (e) {
    console.error("[getForumThread]", e)
    return null
  }
}

export async function getForumReplies(threadId: string) {
  try {
    const supabase = getSupabase()
    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("thread_id", threadId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    if (error) throw error
    if (!replies?.length) return []

    const authorIds = replies.map(r => r.author_id).filter(Boolean)
    const authorsMap = await getAuthorsMap(supabase, authorIds)

    return replies.map(r => ({ ...r, author: formatAuthor(authorsMap[r.author_id], r.author_id) }))
  } catch (e) {
    console.error("[getForumReplies]", e)
    return []
  }
}

export async function createForumThread(data: { categoryId: string; title: string; content: string; threadType?: string }) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = getSupabase()
    const { data: dbUser } = await supabase.from("users").select("id").eq("discord_id", user.id).single()
    if (!dbUser) throw new Error("User not found")

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .insert({ 
        category_id: data.categoryId, 
        author_id: dbUser.id, 
        title: data.title, 
        content: data.content, 
        status: "approved",
        thread_type: data.threadType || "discussion"
      })
      .select()
      .single()

    if (error) throw error
    return thread
  } catch (e) {
    console.error("[createForumThread]", e)
    throw new Error("Failed to create thread")
  }
}

export async function createForumReply(data: { threadId: string; content: string }) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = getSupabase()
    const { data: dbUser } = await supabase.from("users").select("id").eq("discord_id", user.id).single()
    if (!dbUser) throw new Error("User not found")
    
    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert({ thread_id: data.threadId, author_id: dbUser.id, content: data.content })
      .select()
      .single()

    if (error) throw error

    // Update thread count
    await supabase.from("forum_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.threadId)

    return reply
  } catch (e) {
    console.error("[createForumReply]", e)
    throw new Error("Failed to create reply")
  }
}

export async function deleteForumThread(threadId: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = getSupabase()
    await supabase.from("forum_threads").update({ is_deleted: true }).eq("id", threadId)
    return { success: true }
  } catch (e) {
    console.error("[deleteForumThread]", e)
    throw e
  }
}

export async function deleteForumReply(replyId: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = getSupabase()
    await supabase.from("forum_replies").update({ is_deleted: true }).eq("id", replyId)
    return { success: true }
  } catch (e) {
    console.error("[deleteForumReply]", e)
    throw e
  }
}

export async function getOnlineUsers() {
  try {
    const supabase = getSupabase()
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership")
      .eq("is_banned", false)
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", { ascending: false })
      .limit(20)

    return (data || []).map(u => ({
      id: u.discord_id,
      username: u.username,
      avatar: u.avatar,
      membership: u.membership,
      is_online: true,
    }))
  } catch (e) {
    console.error("[getOnlineUsers]", e)
    return []
  }
}

export async function getTopContributors() {
  try {
    const supabase = getSupabase()
    const { data: users } = await supabase
      .from("users")
      .select("id, discord_id, username, avatar, membership, xp, level")
      .eq("is_banned", false)
      .order("xp", { ascending: false })
      .limit(10)

    return (users || []).map(u => ({
      id: u.discord_id,
      username: u.username,
      avatar: u.avatar,
      membership: u.membership,
      threads: 0,
      replies: 0,
      points: u.xp || 0,
    }))
  } catch (e) {
    console.error("[getTopContributors]", e)
    return []
  }
}
