"use server"

import { db } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function checkAdmin() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const result = await db.query("SELECT is_admin FROM users WHERE discord_id = $1", [user.id])

  if (!result.rows[0]?.is_admin) throw new Error("Admin access required")
  return user
}

export async function getAdminStats() {
  await checkAdmin()

  const [users, threads, replies, transactions, tickets] = await Promise.all([
    db.query("SELECT COUNT(*)::int as count FROM users"),
    db.query("SELECT COUNT(*)::int as count FROM forum_threads"),
    db.query("SELECT COUNT(*)::int as count FROM forum_replies"),
    db.query("SELECT COUNT(*)::int as count, COALESCE(SUM(amount), 0)::int as total FROM coin_transactions"),
    db.query("SELECT COUNT(*)::int as count FROM spin_wheel_tickets WHERE used = false"),
  ])

  return {
    totalUsers: users.rows[0].count,
    totalThreads: threads.rows[0].count,
    totalReplies: replies.rows[0].count,
    totalTransactions: transactions.rows[0].count,
    totalCoins: transactions.rows[0].total,
    activeTickets: tickets.rows[0].count,
  }
}

export async function getAllUsers(limit = 100) {
  await checkAdmin()

  const result = await db.query(
    "SELECT discord_id, username, email, avatar, membership, coins, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT $1",
    [limit],
  )
  return result.rows
}

export async function updateUserMembership(userId: string, membership: string) {
  await checkAdmin()

  await db.query("UPDATE users SET membership = $1, updated_at = NOW() WHERE discord_id = $2", [membership, userId])

  return { success: true }
}

export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  await checkAdmin()

  await db.query("UPDATE users SET is_admin = $1, updated_at = NOW() WHERE discord_id = $2", [isAdmin, userId])

  return { success: true }
}

export async function addCoinsToUser(userId: string, amount: number, description: string) {
  await checkAdmin()

  await db.query(
    "INSERT INTO coin_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)",
    [userId, amount, "admin", description],
  )

  return { success: true }
}

export async function createSpinPrize(data: {
  name: string
  type: string
  value: number
  probability: number
  color: string
  rarity: string
  imageUrl?: string
}) {
  await checkAdmin()

  const result = await db.query(
    "INSERT INTO spin_wheel_prizes (name, type, value, probability, color, rarity, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [data.name, data.type, data.value, data.probability, data.color, data.rarity, data.imageUrl],
  )

  return result.rows[0]
}

export async function updateSpinPrize(
  prizeId: string,
  data: {
    name?: string
    type?: string
    value?: number
    probability?: number
    color?: string
    rarity?: string
    imageUrl?: string
    active?: boolean
  },
) {
  await checkAdmin()

  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      const dbKey = key === "imageUrl" ? "image_url" : key.replace(/([A-Z])/g, "_$1").toLowerCase()
      updates.push(`${dbKey} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  if (updates.length === 0) return { success: false }

  values.push(prizeId)
  await db.query(
    `UPDATE spin_wheel_prizes SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values,
  )

  return { success: true }
}

export async function deleteSpinPrize(prizeId: string) {
  await checkAdmin()

  await db.query("DELETE FROM spin_wheel_prizes WHERE id = $1", [prizeId])
  return { success: true }
}

export async function createAnnouncement(data: { title: string; content: string; type: string }) {
  await checkAdmin()

  const result = await db.query("INSERT INTO announcements (title, content, type) VALUES ($1, $2, $3) RETURNING *", [
    data.title,
    data.content,
    data.type,
  ])

  return result.rows[0]
}

export async function updateAnnouncement(
  id: string,
  data: { title?: string; content?: string; type?: string; active?: boolean },
) {
  await checkAdmin()

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
  await db.query(`UPDATE announcements SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${paramIndex}`, values)

  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  await checkAdmin()

  await db.query("DELETE FROM announcements WHERE id = $1", [id])
  return { success: true }
}

export async function checkIsAdmin() {
  const user = await getUser()
  if (!user) return { isAdmin: false }

  const result = await db.query("SELECT is_admin FROM users WHERE discord_id = $1", [user.id])

  return { isAdmin: result.rows[0]?.is_admin || false }
}

export async function getAdminDashboardStats() {
  await checkAdmin()

  const [users, threads, replies, coins, tickets, spins] = await Promise.all([
    db.query("SELECT COUNT(*)::int as count FROM users"),
    db.query("SELECT COUNT(*)::int as count FROM forum_threads"),
    db.query("SELECT COUNT(*)::int as count FROM forum_replies"),
    db.query("SELECT COALESCE(SUM(amount), 0)::int as total FROM coin_transactions"),
    db.query("SELECT COUNT(*)::int as count FROM spin_wheel_tickets WHERE used = false"),
    db.query("SELECT COUNT(*)::int as count FROM spin_wheel_history"),
  ])

  return {
    totalUsers: users.rows[0].count,
    totalThreads: threads.rows[0].count,
    totalReplies: replies.rows[0].count,
    totalCoins: coins.rows[0].total,
    activeTickets: tickets.rows[0].count,
    totalSpins: spins.rows[0].count,
  }
}

export async function getAdminAssets() {
  await checkAdmin()

  const result = await db.query("SELECT * FROM assets ORDER BY created_at DESC LIMIT 100")
  return result.rows
}

export async function getPendingAssets() {
  await checkAdmin()

  const result = await db.query("SELECT * FROM assets WHERE is_active = false ORDER BY created_at DESC")
  return result.rows
}

export async function approveAsset(assetId: string) {
  await checkAdmin()

  await db.query("UPDATE assets SET is_active = true, updated_at = NOW() WHERE id = $1", [assetId])

  return { success: true }
}

export async function deleteAsset(assetId: string) {
  await checkAdmin()

  await db.query("DELETE FROM assets WHERE id = $1", [assetId])
  return { success: true }
}

export async function getCoinTransactionsAdmin(limit = 100) {
  await checkAdmin()

  const result = await db.query(
    "SELECT ct.*, u.username FROM coin_transactions ct JOIN users u ON ct.user_id = u.discord_id ORDER BY ct.created_at DESC LIMIT $1",
    [limit],
  )
  return result.rows
}

export async function getPendingThreads() {
  await checkAdmin()

  const result = await db.query(
    `SELECT t.*, u.username, u.avatar 
     FROM forum_threads t 
     JOIN users u ON t.author_id = u.discord_id 
     WHERE t.status = 'pending' 
     ORDER BY t.created_at DESC`,
  )
  return result.rows
}

export async function approveThread(threadId: string) {
  await checkAdmin()

  await db.query("UPDATE forum_threads SET status = 'approved', updated_at = NOW() WHERE id = $1", [threadId])

  return { success: true }
}

export async function rejectThread(threadId: string) {
  await checkAdmin()

  await db.query("UPDATE forum_threads SET status = 'rejected', updated_at = NOW() WHERE id = $1", [threadId])

  return { success: true }
}
