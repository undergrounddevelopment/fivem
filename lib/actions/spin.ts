
"use server"

import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSiteSettings } from "@/lib/settings"
import { revalidatePath } from "next/cache"

export async function getSpinPrizes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("spin_wheel_prizes")
    .select("*")
    .eq("is_active", true)

  return data || []
}

export async function getUserBalance() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { coins: 0, spin_tickets: 0 }

  const supabase = await createClient()
  const { data } = await supabase
    .from("users")
    .select("coins, id")
    .eq("discord_id", session.user.id)
    .single()

  if (!data) return { coins: 0, spin_tickets: 0 }

  const { data: tickets } = await supabase
    .from("spin_wheel_tickets")
    .select("tickets")
    .eq("user_id", data.id)
    .single()

  return {
    coins: data.coins,
    spin_tickets: tickets?.tickets || 0
  }
}

export async function getDailySpinStatus() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { canClaim: false, eventEnded: false }

  const supabase = await createClient()
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", session.user.id)
    .single()

  if (!user) return { canClaim: false, eventEnded: false }

  const { data: ticketData } = await supabase
    .from("spin_wheel_tickets")
    .select("last_earned")
    .eq("user_id", user.id)
    .single()

  if (!ticketData) return { canClaim: true, eventEnded: false }

  const lastEarned = new Date(ticketData.last_earned)
  const now = new Date()

  const isToday = lastEarned.getDate() === now.getDate() &&
    lastEarned.getMonth() === now.getMonth() &&
    lastEarned.getFullYear() === now.getFullYear()

  return { canClaim: !isToday, eventEnded: false }
}

export async function claimDailySpinTicket() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", session.user.id)
    .single()

  if (!user) throw new Error("User not found")

  const { canClaim } = await getDailySpinStatus()
  if (!canClaim) throw new Error("Already claimed today")

  const settings = await getSiteSettings('features')
  const spinsPerDay = settings.maxSpinsPerDay || 1

  const { data: currentTicket } = await supabase
    .from("spin_wheel_tickets")
    .select("tickets")
    .eq("user_id", user.id)
    .single()

  const newTicketCount = (currentTicket?.tickets || 0) + spinsPerDay

  const { error } = await supabase
    .from("spin_wheel_tickets")
    .upsert({
      user_id: user.id,
      tickets: newTicketCount,
      last_earned: new Date().toISOString()
    })

  if (error) throw new Error(error.message)

  revalidatePath("/spin-wheel")
  return { success: true, tickets: newTicketCount, bonusTickets: spinsPerDay }
}

export async function spinWheel() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: user } = await supabase
    .from("users")
    .select("id, coins")
    .eq("discord_id", session.user.id)
    .single()

  if (!user) throw new Error("User not found")

  const { data: ticketData } = await supabase
    .from("spin_wheel_tickets")
    .select("tickets")
    .eq("user_id", user.id)
    .single()

  if (!ticketData || ticketData.tickets < 1) {
    throw new Error("No spin tickets left")
  }

  const { data: prizes } = await supabase
    .from("spin_wheel_prizes")
    .select("*")
    .eq("is_active", true)

  if (!prizes || prizes.length === 0) throw new Error("No prizes active")

  let totalWeight = 0
  prizes.forEach(p => totalWeight += parseFloat(p.probability as unknown as string))

  let random = Math.random() * totalWeight
  let selectedPrize: any = null
  let prizeIndex = 0
  for (let i = 0; i < prizes.length; i++) {
    random -= parseFloat(prizes[i].probability as unknown as string)
    if (random <= 0) {
      selectedPrize = prizes[i]
      prizeIndex = i
      break
    }
  }

  if (!selectedPrize) {
      selectedPrize = prizes[prizes.length - 1]
      prizeIndex = prizes.length - 1
  }

  await supabase
    .from("spin_wheel_tickets")
    .update({ tickets: ticketData.tickets - 1 })
    .eq("user_id", user.id)

  if (selectedPrize.type === 'coins') {
    await supabase
      .from("users")
      .update({ coins: user.coins + selectedPrize.value })
      .eq("id", user.id)

    await supabase.from("coin_transactions").insert({
      user_id: user.id,
      amount: selectedPrize.value,
      type: 'earn',
      description: `Won ${selectedPrize.name} from Lucky Spin`,
      reference_type: 'spin_wheel',
      reference_id: selectedPrize.id,
      balance_before: user.coins,
      balance_after: user.coins + selectedPrize.value
    })
  }

  await supabase.from("spin_wheel_history").insert({
    user_id: user.id,
    prize_id: selectedPrize.id,
    prize_name: selectedPrize.name,
    prize_value: selectedPrize.value
  })

  revalidatePath("/spin-wheel")
  return {
    success: true,
    prize: selectedPrize,
    prizeIndex,
    remainingTickets: ticketData.tickets - 1,
    newBalance: selectedPrize.type === 'coins' ? user.coins + selectedPrize.value : user.coins,
    newTickets: selectedPrize.type === 'ticket' ? (ticketData.tickets || 0) : (ticketData.tickets - 1)
  }
}

export async function getSpinHistory() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("spin_wheel_history")
    .select("*, users(username, avatar)")
    .order("created_at", { ascending: false })
    .limit(10)

  return data || []
}

export async function getSpinWinners() {
  return getSpinHistory()
}