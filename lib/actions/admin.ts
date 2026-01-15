"use server"

import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getUser() {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { id: session.user.id, isAdmin: session.user.isAdmin }
  }
  return null
}

async function checkAdmin() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = getSupabase()
  
  // Try to find user by discord_id
  let { data, error } = await supabase
    .from("users")
    .select("id, discord_id, is_admin, membership")
    .eq("discord_id", user.id)
    .single()

  // If not found, try by UUID
  if (error || !data) {
    const { data: byUuid } = await supabase
      .from("users")
      .select("id, discord_id, is_admin, membership")
      .eq("id", user.id)
      .single()
    
    if (byUuid) data = byUuid
  }

  // Check if user is admin
  const isAdmin = data?.is_admin === true || 
                  data?.membership === "admin" || 
                  user.isAdmin === true ||
                  user.id === process.env.ADMIN_DISCORD_ID

  if (!isAdmin) {
    console.log("[Admin Check] Access denied for:", user.id, "Data:", data)
    throw new Error("Admin access required")
  }

  console.log("[Admin Check] Access granted for:", user.id)
  return { id: user.id, dbId: data?.id }
}

export async function getAdminStats() {
  await checkAdmin()
  const supabase = getSupabase()

  const [usersCount, threadsCount, repliesCount, assetsCount, coinsSum] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("coin_transactions").select("amount"),
  ])

  const totalCoins = coinsSum.data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

  return {
    totalUsers: usersCount.count || 0,
    totalThreads: threadsCount.count || 0,
    totalReplies: repliesCount.count || 0,
    totalAssets: assetsCount.count || 0,
    totalTransactions: coinsSum.data?.length || 0,
    totalCoins,
  }
}

export async function getAllUsers(limit = 100) {
  await checkAdmin()
  const supabase = getSupabase()

  const { data } = await supabase
    .from("users")
    .select("id, discord_id, username, email, avatar, membership, coins, is_admin, created_at, is_banned")
    .order("created_at", { ascending: false })
    .limit(limit)
  
  return data || []
}

export async function updateUserMembership(userId: string, membership: string) {
  await checkAdmin()
  const supabase = getSupabase()

  // Try discord_id first, then UUID
  let { error } = await supabase
    .from("users")
    .update({ membership, updated_at: new Date().toISOString() })
    .eq("discord_id", userId)

  if (error) {
    await supabase
      .from("users")
      .update({ membership, updated_at: new Date().toISOString() })
      .eq("id", userId)
  }

  return { success: true }
}

export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  await checkAdmin()
  const supabase = getSupabase()

  await supabase
    .from("users")
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq("discord_id", userId)

  return { success: true }
}

export async function addCoinsToUser(userId: string, amount: number, description: string) {
  await checkAdmin()
  const supabase = getSupabase()

  // Get current coins
  const { data: user } = await supabase
    .from("users")
    .select("coins")
    .eq("discord_id", userId)
    .single()

  const newCoins = (user?.coins || 0) + amount

  // Update coins
  await supabase
    .from("users")
    .update({ coins: newCoins, updated_at: new Date().toISOString() })
    .eq("discord_id", userId)

  // Log transaction
  await supabase.from("coin_transactions").insert({
    user_id: userId,
    amount,
    type: "admin",
    description,
    created_at: new Date().toISOString()
  })

  return { success: true }
}

export async function checkIsAdmin() {
  const user = await getUser()
  if (!user) return { isAdmin: false }

  const supabase = getSupabase()
  const { data } = await supabase
    .from("users")
    .select("is_admin, membership")
    .eq("discord_id", user.id)
    .single()

  const isAdmin = data?.is_admin === true || 
                  data?.membership === "admin" || 
                  user.isAdmin === true ||
                  user.id === process.env.ADMIN_DISCORD_ID

  return { isAdmin }
}

export async function getAdminDashboardStats() {
  await checkAdmin()
  const supabase = getSupabase()

  const [users, threads, replies, assets, spins, coinsSum] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    supabase.from("forum_replies").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("spin_history").select("*", { count: "exact", head: true }),
    supabase.from("coin_transactions").select("amount"),
  ])

  const totalCoins = coinsSum.data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

  return {
    totalUsers: users.count || 0,
    totalThreads: threads.count || 0,
    totalReplies: replies.count || 0,
    totalAssets: assets.count || 0,
    totalCoins,
    totalSpins: spins.count || 0,
  }
}

export async function getAdminAssets() {
  await checkAdmin()
  const supabase = getSupabase()

  const { data } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
  
  return data || []
}

export async function getPendingAssets() {
  await checkAdmin()
  const supabase = getSupabase()

  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
  
  return data || []
}

export async function approveAsset(assetId: string) {
  await checkAdmin()
  const supabase = getSupabase()

  await supabase
    .from("assets")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", assetId)

  return { success: true }
}

export async function deleteAsset(assetId: string) {
  await checkAdmin()
  const supabase = getSupabase()

  await supabase.from("assets").delete().eq("id", assetId)
  return { success: true }
}

export async function getCoinTransactionsAdmin(limit = 100) {
  await checkAdmin()
  const supabase = getSupabase()

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
    username: usersMap[t.user_id]?.username || "Unknown",
  }))
}

export async function banUser(userId: string, reason: string) {
  await checkAdmin()
  const supabase = getSupabase()

  await supabase
    .from("users")
    .update({ 
      is_banned: true, 
      ban_reason: reason,
      updated_at: new Date().toISOString() 
    })
    .eq("discord_id", userId)

  return { success: true }
}

export async function unbanUser(userId: string) {
  await checkAdmin()
  const supabase = getSupabase()

  await supabase
    .from("users")
    .update({ 
      is_banned: false, 
      ban_reason: null,
      updated_at: new Date().toISOString() 
    })
    .eq("discord_id", userId)

  return { success: true }
}
