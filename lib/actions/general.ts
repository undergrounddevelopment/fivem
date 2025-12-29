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

export async function getNotifications() {
  const user = await getUser()
  if (!user) return []

  const result = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [user.id]
  )
  return result.rows
}

export async function markNotificationRead(notificationId: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  await db.query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
    [notificationId, user.id]
  )

  return { success: true }
}

export async function markAllNotificationsRead() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  await db.query(
    'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
    [user.id]
  )

  return { success: true }
}

export async function getAnnouncements() {
  const result = await db.query(
    'SELECT * FROM announcements WHERE active = true ORDER BY created_at DESC LIMIT 10'
  )
  return result.rows
}

export async function getTestimonials() {
  const result = await db.query(
    'SELECT * FROM testimonials WHERE active = true ORDER BY created_at DESC LIMIT 20'
  )
  return result.rows
}

export async function getBanners() {
  const result = await db.query(
    'SELECT * FROM banners WHERE active = true ORDER BY display_order ASC'
  )
  return result.rows
}

export async function getAssets(category?: string) {
  const query = category
    ? 'SELECT * FROM assets WHERE category = $1 AND active = true ORDER BY created_at DESC'
    : 'SELECT * FROM assets WHERE active = true ORDER BY created_at DESC'

  const params = category ? [category] : []
  const result = await db.query(query, params)
  return result.rows
}

export async function getSiteSettings() {
  const result = await db.query('SELECT * FROM site_settings LIMIT 1')
  return result.rows[0] || null
}

export async function getCoinTransactions(limit = 50) {
  const user = await getUser()
  if (!user) return []

  const result = await db.query(
    'SELECT * FROM coin_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [user.id, limit]
  )
  return result.rows
}

export async function getUserProfile(userId?: string) {
  const user = await getUser()
  const targetUserId = userId || user?.id

  if (!targetUserId) return null

  const result = await db.query(
    'SELECT discord_id, username, email, avatar, membership, coins, created_at FROM users WHERE discord_id = $1',
    [targetUserId]
  )

  if (!result.rows[0]) return null

  // Get stats
  const [threads, replies, spins] = await Promise.all([
    db.query('SELECT COUNT(*)::int as count FROM forum_threads WHERE author_id = $1', [targetUserId]),
    db.query('SELECT COUNT(*)::int as count FROM forum_replies WHERE author_id = $1', [targetUserId]),
    db.query('SELECT COUNT(*)::int as count FROM spin_wheel_history WHERE user_id = $1', [targetUserId])
  ])

  return {
    ...result.rows[0],
    stats: {
      threads: threads.rows[0].count,
      replies: replies.rows[0].count,
      spins: spins.rows[0].count
    }
  }
}

export async function updateUserProfile(data: { username?: string; email?: string }) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.username) {
    updates.push(`username = $${paramIndex}`)
    values.push(data.username)
    paramIndex++
  }

  if (data.email) {
    updates.push(`email = $${paramIndex}`)
    values.push(data.email)
    paramIndex++
  }

  if (updates.length === 0) return { success: false }

  values.push(user.id)
  await db.query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE discord_id = $${paramIndex}`,
    values
  )

  return { success: true }
}

export async function createTestimonial(data: { name: string; role: string; content: string; rating: number; avatar?: string }) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const result = await db.query(
    'INSERT INTO testimonials (name, role, content, rating, avatar, active) VALUES ($1, $2, $3, $4, $5, false) RETURNING *',
    [data.name, data.role, data.content, data.rating, data.avatar]
  )

  return result.rows[0]
}

export async function updateTestimonial(id: string, data: { name?: string; role?: string; content?: string; rating?: number; avatar?: string; active?: boolean }) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const isAdmin = await db.query('SELECT is_admin FROM users WHERE discord_id = $1', [user.id])
  if (!isAdmin.rows[0]?.is_admin) throw new Error('Admin access required')

  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  if (updates.length === 0) return { success: false }

  values.push(id)
  await db.query(
    `UPDATE testimonials SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values
  )

  return { success: true }
}

export async function deleteTestimonial(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const isAdmin = await db.query('SELECT is_admin FROM users WHERE discord_id = $1', [user.id])
  if (!isAdmin.rows[0]?.is_admin) throw new Error('Admin access required')

  await db.query('DELETE FROM testimonials WHERE id = $1', [id])
  return { success: true }
}

export async function getStats() {
  const [users, threads, replies, assets, onlineUsers] = await Promise.all([
    db.query('SELECT COUNT(*)::int as count FROM users'),
    db.query('SELECT COUNT(*)::int as count FROM forum_threads'),
    db.query('SELECT COUNT(*)::int as count FROM forum_replies'),
    db.query('SELECT COUNT(*)::int as count FROM assets WHERE active = true'),
    db.query("SELECT COUNT(*)::int as count FROM users WHERE last_seen > NOW() - INTERVAL '5 minutes'")
  ])

  return {
    totalUsers: users.rows[0].count,
    totalThreads: threads.rows[0].count,
    totalPosts: replies.rows[0].count,
    totalAssets: assets.rows[0].count,
    onlineUsers: onlineUsers.rows[0].count
  }
}

export async function updateUserHeartbeat() {
  const user = await getUser()
  if (!user) return { success: false }

  await db.query(
    'UPDATE users SET last_seen = NOW() WHERE discord_id = $1',
    [user.id]
  )

  return { success: true }
}

export async function getPublicAnnouncements() {
  const result = await db.query(
    'SELECT * FROM announcements WHERE active = true AND type = $1 ORDER BY created_at DESC LIMIT 5',
    ['public']
  )
  return result.rows
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  await db.query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
    [notificationId, user.id]
  )

  return { success: true }
}
