'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

async function hydrateUsersByDiscordIds(supabase: any, ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return new Map<string, any>()

  const { data, error } = await supabase
    .from('users')
    .select('discord_id, username, avatar, membership')
    .in('discord_id', unique)

  if (error) throw error

  const map = new Map<string, any>()
  for (const u of data || []) map.set(u.discord_id, u)
  return map
}

async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
}

export async function getForumCategories() {
  const supabase = getSupabaseAdminClient()

  const { data: categories, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error

  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat: any) => {
      const { count: threadCount } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'approved')
        .eq('is_deleted', false)

      return {
        ...cat,
        thread_count: threadCount || 0,
        post_count: 0,
      }
    }),
  )

  return categoriesWithCounts
}

export async function getForumThreads(categoryId?: string, limit = 50) {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from('forum_threads')
    .select('*')
    .eq('status', 'approved')
    .eq('is_deleted', false)

  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const threads = data || []
  const usersByDiscordId = await hydrateUsersByDiscordIds(
    supabase,
    threads.map((t: any) => t.author_id),
  )

  return threads.map((t: any) => ({
    ...t,
    users: usersByDiscordId.get(t.author_id) || null,
  }))
}

export async function getForumThread(threadId: string) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('id', threadId)
    .single()

  if (error) throw error
  if (!data) return null

  const usersByDiscordId = await hydrateUsersByDiscordIds(supabase, [data.author_id])
  return {
    ...data,
    users: usersByDiscordId.get(data.author_id) || null,
  }
}

export async function getForumReplies(threadId: string) {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('forum_replies')
    .select('*')
    .eq('thread_id', threadId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) throw error

  const replies = data || []
  const usersByDiscordId = await hydrateUsersByDiscordIds(
    supabase,
    replies.map((r: any) => r.author_id),
  )

  return replies.map((r: any) => ({
    ...r,
    users: usersByDiscordId.get(r.author_id) || null,
  }))
}

export async function createForumThread(data: { categoryId: string; title: string; content: string }) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const supabase = getSupabaseAdminClient()
  const { data: thread, error } = await supabase
    .from('forum_threads')
    .insert({
      category_id: data.categoryId,
      author_id: userId,
      title: data.title,
      content: data.content,
      status: 'pending',
      is_deleted: false,
    })
    .select('*')
    .single()

  if (error) throw error
  return thread
}

export async function createForumReply(data: { threadId: string; content: string }) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const supabase = getSupabaseAdminClient()

  const { data: reply, error } = await supabase
    .from('forum_replies')
    .insert({
      thread_id: data.threadId,
      author_id: userId,
      content: data.content,
      is_deleted: false,
    })
    .select('*')
    .single()

  if (error) throw error

  await supabase
    .from('forum_threads')
    .update({
      updated_at: new Date().toISOString(),
      last_reply_at: new Date().toISOString(),
      last_reply_by: userId,
    })
    .eq('id', data.threadId)

  return reply
}

export async function deleteForumThread(threadId: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const supabase = getSupabaseAdminClient()

  const { data: thread, error: threadError } = await supabase
    .from('forum_threads')
    .select('id, author_id')
    .eq('id', threadId)
    .single()

  if (threadError || !thread) throw new Error('Thread not found')

  const { data: adminRow } = await supabase
    .from('users')
    .select('is_admin, membership')
    .eq('discord_id', userId)
    .single()

  const isAdmin = adminRow?.is_admin === true || adminRow?.membership === 'admin'

  if (thread.author_id !== userId && !isAdmin) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('forum_threads')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', threadId)

  if (error) throw error
  return { success: true }
}

export async function deleteForumReply(replyId: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const supabase = getSupabaseAdminClient()

  const { data: reply, error: replyError } = await supabase
    .from('forum_replies')
    .select('id, author_id')
    .eq('id', replyId)
    .single()

  if (replyError || !reply) throw new Error('Reply not found')

  const { data: adminRow } = await supabase
    .from('users')
    .select('is_admin, membership')
    .eq('discord_id', userId)
    .single()

  const isAdmin = adminRow?.is_admin === true || adminRow?.membership === 'admin'

  if (reply.author_id !== userId && !isAdmin) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('forum_replies')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', replyId)

  if (error) throw error
  return { success: true }
}

export async function getOnlineUsers() {
  const supabase = getSupabaseAdminClient()
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('users')
    .select('discord_id, username, avatar, membership, last_seen')
    .eq('is_banned', false)
    .gte('last_seen', fiveMinutesAgo)
    .order('last_seen', { ascending: false })
    .limit(20)

  if (error) throw error

  return (data || []).map((u: any) => ({
    id: u.discord_id,
    username: u.username,
    avatar: u.avatar,
    membership: u.membership,
    isOnline: true,
  }))
}

export async function getTopContributors() {
  const supabase = getSupabaseAdminClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('discord_id, username, avatar, membership')
    .eq('is_banned', false)
    .limit(200)

  if (error) throw error

  const { data: recentThreads } = await supabase
    .from('forum_threads')
    .select('author_id')
    .eq('is_deleted', false)
    .limit(1000)

  const { data: recentReplies } = await supabase
    .from('forum_replies')
    .select('author_id')
    .eq('is_deleted', false)
    .limit(2000)

  const threadCounts: Record<string, number> = {}
  const replyCounts: Record<string, number> = {}

  for (const t of recentThreads || []) {
    if (!t.author_id) continue
    threadCounts[t.author_id] = (threadCounts[t.author_id] || 0) + 1
  }

  for (const r of recentReplies || []) {
    if (!r.author_id) continue
    replyCounts[r.author_id] = (replyCounts[r.author_id] || 0) + 1
  }

  const contributors = (users || []).map((u: any) => {
    const threads = threadCounts[u.discord_id] || 0
    const replies = replyCounts[u.discord_id] || 0
    const points = threads * 10 + replies * 5
    return {
      id: u.discord_id,
      username: u.username,
      avatar: u.avatar,
      membership: u.membership,
      points,
      threads,
      replies,
      assets: 0,
    }
  })

  contributors.sort((a, b) => b.points - a.points)
  return contributors.slice(0, 10)
}
