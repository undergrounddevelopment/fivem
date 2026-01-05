"use server"

import { db } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
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

export async function getUserBalance() {
  const user = await getUser()
  if (!user) return null

  const [coins, tickets] = await Promise.all([
    db.coins.getUserBalance(user.id),
    db.spinWheel.getTickets(user.id),
  ])

  return {
    coins,
    spin_tickets: tickets.filter((t: any) => !t.used).length,
  }
}

export async function claimDailyCoins() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const claimType = "coins"
  const amount = 100
  const canClaim = await db.coins.canClaimDaily(user.id, claimType)

  if (!canClaim) {
    throw new Error("Already claimed today")
  }

  await db.coins.claimDailyReward(user.id, claimType, amount)
  const totalCoins = await db.coins.getUserBalance(user.id)

  return { success: true, amount, totalCoins }
}

export async function addCoinsFromLinkvertise(amount: number) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  await db.coins.addCoins({
    user_id: user.id,
    amount,
    type: "linkvertise",
    description: "Earned from Linkvertise",
  })

  return { success: true }
}

export async function useSpinTicket() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const result = await db.spinWheel.useTicket(user.id)
  if (!result?.success) throw new Error("No tickets available")

  return { success: true }
}

export async function addSpinTicket(type: "reward" | "purchase" = "reward") {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  await db.spinWheel.addTicket(user.id, type)

  return { success: true }
}

export async function getSpinHistory() {
  const user = await getUser()
  if (!user) return []

  return await db.spinWheel.getHistory(user.id, 50, 0)
}

export async function recordSpinResult(prizeId: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  const { data: prize, error } = await supabase.from("spin_wheel_prizes").select("*").eq("id", prizeId).single()
  if (error || !prize) throw new Error("Prize not found")

  await db.spinWheel.recordSpin({
    user_id: user.id,
    prize_id: prize.id,
    prize_name: prize.name,
    coins_won: prize.type === "coins" ? (prize.value || 0) : 0,
  })

  if (prize.type === "coins" && prize.value > 0) {
    await db.coins.addCoins({
      user_id: user.id,
      amount: prize.value,
      type: "spin",
      description: `Won ${prize.value} coins from spin wheel`,
    })
  } else if (prize.type === "ticket") {
    await db.spinWheel.addTicket(user.id, "reward")
  }

  return { success: true, prize }
}
