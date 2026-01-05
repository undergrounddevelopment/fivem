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

export async function getSpinPrizes() {
  return await db.spinWheel.getPrizes()
}

export async function spinWheel() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const useTicketResult = await db.spinWheel.useTicket(user.id)
  if (!useTicketResult?.success) {
    throw new Error("No tickets available")
  }

  const prizes = await db.spinWheel.getPrizes()
  if (!prizes.length) {
    throw new Error("No prizes available")
  }

  const validPrizes = prizes.filter((p: any) => {
    const prob = parseFloat(String(p.probability ?? 0))
    return prob >= 0 && prob <= 100
  })
  const pool = validPrizes.length ? validPrizes : prizes

  const totalProb = pool.reduce((sum: number, p: any) => sum + parseFloat(String(p.probability ?? 0)), 0)
  const r = Math.random() * (totalProb || 1)
  let cumulative = 0
  let winner: any = pool[0]
  for (const p of pool) {
    cumulative += parseFloat(String(p.probability ?? 0))
    if (r <= cumulative) {
      winner = p
      break
    }
  }

  await db.spinWheel.recordSpin({
    user_id: user.id,
    prize_id: winner.id,
    prize_name: winner.name,
    coins_won: winner.type === "coins" ? (winner.value || 0) : 0,
  })

  if (winner.type === "coins" && winner.value > 0) {
    await db.coins.addCoins({
      user_id: user.id,
      amount: winner.value,
      type: "spin",
      description: `Won ${winner.value} coins from spin wheel`,
    })
  } else if (winner.type === "ticket") {
    await db.spinWheel.addTicket(user.id, "reward")
  }

  const newBalance = await db.coins.getUserBalance(user.id)
  const tickets = await db.spinWheel.getTickets(user.id)

  return {
    success: true,
    prize: winner,
    newBalance,
    newTickets: tickets.length,
    prizeIndex: pool.findIndex((p: any) => p.id === winner.id),
  }
}

export async function claimDailySpinTicket() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  const { data: existingClaim } = await supabase
    .from("daily_claims")
    .select("id")
    .eq("user_id", user.id)
    .eq("claim_type", "spin_ticket")
    .gte("claimed_at", today.toISOString())
    .limit(1)

  if (existingClaim && existingClaim.length > 0) {
    throw new Error("Already claimed today")
  }

  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)

  const { data: yesterdayClaim } = await supabase
    .from("daily_claims")
    .select("streak, claimed_at")
    .eq("user_id", user.id)
    .eq("claim_type", "spin_ticket")
    .gte("claimed_at", yesterday.toISOString())
    .lt("claimed_at", today.toISOString())
    .order("claimed_at", { ascending: false })
    .limit(1)

  let newStreak = 1
  if (yesterdayClaim && yesterdayClaim.length > 0) {
    newStreak = (yesterdayClaim[0] as any).streak + 1
  }

  let bonusTickets = 1
  if (newStreak >= 7) bonusTickets = 3
  else if (newStreak >= 3) bonusTickets = 2

  const inserts = Array.from({ length: bonusTickets }).map(() => ({
    user_id: user.id,
    ticket_type: "daily",
    expires_at: tomorrow.toISOString(),
  }))

  const { error: ticketError } = await supabase.from("spin_wheel_tickets").insert(inserts)
  if (ticketError) throw ticketError

  const { error: recordError } = await supabase.from("daily_claims").insert({
    user_id: user.id,
    claim_type: "spin_ticket",
    streak: newStreak,
    claimed_at: new Date().toISOString(),
  })
  if (recordError) throw recordError

  const tickets = await db.spinWheel.getTickets(user.id)
  return { success: true, newTickets: tickets.length, bonusTickets, newStreak }
}

export async function getSpinWinners() {
  const supabase = createAdminClient()
  const { data: spins } = await supabase
    .from("spin_history")
    .select("id, user_id, prize_name, coins_won, created_at")
    .order("created_at", { ascending: false })
    .limit(50)

  const userIds = [...new Set((spins || []).map((s: any) => s.user_id).filter(Boolean))]
  let usersMap: Record<string, any> = {}
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("discord_id, username, avatar")
      .in("discord_id", userIds)

    for (const u of users || []) {
      usersMap[u.discord_id] = u
    }
  }

  return (spins || []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    username: usersMap[s.user_id]?.username,
    avatar_url: usersMap[s.user_id]?.avatar,
    prize_name: s.prize_name,
    coins_won: s.coins_won,
    created_at: s.created_at,
  }))
}

export async function getDailySpinStatus() {
  const user = await getUser()
  if (!user) return { canClaim: false }

  const supabase = createAdminClient()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { data: existingClaim } = await supabase
    .from("daily_claims")
    .select("id")
    .eq("user_id", user.id)
    .eq("claim_type", "spin_ticket")
    .gte("claimed_at", today.toISOString())
    .limit(1)

  return { canClaim: !(existingClaim && existingClaim.length > 0) }
}

export async function getSpinHistory() {
  const user = await getUser()
  if (!user) return []

  const history = await db.spinWheel.getHistory(user.id, 50, 0)
  return history
}
