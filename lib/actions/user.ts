"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getUser() {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { id: session.user.id }
  }
  return null
}

export async function getUserBalance() {
  const user = await getUser()
  if (!user) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('coins, spin_tickets')
    .eq('discord_id', user.id)
    .single()

  if (error) {
    console.error('[getUserBalance] Error:', error)
    return null
  }

  return {
    coins: data?.coins || 0,
    spin_tickets: data?.spin_tickets || 0,
  }
}

export async function claimDailyCoins() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  
  // Check if already claimed today
  const today = new Date().toISOString().split('T')[0]
  const { data: existingClaim } = await supabase
    .from('daily_claims')
    .select('id')
    .eq('user_id', user.id)
    .eq('claim_type', 'coins')
    .eq('claim_date', today)
    .single()

  if (existingClaim) {
    throw new Error("Already claimed today")
  }

  const amount = 100

  // Add coins to user
  const { data: userData } = await supabase
    .from('users')
    .select('coins')
    .eq('discord_id', user.id)
    .single()

  const newBalance = (userData?.coins || 0) + amount

  await supabase
    .from('users')
    .update({ coins: newBalance })
    .eq('discord_id', user.id)

  // Record daily claim
  await supabase
    .from('daily_claims')
    .insert({
      user_id: user.id,
      claim_type: 'coins',
      claim_date: today
    })

  // Record transaction
  await supabase
    .from('coin_transactions')
    .insert({
      user_id: user.id,
      amount,
      type: 'daily',
      description: 'Daily coin reward'
    })

  return { success: true, amount, totalCoins: newBalance }
}

export async function addCoinsFromLinkvertise(amount: number) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  
  // Get current balance
  const { data: userData } = await supabase
    .from('users')
    .select('coins')
    .eq('discord_id', user.id)
    .single()

  const newBalance = (userData?.coins || 0) + amount

  // Update balance
  await supabase
    .from('users')
    .update({ coins: newBalance })
    .eq('discord_id', user.id)

  // Record transaction
  await supabase
    .from('coin_transactions')
    .insert({
      user_id: user.id,
      amount,
      type: 'reward',
      description: 'Earned from Linkvertise'
    })

  return { success: true }
}

export async function useSpinTicket() {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  
  // Get user's current tickets
  const { data: userData } = await supabase
    .from('users')
    .select('spin_tickets')
    .eq('discord_id', user.id)
    .single()

  if (!userData || userData.spin_tickets <= 0) {
    throw new Error("No tickets available")
  }

  // Decrease ticket count
  await supabase
    .from('users')
    .update({ spin_tickets: userData.spin_tickets - 1 })
    .eq('discord_id', user.id)

  return { success: true }
}

export async function addSpinTicket(type: "reward" | "purchase" = "reward") {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  
  // Get current tickets
  const { data: userData } = await supabase
    .from('users')
    .select('spin_tickets')
    .eq('discord_id', user.id)
    .single()

  // Add ticket
  await supabase
    .from('users')
    .update({ spin_tickets: (userData?.spin_tickets || 0) + 1 })
    .eq('discord_id', user.id)

  return { success: true }
}

export async function getSpinHistory() {
  const user = await getUser()
  if (!user) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('spin_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[getSpinHistory] Error:', error)
    return []
  }

  return data || []
}

export async function recordSpinResult(prizeId: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  
  // Get prize details
  const { data: prize, error } = await supabase
    .from("spin_wheel_prizes")
    .select("*")
    .eq("id", prizeId)
    .single()

  if (error || !prize) throw new Error("Prize not found")

  // Record spin in history
  await supabase
    .from('spin_history')
    .insert({
      user_id: user.id,
      prize_id: prize.id,
      prize_name: prize.name,
      coins_won: prize.type === "coins" ? (prize.value || 0) : 0
    })

  // Award coins if prize is coins
  if (prize.type === "coins" && prize.value > 0) {
    const { data: userData } = await supabase
      .from('users')
      .select('coins')
      .eq('discord_id', user.id)
      .single()

    const newBalance = (userData?.coins || 0) + prize.value

    await supabase
      .from('users')
      .update({ coins: newBalance })
      .eq('discord_id', user.id)

    // Record transaction
    await supabase
      .from('coin_transactions')
      .insert({
        user_id: user.id,
        amount: prize.value,
        type: 'spin',
        description: `Won ${prize.value} coins from spin wheel`
      })
  } else if (prize.type === "ticket") {
    // Add spin ticket
    const { data: userData } = await supabase
      .from('users')
      .select('spin_tickets')
      .eq('discord_id', user.id)
      .single()

    await supabase
      .from('users')
      .update({ spin_tickets: (userData?.spin_tickets || 0) + 1 })
      .eq('discord_id', user.id)
  }

  return { success: true, prize }
}
