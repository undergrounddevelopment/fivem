import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const discordId = session.user.id

    // Get today's date at midnight UTC
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Check if already claimed today
    const { data: existingClaim } = await supabase
      .from("daily_claims")
      .select("*")
      .eq("user_id", discordId)
      .eq("claim_type", "spin_ticket")
      .gte("claimed_at", today.toISOString())
      .single()

    if (existingClaim) {
      return NextResponse.json({ error: "Already claimed today" }, { status: 400 })
    }

    // Get yesterday's claim for streak
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: yesterdayClaim } = await supabase
      .from("daily_claims")
      .select("streak")
      .eq("user_id", discordId)
      .eq("claim_type", "spin_ticket")
      .gte("claimed_at", yesterday.toISOString())
      .lt("claimed_at", today.toISOString())
      .single()

    const newStreak = (yesterdayClaim?.streak || 0) + 1

    // Calculate bonus tickets based on streak
    let bonusTickets = 1 // Base ticket
    if (newStreak >= 7) bonusTickets = 3
    else if (newStreak >= 3) bonusTickets = 2

    // Get current user data
    const { data: userData } = await supabase.from("users").select("spin_tickets").eq("discord_id", discordId).single()

    const currentTickets = userData?.spin_tickets || 0
    const newTickets = currentTickets + bonusTickets

    // Update user tickets
    await supabase.from("users").update({ spin_tickets: newTickets }).eq("discord_id", discordId)

    // Record the claim
    await supabase.from("daily_claims").insert({
      user_id: discordId,
      claim_type: "spin_ticket",
      streak: newStreak,
      claimed_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      newTickets,
      newStreak,
      bonusTickets,
      message: bonusTickets > 1 ? `Streak bonus! You received ${bonusTickets} tickets!` : "Daily ticket claimed!",
    })
  } catch (error) {
    console.error("Error claiming daily:", error)
    return NextResponse.json({ error: "Failed to claim daily ticket" }, { status: 500 })
  }
}
