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

export async function getSpinPrizes() {
  const result = await db.query(
    'SELECT * FROM spin_wheel_prizes WHERE active = true ORDER BY probability DESC'
  )
  return result.rows
}

export async function spinWheel() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Check tickets
  const ticketCheck = await db.query(
    'SELECT COUNT(*)::int as count FROM spin_wheel_tickets WHERE user_id = $1 AND used = false',
    [user.id]
  )
  
  if (ticketCheck.rows[0].count === 0) {
    throw new Error('No tickets available')
  }

  // Use ticket
  await db.query(
    'UPDATE spin_wheel_tickets SET used = true WHERE id = (SELECT id FROM spin_wheel_tickets WHERE user_id = $1 AND used = false LIMIT 1)',
    [user.id]
  )

  // Get prizes with weighted random
  const prizes = await db.query(
    'SELECT * FROM spin_wheel_prizes WHERE active = true ORDER BY probability DESC'
  )

  // Weighted random selection
  const totalWeight = prizes.rows.reduce((sum, p) => sum + p.probability, 0)
  let random = Math.random() * totalWeight
  let selectedPrize = prizes.rows[0]

  for (const prize of prizes.rows) {
    random -= prize.probability
    if (random <= 0) {
      selectedPrize = prize
      break
    }
  }

  // Record history
  await db.query(
    'INSERT INTO spin_wheel_history (user_id, prize_id) VALUES ($1, $2)',
    [user.id, selectedPrize.id]
  )

  // Add coins if prize is coins
  if (selectedPrize.type === 'coins') {
    await db.query(
      'INSERT INTO coin_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
      [user.id, selectedPrize.value, 'spin_wheel', `Won ${selectedPrize.value} coins from spin wheel`]
    )
  }

  // Get new balance
  const balance = await db.query(
    'SELECT COALESCE(SUM(amount), 0)::int as coins FROM coin_transactions WHERE user_id = $1',
    [user.id]
  )

  const tickets = await db.query(
    'SELECT COUNT(*)::int as count FROM spin_wheel_tickets WHERE user_id = $1 AND used = false',
    [user.id]
  )

  return {
    success: true,
    prize: selectedPrize,
    newBalance: balance.rows[0].coins,
    newTickets: tickets.rows[0].count,
    prizeIndex: prizes.rows.findIndex(p => p.id === selectedPrize.id)
  }
}

export async function claimDailySpinTicket() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const canClaim = await db.query(
    'SELECT can_claim_daily($1, $2) as can_claim',
    [user.id, 'spin']
  )

  if (!canClaim.rows[0].can_claim) {
    throw new Error('Already claimed today')
  }

  await db.query('SELECT claim_daily_reward($1, $2)', [user.id, 'spin'])

  const tickets = await db.query(
    'SELECT COUNT(*)::int as count FROM spin_wheel_tickets WHERE user_id = $1 AND used = false',
    [user.id]
  )

  return { success: true, newTickets: tickets.rows[0].count, bonusTickets: 1 }
}

export async function getSpinWinners() {
  const result = await db.query(`
    SELECT 
      sh.id,
      sh.user_id,
      u.username,
      u.avatar as avatar_url,
      sp.name as prize_name,
      sp.value as coins_won,
      sh.created_at
    FROM spin_wheel_history sh
    JOIN users u ON sh.user_id = u.discord_id
    JOIN spin_wheel_prizes sp ON sh.prize_id = sp.id
    ORDER BY sh.created_at DESC
    LIMIT 50
  `)
  return result.rows
}

export async function getDailySpinStatus() {
  const user = await getUser()
  if (!user) return { canClaim: false }

  const result = await db.query(
    'SELECT can_claim_daily($1, $2) as can_claim',
    [user.id, 'spin']
  )

  return { canClaim: result.rows[0].can_claim }
}

export async function getSpinHistory() {
  const user = await getUser()
  if (!user) return []

  const result = await db.query(`
    SELECT 
      sh.id,
      sp.name as prize_name,
      sp.value as coins_won,
      'ticket' as spin_type,
      sh.created_at
    FROM spin_wheel_history sh
    JOIN spin_wheel_prizes sp ON sh.prize_id = sp.id
    WHERE sh.user_id = $1
    ORDER BY sh.created_at DESC
    LIMIT 50
  `, [user.id])

  return result.rows
}
