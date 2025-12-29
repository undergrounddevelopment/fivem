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

export async function getUserBalance() {
  const user = await getUser()
  if (!user) return null

  const [coinsResult, ticketsResult] = await Promise.all([
    db.query('SELECT COALESCE(SUM(amount), 0)::int as total FROM coin_transactions WHERE user_id = $1', [user.id]),
    db.query('SELECT COUNT(*)::int as total FROM spin_wheel_tickets WHERE user_id = $1 AND used = false', [user.id])
  ])

  return {
    coins: coinsResult.rows[0].total,
    spin_tickets: ticketsResult.rows[0].total
  }
}

export async function claimDailyCoins() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const canClaim = await db.query(
    'SELECT can_claim_daily($1) as can_claim',
    [user.id]
  )

  if (!canClaim.rows[0].can_claim) {
    throw new Error('Already claimed today')
  }

  await db.query('SELECT claim_daily_reward($1)', [user.id])
  
  return { success: true, amount: 100 }
}

export async function addCoinsFromLinkvertise(amount: number) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  await db.query(
    'INSERT INTO coin_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
    [user.id, amount, 'linkvertise', 'Earned from Linkvertise']
  )

  return { success: true }
}

export async function useSpinTicket() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const result = await db.query(
    'UPDATE spin_wheel_tickets SET used = true WHERE id = (SELECT id FROM spin_wheel_tickets WHERE user_id = $1 AND used = false LIMIT 1) RETURNING id',
    [user.id]
  )

  if (result.rows.length === 0) {
    throw new Error('No tickets available')
  }

  return { success: true }
}

export async function addSpinTicket(type: 'reward' | 'purchase' = 'reward') {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  await db.query(
    'INSERT INTO spin_wheel_tickets (user_id, ticket_type) VALUES ($1, $2)',
    [user.id, type]
  )

  return { success: true }
}

export async function getSpinHistory() {
  const user = await getUser()
  if (!user) return []

  const result = await db.query(
    'SELECT sh.*, sp.name as prize_name, sp.type as prize_type FROM spin_wheel_history sh JOIN spin_wheel_prizes sp ON sh.prize_id = sp.id WHERE sh.user_id = $1 ORDER BY sh.created_at DESC LIMIT 50',
    [user.id]
  )

  return result.rows
}

export async function recordSpinResult(prizeId: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  await db.query(
    'INSERT INTO spin_wheel_history (user_id, prize_id) VALUES ($1, $2)',
    [user.id, prizeId]
  )

  const prize = await db.query(
    'SELECT * FROM spin_wheel_prizes WHERE id = $1',
    [prizeId]
  )

  if (prize.rows[0].type === 'coins') {
    await db.query(
      'INSERT INTO coin_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
      [user.id, prize.rows[0].value, 'spin_wheel', `Won ${prize.rows[0].value} coins from spin wheel`]
    )
  }

  return { success: true, prize: prize.rows[0] }
}
