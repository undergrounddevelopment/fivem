"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { XP_CONFIG, getLevelFromXP } from "@/lib/xp-badges"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper function to award XP (userId is discord_id for forum)
async function awardXP(discordId: string, action: keyof typeof XP_CONFIG.rewards) {
  try {
    const supabase = createAdminClient()
    const xpReward = XP_CONFIG.rewards[action]
    if (!xpReward) return

    // Get current user XP by discord_id
    const { data: user } = await supabase
      .from('users')
      .select('id, discord_id, xp, level')
      .eq('discord_id', discordId)
      .single()

    if (!user) return

    // Calculate new XP and level
    const newXP = (user.xp || 0) + xpReward
    const levelInfo = getLevelFromXP(newXP)

    // Update user XP and level
    await supabase
      .from('users')
      .update({
        xp: newXP,
        level: levelInfo.level,
        current_badge: levelInfo.title.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('discord_id', discordId)

    // Log XP transaction
    await supabase
      .from('xp_transactions')
      .insert({
        user_id: discordId,
        amount: xpReward,
        activity_type: action,
        description: `Earned ${xpReward} XP for ${action.toLowerCase().replace(/_/g, ' ')}`,
      })

    console.log(`[XP] Awarded ${xpReward} XP to user ${discordId} for ${action}`)
  } catch (error) {
    console.error('[XP] Error awarding XP:', error)
  }
}

async function getUser() {
  // Use NextAuth session instead of Supabase Auth
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  // Return user object with id as discord_id for compatibility
  return { id: session.user.id }
}

export async function getForumCategories() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getForumThreads(categoryId?: string, limit = 50) {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from("forum_threads")
      .select(`
        *,
        author:users!forum_threads_author_id_fkey(discord_id, username, avatar, membership)
      `)
      .eq("status", "approved")
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching threads:", error)
    return []
  }
}

export async function getForumThread(threadId: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("forum_threads")
      .select(`
        *,
        author:users!forum_threads_author_id_fkey(discord_id, username, avatar, membership)
      `)
      .eq("id", threadId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching thread:", error)
    return null
  }
}

export async function getForumReplies(threadId: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("forum_replies")
      .select(`
        *,
        author:users!forum_replies_author_id_fkey(discord_id, username, avatar, membership)
      `)
      .eq("thread_id", threadId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching replies:", error)
    return []
  }
}

export async function createForumThread(data: { categoryId: string; title: string; content: string }) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = createAdminClient()
    const discordId = user.id

    // Look up user UUID from discord_id (v7 schema uses UUID for author_id)
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("discord_id", discordId)
      .single()

    if (!dbUser) throw new Error("User not found in database")

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .insert({
        category_id: data.categoryId,
        author_id: dbUser.id,
        title: data.title,
        content: data.content,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    // Award XP for creating thread
    if (thread) {
      await awardXP(discordId, 'CREATE_THREAD')
    }

    return thread
  } catch (error) {
    console.error("Error creating thread:", error)
    throw new Error("Failed to create thread")
  }
}

export async function createForumReply(data: { threadId: string; content: string }) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = createAdminClient()
    const discordId = user.id

    // Look up user UUID from discord_id (v7 schema uses UUID for author_id)
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("discord_id", discordId)
      .single()

    if (!dbUser) throw new Error("User not found in database")
    
    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert({
        thread_id: data.threadId,
        author_id: dbUser.id,
        content: data.content,
      })
      .select()
      .single()

    if (error) throw error

    // Update thread updated_at
    await supabase
      .from("forum_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.threadId)

    // Increment replies count
    const { data: currentThread } = await supabase
      .from("forum_threads")
      .select("replies")
      .eq("id", data.threadId)
      .single()
    
    if (currentThread) {
      await supabase
        .from("forum_threads")
        .update({ replies: (currentThread.replies || 0) + 1 })
        .eq("id", data.threadId)
    }

    // Award XP for creating reply
    if (reply) {
      await awardXP(discordId, 'CREATE_REPLY')

      // Award XP to thread author for receiving reply
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('author_id, users!forum_threads_author_id_fkey(discord_id)')
        .eq('id', data.threadId)
        .single()
      
      if (thread && thread.author_id !== dbUser.id) {
        // Get thread author's discord_id for XP
        const authorDiscordId = (thread as any).users?.discord_id
        if (authorDiscordId) {
          await awardXP(authorDiscordId, 'RECEIVE_REPLY')
        }
      }
    }

    return reply
  } catch (error) {
    console.error("Error creating reply:", error)
    throw new Error("Failed to create reply")
  }
}

export async function deleteForumThread(threadId: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = createAdminClient()

    // Check if user is author or admin
    const { data: thread } = await supabase
      .from("forum_threads")
      .select("author_id")
      .eq("id", threadId)
      .single()

    if (!thread) throw new Error("Thread not found")

    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("discord_id", user.id)
      .single()

    const threadData = thread as { author_id: string }
    const userAdminData = userData as { is_admin: boolean } | null

    if (threadData.author_id !== user.id && !userAdminData?.is_admin) {
      throw new Error("Unauthorized")
    }

    await supabase
      .from("forum_threads")
      .update({ is_deleted: true })
      .eq("id", threadId)

    return { success: true }
  } catch (error) {
    console.error("Error deleting thread:", error)
    throw error
  }
}

export async function deleteForumReply(replyId: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    const supabase = createAdminClient()

    const { data: reply } = await supabase
      .from("forum_replies")
      .select("author_id")
      .eq("id", replyId)
      .single()

    if (!reply) throw new Error("Reply not found")

    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("discord_id", user.id)
      .single()

    const replyData = reply as { author_id: string }
    const userAdminData = userData as { is_admin: boolean } | null

    if (replyData.author_id !== user.id && !userAdminData?.is_admin) {
      throw new Error("Unauthorized")
    }

    await supabase
      .from("forum_replies")
      .update({ is_deleted: true })
      .eq("id", replyId)

    return { success: true }
  } catch (error) {
    console.error("Error deleting reply:", error)
    throw error
  }
}

export async function getOnlineUsers() {
  try {
    const supabase = createAdminClient()
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership")
      .eq("is_banned", false)
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", { ascending: false })
      .limit(20)

    if (error) throw error
    return (data || []).map(u => ({
      id: u.discord_id,
      username: u.username,
      avatar: u.avatar,
      membership: u.membership,
      is_online: true,
    }))
  } catch (error) {
    console.error("Error fetching online users:", error)
    return []
  }
}

export async function getTopContributors() {
  try {
    const supabase = createAdminClient()

    // Get users with their thread and reply counts
    const { data: users } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership")
      .eq("is_banned", false)
      .limit(100)

    if (!users || users.length === 0) return []

    const ids = users.map(u => u.discord_id)

    const { data: threads } = await supabase
      .from("forum_threads")
      .select("author_id")
      .in("author_id", ids)
      .eq("is_deleted", false)

    const { data: replies } = await supabase
      .from("forum_replies")
      .select("author_id")
      .in("author_id", ids)
      .eq("is_deleted", false)

    const threadCounts: Record<string, number> = {}
    const replyCounts: Record<string, number> = {}

    for (const t of threads || []) {
      threadCounts[t.author_id] = (threadCounts[t.author_id] || 0) + 1
    }

    for (const r of replies || []) {
      replyCounts[r.author_id] = (replyCounts[r.author_id] || 0) + 1
    }

    const contributors = users.map(u => ({
      id: u.discord_id,
      username: u.username,
      avatar: u.avatar,
      membership: u.membership,
      threads: threadCounts[u.discord_id] || 0,
      replies: replyCounts[u.discord_id] || 0,
      points: (threadCounts[u.discord_id] || 0) * 10 + (replyCounts[u.discord_id] || 0) * 5,
    }))

    return contributors
      .filter(c => c.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
  } catch (error) {
    console.error("Error fetching top contributors:", error)
    return []
  }
}
