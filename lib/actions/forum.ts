'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getForumCategories() {
  const result = await db.query(
    `SELECT 
      c.*,
      COUNT(DISTINCT t.id) as thread_count,
      COUNT(DISTINCT r.id) as post_count
    FROM forum_categories c
    LEFT JOIN forum_threads t ON c.id = t.category_id AND t.status = 'approved'
    LEFT JOIN forum_replies r ON t.id = r.thread_id
    GROUP BY c.id
    ORDER BY c.display_order ASC`
  )
  return result.rows
}

export async function getForumThreads(categoryId?: string, limit = 50) {
  const query = categoryId
    ? 'SELECT t.*, u.username, u.avatar, (SELECT COUNT(*) FROM forum_replies WHERE thread_id = t.id) as reply_count FROM forum_threads t JOIN users u ON t.author_id = u.discord_id WHERE t.category_id = $1 ORDER BY t.pinned DESC, t.updated_at DESC LIMIT $2'
    : 'SELECT t.*, u.username, u.avatar, (SELECT COUNT(*) FROM forum_replies WHERE thread_id = t.id) as reply_count FROM forum_threads t JOIN users u ON t.author_id = u.discord_id ORDER BY t.pinned DESC, t.updated_at DESC LIMIT $1'

  const params = categoryId ? [categoryId, limit] : [limit]
  const result = await db.query(query, params)
  return result.rows
}

export async function getForumThread(threadId: string) {
  const result = await db.query(
    'SELECT t.*, u.username, u.avatar FROM forum_threads t JOIN users u ON t.author_id = u.discord_id WHERE t.id = $1',
    [threadId]
  )
  return result.rows[0] || null
}

export async function getForumReplies(threadId: string) {
  const result = await db.query(
    'SELECT r.*, u.username, u.avatar, u.membership FROM forum_replies r JOIN users u ON r.author_id = u.discord_id WHERE r.thread_id = $1 ORDER BY r.created_at ASC',
    [threadId]
  )
  return result.rows
}

export async function createForumThread(data: { categoryId: string; title: string; content: string }) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const result = await db.query(
    'INSERT INTO forum_threads (category_id, author_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.categoryId, user.id, data.title, data.content]
  )

  return result.rows[0]
}

export async function createForumReply(data: { threadId: string; content: string }) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const result = await db.query(
    'INSERT INTO forum_replies (thread_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
    [data.threadId, user.id, data.content]
  )

  // Update thread updated_at
  await db.query(
    'UPDATE forum_threads SET updated_at = NOW() WHERE id = $1',
    [data.threadId]
  )

  return result.rows[0]
}

export async function deleteForumThread(threadId: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if user is author or admin
  const thread = await db.query(
    'SELECT author_id FROM forum_threads WHERE id = $1',
    [threadId]
  )

  if (!thread.rows[0]) throw new Error('Thread not found')

  const isAdmin = await db.query(
    'SELECT is_admin FROM users WHERE discord_id = $1',
    [user.id]
  )

  if (thread.rows[0].author_id !== user.id && !isAdmin.rows[0]?.is_admin) {
    throw new Error('Unauthorized')
  }

  await db.query('DELETE FROM forum_threads WHERE id = $1', [threadId])
  return { success: true }
}

export async function deleteForumReply(replyId: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const reply = await db.query(
    'SELECT author_id FROM forum_replies WHERE id = $1',
    [replyId]
  )

  if (!reply.rows[0]) throw new Error('Reply not found')

  const isAdmin = await db.query(
    'SELECT is_admin FROM users WHERE discord_id = $1',
    [user.id]
  )

  if (reply.rows[0].author_id !== user.id && !isAdmin.rows[0]?.is_admin) {
    throw new Error('Unauthorized')
  }

  await db.query('DELETE FROM forum_replies WHERE id = $1', [replyId])
  return { success: true }
}

export async function getOnlineUsers() {
  const result = await db.query(`
    SELECT 
      discord_id as id,
      username,
      avatar,
      membership,
      true as is_online
    FROM users
    WHERE last_seen > NOW() - INTERVAL '5 minutes'
    ORDER BY last_seen DESC
    LIMIT 20
  `)
  return result.rows
}

export async function getTopContributors() {
  const result = await db.query(`
    SELECT 
      u.discord_id as id,
      u.username,
      u.avatar,
      u.membership,
      COUNT(DISTINCT t.id) as threads,
      COUNT(DISTINCT r.id) as replies,
      0 as assets,
      (COUNT(DISTINCT t.id) * 10 + COUNT(DISTINCT r.id) * 5) as points
    FROM users u
    LEFT JOIN forum_threads t ON u.discord_id = t.author_id
    LEFT JOIN forum_replies r ON u.discord_id = r.author_id
    GROUP BY u.discord_id, u.username, u.avatar, u.membership
    HAVING COUNT(DISTINCT t.id) > 0 OR COUNT(DISTINCT r.id) > 0
    ORDER BY points DESC
    LIMIT 10
  `)
  return result.rows
}
