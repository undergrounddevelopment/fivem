'use server'

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const supabase = getSupabaseAdminClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('is_admin, role, membership')
    .eq('discord_id', userId)
    .single()

  if (error) throw error

  const isAdmin =
    user?.is_admin === true || user?.membership === 'admin' || ['admin', 'owner'].includes((user?.role as string) || '')

  if (!isAdmin) throw new Error('Admin access required')

  return { supabase, userId }
}

export async function getAdminStats() {
  const { supabase } = await requireAdmin()

  const [usersCount, threadsCount, repliesCount, transactionsCount, ticketsCount, usersCoins] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
    supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
    supabase.from('coin_transactions').select('*', { count: 'exact', head: true }),
    supabase.from('spin_wheel_tickets').select('*', { count: 'exact', head: true }).eq('is_used', false),
    supabase.from('users').select('coins'),
  ])

  const totalCoins = (usersCoins.data || []).reduce((sum: number, r: any) => sum + (Number(r.coins) || 0), 0)

  return {
    totalUsers: usersCount.count || 0,
    totalThreads: threadsCount.count || 0,
    totalReplies: repliesCount.count || 0,
    totalTransactions: transactionsCount.count || 0,
    totalCoins,
    activeTickets: ticketsCount.count || 0,
  }
}

export async function getAllUsers(limit = 100) {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('users')
    .select('discord_id, username, email, avatar, membership, coins, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function updateUserMembership(userId: string, membership: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('users')
    .update({ membership, updated_at: new Date().toISOString() })
    .eq('discord_id', userId)

  if (error) throw error
  return { success: true }
}

export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('discord_id', userId)

  if (error) throw error
  return { success: true }
}

export async function addCoinsToUser(userId: string, amount: number, description: string) {
  await requireAdmin()

  await db.coins.addCoins({
    user_id: userId,
    amount,
    type: 'admin',
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
  icon?: string
  is_active?: boolean
  sort_order?: number
}) {
  const { supabase } = await requireAdmin()

  const { data: prize, error } = await supabase
    .from('spin_wheel_prizes')
    .insert({
      name: data.name,
      type: data.type,
      value: data.value,
      probability: data.probability,
      color: data.color,
      icon: data.icon || null,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error) throw error
  return prize
}

export async function updateSpinPrize(prizeId: string, data: {
  name?: string
  type?: string
  value?: number
  probability?: number
  color?: string
  icon?: string
  is_active?: boolean
  sort_order?: number
}) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('spin_wheel_prizes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', prizeId)

  if (error) throw error
  return { success: true }
}

export async function deleteSpinPrize(prizeId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('spin_wheel_prizes').delete().eq('id', prizeId)
  if (error) throw error

  return { success: true }
}

export async function createAnnouncement(data: { title: string; content: string; type: string }) {
  const { supabase } = await requireAdmin()

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      title: data.title,
      message: data.content,
      type: data.type,
      is_active: true,
      is_dismissible: true,
      sort_order: 0,
    })
    .select('*')
    .single()

  if (error) throw error
  return announcement
}

export async function updateAnnouncement(id: string, data: { title?: string; content?: string; type?: string; active?: boolean }) {
  const { supabase } = await requireAdmin()

  const updateData: any = { updated_at: new Date().toISOString() }
  if (data.title !== undefined) updateData.title = data.title
  if (data.content !== undefined) updateData.message = data.content
  if (data.type !== undefined) updateData.type = data.type
  if (data.active !== undefined) updateData.is_active = data.active

  const { error } = await supabase.from('announcements').update(updateData).eq('id', id)
  if (error) throw error

  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error

  return { success: true }
}

export async function checkIsAdmin() {
  try {
    await requireAdmin()
    return { isAdmin: true }
  } catch {
    return { isAdmin: false }
  }
}

export async function getAdminDashboardStats() {
  const { supabase } = await requireAdmin()

  const [usersCount, threadsCount, repliesCount, spinsCount, ticketsCount, usersCoins] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
    supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
    supabase.from('spin_wheel_history').select('*', { count: 'exact', head: true }),
    supabase.from('spin_wheel_tickets').select('*', { count: 'exact', head: true }).eq('is_used', false),
    supabase.from('users').select('coins'),
  ])

  const totalCoins = (usersCoins.data || []).reduce((sum: number, r: any) => sum + (Number(r.coins) || 0), 0)

  return {
    totalUsers: usersCount.count || 0,
    totalThreads: threadsCount.count || 0,
    totalReplies: repliesCount.count || 0,
    totalCoins,
    activeTickets: ticketsCount.count || 0,
    totalSpins: spinsCount.count || 0,
  }
}

export async function getAdminAssets() {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data || []
}

export async function getPendingAssets() {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .neq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function approveAsset(assetId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('assets')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', assetId)

  if (error) throw error
  return { success: true }
}

export async function deleteAsset(assetId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('assets').delete().eq('id', assetId)
  if (error) throw error

  return { success: true }
}

export async function getCoinTransactionsAdmin(limit = 100) {
  const { supabase } = await requireAdmin()

  const { data: transactions, error } = await supabase
    .from('coin_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const userIds = [...new Set((transactions || []).map((t: any) => t.user_id).filter(Boolean))]
  let usersMap: Record<string, any> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('discord_id, username')
      .in('discord_id', userIds)

    usersMap = (users || []).reduce((acc: any, u: any) => {
      acc[u.discord_id] = u
      return acc
    }, {})
  }

  return (transactions || []).map((t: any) => ({
    ...t,
    username: usersMap[t.user_id]?.username,
  }))
}

export async function getPendingThreads() {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error

  const threads = (data || []) as any[]
  const authorIds = [...new Set(threads.map((t: any) => t.author_id).filter(Boolean))]

  const { data: authors, error: authorsError } = authorIds.length
    ? await supabase.from('users').select('discord_id, username, avatar').in('discord_id', authorIds)
    : { data: [], error: null }

  if (authorsError) throw authorsError

  const authorsByDiscordId = new Map<string, any>()
  for (const a of authors || []) authorsByDiscordId.set(a.discord_id, a)

  return threads.map((t: any) => {
    const author = authorsByDiscordId.get(t.author_id)
    return {
      ...t,
      username: author?.username,
      avatar: author?.avatar,
      users: author || null,
    }
  })
}

export async function approveThread(threadId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('forum_threads')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', threadId)

  if (error) throw error
  return { success: true }
}

export async function rejectThread(threadId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('forum_threads')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', threadId)

  if (error) throw error
  return { success: true }
}
