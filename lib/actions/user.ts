'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
}

export async function getUserBalance() {
  const userId = await getUserId()
  if (!userId) return null

  const [coins, tickets] = await Promise.all([
    db.coins.getUserBalance(userId),
    db.spinWheel.getTickets(userId),
  ])

  return { coins, spin_tickets: tickets.length }
}

export async function claimDailyCoins() {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const amount = 100
  await db.coins.claimDailyReward(userId, 'coins', amount)
  const newBalance = await db.coins.getUserBalance(userId)

  return { success: true, amount, newBalance }
}

export async function addCoinsFromLinkvertise(amount: number) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  await db.coins.addCoins({
    user_id: userId,
    amount,
    type: 'linkvertise',
    description: 'Earned from Linkvertise',
  })

  return { success: true }
}

export async function useSpinTicket() {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const result = await db.spinWheel.useTicket(userId)
  if (!result.success) throw new Error('No tickets available')

  return { success: true }
}

export async function addSpinTicket(type: 'reward' | 'purchase' = 'reward') {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  await db.spinWheel.addTicket(userId, type)
  return { success: true }
}

export async function getSpinHistory() {
  const userId = await getUserId()
  if (!userId) return []
  return await db.spinWheel.getHistory(userId)
}

export async function recordSpinResult(prizeId: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const prizes = await db.spinWheel.getPrizes()
  const prize = prizes.find((p: any) => p.id === prizeId)
  if (!prize) throw new Error('Prize not found')

  await db.spinWheel.recordSpin({
    user_id: userId,
    prize_id: prize.id,
    prize_name: prize.name,
    prize_type: prize.type,
    prize_value: Number(prize.value) || 0,
  })

  if (prize.type === 'coins') {
    await db.coins.addCoins({
      user_id: userId,
      amount: Number(prize.value) || 0,
      type: 'spin_wheel',
      description: `Won ${Number(prize.value) || 0} coins from spin wheel`,
    })
  } else if (prize.type === 'ticket' || prize.type === 'spin') {
    await db.spinWheel.addTicket(userId, 'reward')
  }

  return { success: true, prize }
}
