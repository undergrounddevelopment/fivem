'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
}

export async function getSpinPrizes() {
  return await db.spinWheel.getPrizes()
}

export async function spinWheel() {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const prizes = await db.spinWheel.getPrizes()
  if (!prizes || prizes.length === 0) throw new Error('No prizes available')

  const ticketResult = await db.spinWheel.useTicket(userId)
  if (!ticketResult.success) throw new Error('No tickets available')

  const totalWeight = prizes.reduce((sum: number, p: any) => sum + (Number(p.probability) || 0), 0)
  let random = Math.random() * (totalWeight || prizes.length)
  let selectedPrize = prizes[0]

  for (const prize of prizes) {
    random -= totalWeight ? (Number(prize.probability) || 0) : 1
    if (random <= 0) {
      selectedPrize = prize
      break
    }
  }

  const supabase = getSupabaseAdminClient()
  await supabase.from('spin_wheel_history').insert({
    user_id: userId,
    prize_id: selectedPrize.id,
    prize_name: selectedPrize.name,
    prize_type: selectedPrize.type,
    prize_value: Number(selectedPrize.value) || 0,
  })

  if (selectedPrize.type === 'coins') {
    await db.coins.addCoins({
      user_id: userId,
      amount: Number(selectedPrize.value) || 0,
      type: 'spin_wheel',
      description: `Won ${Number(selectedPrize.value) || 0} coins from spin wheel`,
    })
  } else if (selectedPrize.type === 'ticket' || selectedPrize.type === 'spin') {
    await db.spinWheel.addTicket(userId, 'reward')
  }

  const newBalance = await db.coins.getUserBalance(userId)
  const newTickets = (await db.spinWheel.getTickets(userId)).length

  return {
    success: true,
    prize: selectedPrize,
    newBalance,
    newTickets,
    prizeIndex: prizes.findIndex((p: any) => p.id === selectedPrize.id),
  }
}

export async function claimDailySpinTicket() {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const supabase = getSupabaseAdminClient()

  const today = new Date().toISOString().slice(0, 10)
  const { data: existing } = await supabase
    .from('daily_claims')
    .select('id')
    .eq('user_id', userId)
    .eq('claim_type', 'spin')
    .eq('claim_date', today)
    .limit(1)

  if (existing && existing.length > 0) throw new Error('Already claimed today')

  await supabase.from('daily_claims').insert({
    user_id: userId,
    claim_type: 'spin',
    claim_date: today,
    reward_amount: 1,
  })

  await db.spinWheel.addTicket(userId, 'daily')
  const newTickets = (await db.spinWheel.getTickets(userId)).length

  return { success: true, newTickets, bonusTickets: 1 }
}

export async function getSpinWinners() {
  const supabase = getSupabaseAdminClient()

  const { data: history, error } = await supabase
    .from('spin_wheel_history')
    .select('id, user_id, prize_name, prize_type, prize_value, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const userIds = [...new Set((history || []).map((h: any) => h.user_id).filter(Boolean))]
  let usersMap: Record<string, any> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('discord_id, username, avatar')
      .in('discord_id', userIds)

    usersMap = (users || []).reduce((acc: any, u: any) => {
      acc[u.discord_id] = u
      return acc
    }, {})
  }

  return (history || []).map((h: any) => {
    const u = usersMap[h.user_id]
    return {
      id: h.id,
      user_id: h.user_id,
      username: u?.username,
      avatar_url: u?.avatar,
      prize_name: h.prize_name,
      coins_won: h.prize_type === 'coins' ? h.prize_value : 0,
      created_at: h.created_at,
    }
  })
}

export async function getDailySpinStatus() {
  const userId = await getUserId()
  if (!userId) return { canClaim: false }

  const supabase = getSupabaseAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('daily_claims')
    .select('id')
    .eq('user_id', userId)
    .eq('claim_type', 'spin')
    .eq('claim_date', today)
    .limit(1)

  return { canClaim: !data || data.length === 0 }
}

export async function getSpinHistory() {
  const userId = await getUserId()
  if (!userId) return []

  return await db.spinWheel.getHistory(userId)
}
