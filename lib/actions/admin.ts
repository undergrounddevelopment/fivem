"use server"

import { db } from "@/lib/db"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getUser() {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { id: session.user.id }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function checkAdmin() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .select("is_admin, membership")
    .eq("discord_id", user.id)
    .single()

  if (error) throw new Error("Admin access required")
  if (!(data?.is_admin === true || data?.membership === "admin")) throw new Error("Admin access required")
  return user
}

export async function getAdminStats() {
  await checkAdmin()

  const supabase = createAdminClient()
  const [usersCount, threadsCount, repliesCount, ticketsCount, coinsSum] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }),
    supabase.from("spin_wheel_tickets").select("*", { count: "exact", head: true }).eq("is_used", false),
    supabase.from("coin_transactions").select("amount"),
  ])

  const totalCoins = coinsSum.data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
  const totalTransactions = coinsSum.data?.length || 0

  return {
    totalUsers: usersCount.count || 0,
    totalThreads: threadsCount.count || 0,
    totalReplies: repliesCount.count || 0,
    totalTransactions,
    totalCoins,
    activeTickets: ticketsCount.count || 0,
  }
}

export async function getAllUsers(limit = 100) {
  await checkAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("users")
    .select("discord_id, username, email, avatar, membership, coins, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
  return data || []
}

export async function updateUserMembership(userId: string, membership: string) {
  await checkAdmin()

  const supabase = createAdminClient()
  await supabase.from("users").update({ membership, updated_at: new Date().toISOString() }).eq("discord_id", userId)
  return { success: true }
}

export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  await checkAdmin()

  const supabase = createAdminClient()
  await supabase.from("users").update({ is_admin: isAdmin, updated_at: new Date().toISOString() }).eq("discord_id", userId)
  return { success: true }
}

export async function addCoinsToUser(userId: string, amount: number, description: string) {
  await checkAdmin()

  await db.coins.addCoins({
    user_id: userId,
    amount,
    type: "admin",
    description,
  })
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

  const supabase = createAdminClient()
  const { data: prize, error } = await supabase
    .from("spin_wheel_prizes")
    .insert({
      name: data.name,
      type: data.type,
      value: data.value,
      probability: data.probability,
      color: data.color,
      rarity: data.rarity,
      image_url: data.imageUrl || null,
      is_active: true,
      sort_order: 0,
    })
    .select()
    .single()

  if (error) throw error
  return prize
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

  const supabase = createAdminClient()
  const updates: any = {}

  if (data.name !== undefined) updates.name = data.name
  if (data.type !== undefined) updates.type = data.type
  if (data.value !== undefined) updates.value = data.value
  if (data.probability !== undefined) updates.probability = data.probability
  if (data.color !== undefined) updates.color = data.color
  if (data.rarity !== undefined) updates.rarity = data.rarity
  if (data.imageUrl !== undefined) updates.image_url = data.imageUrl
  if (data.active !== undefined) updates.is_active = data.active
  updates.updated_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) return { success: false }

  const { error } = await supabase.from("spin_wheel_prizes").update(updates).eq("id", prizeId)
  if (error) throw error
  return { success: true }
}

export async function deleteSpinPrize(prizeId: string) {
  await checkAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from("spin_wheel_prizes").delete().eq("id", prizeId)
  if (error) throw error
  return { success: true }
}

export async function createAnnouncement(data: { title: string; content: string; type: string }) {
  await checkAdmin()

  const supabase = createAdminClient()
  const { data: row, error } = await supabase
    .from("announcements")
    .insert({
      title: data.title,
      content: data.content,
      type: data.type,
      is_active: true,
      is_dismissible: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return row
}

export async function updateAnnouncement(
  id: string,
  data: { title?: string; content?: string; type?: string; active?: boolean },
) {
  await checkAdmin()

  const supabase = createAdminClient()
  const updates: any = {}
  if (data.title !== undefined) updates.title = data.title
  if (data.content !== undefined) updates.content = data.content
  if (data.type !== undefined) updates.type = data.type
  if (data.active !== undefined) updates.is_active = data.active
  updates.updated_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) return { success: false }

  const { error } = await supabase.from("announcements").update(updates).eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  await checkAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from("announcements").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function checkIsAdmin() {
  const user = await getUser()
  if (!user) return { isAdmin: false }

  const isAdmin = await db.admin.isAdmin(user.id)
  return { isAdmin }
}

export async function getAdminDashboardStats() {
  await checkAdmin()

  const supabase = createAdminClient()
  const [users, threads, replies, tickets, spins, coinsSum] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }),
    supabase.from("spin_wheel_tickets").select("*", { count: "exact", head: true }).eq("is_used", false),
    supabase.from("spin_history").select("*", { count: "exact", head: true }),
    supabase.from("coin_transactions").select("amount"),
  ])

  const totalCoins = coinsSum.data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

  return {
    totalUsers: users.count || 0,
    totalThreads: threads.count || 0,
    totalReplies: replies.count || 0,
    totalCoins,
    activeTickets: tickets.count || 0,
    totalSpins: spins.count || 0,
  }
}

export async function getAdminAssets() {
  await checkAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase.from("assets").select("*").order("created_at", { ascending: false }).limit(100)
  return data || []
}

export async function getPendingAssets() {
  await checkAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
  return data || []
}

export async function approveAsset(assetId: string) {
  await checkAdmin()

  const supabase = createAdminClient()
  await supabase.from("assets").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", assetId)
  return { success: true }
}

export async function deleteAsset(assetId: string) {
  await checkAdmin()

  const supabase = createAdminClient()
  await supabase.from("assets").delete().eq("id", assetId)
  return { success: true }
}

export async function getCoinTransactionsAdmin(limit = 100) {
  await checkAdmin()

  const supabase = createAdminClient()
  const { data: txs } = await supabase
    .from("coin_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  const userIds = [...new Set((txs || []).map((t: any) => t.user_id).filter(Boolean))]
  let usersMap: Record<string, any> = {}
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("discord_id, username")
      .in("discord_id", userIds)
    for (const u of users || []) {
      usersMap[u.discord_id] = u
    }
  }

  return (txs || []).map((t: any) => ({
    ...t,
    username: usersMap[t.user_id]?.username,
  }))
}

export async function getPendingThreads() {
  await checkAdmin()

  return await db.admin.getPendingThreads(100, 0)
}

export async function approveThread(threadId: string) {
  const admin = await checkAdmin()
  await db.admin.approveThread(threadId, admin.id)
  return { success: true }
}

export async function rejectThread(threadId: string) {
  await checkAdmin()

  await db.admin.rejectThread(threadId, "Rejected by admin")
  return { success: true }
}
