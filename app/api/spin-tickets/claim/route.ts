import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const userId = session.user.id
    const today = new Date().toISOString().split("T")[0]

    // Check if already claimed today
    const { data: existingClaim } = await supabase
      .from("daily_spin_tickets")
      .select("*")
      .eq("user_id", userId)
      .eq("claimed_at", today)
      .single()

    if (existingClaim) {
      return NextResponse.json(
        {
          error: "Already claimed today",
          nextClaimAt: getNextClaimTime(),
        },
        { status: 400 },
      )
    }

    // Get yesterday's claim for streak calculation
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const { data: yesterdayClaim } = await supabase
      .from("daily_spin_tickets")
      .select("streak")
      .eq("user_id", userId)
      .eq("claimed_at", yesterdayStr)
      .single()

    // Calculate streak and bonus tickets
    let streak = 1
    if (yesterdayClaim) {
      streak = (yesterdayClaim.streak || 0) + 1
    }

    // Bonus tickets based on streak (max 5 tickets at 7 day streak)
    let ticketsToGive = 1
    if (streak >= 7) ticketsToGive = 3
    else if (streak >= 5) ticketsToGive = 2
    else if (streak >= 3) ticketsToGive = 2

    // Insert claim record
    const { error: insertError } = await supabase.from("daily_spin_tickets").insert({
      user_id: userId,
      claimed_at: today,
      tickets_received: ticketsToGive,
      streak: streak,
    })

    if (insertError) throw insertError

    // Update user's spin_tickets
    const { data: userData } = await supabase.from("users").select("spin_tickets").eq("discord_id", userId).single()

    const currentTickets = userData?.spin_tickets || 0

    const { error: updateError } = await supabase
      .from("users")
      .update({ spin_tickets: currentTickets + ticketsToGive })
      .eq("discord_id", userId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      ticketsReceived: ticketsToGive,
      totalTickets: currentTickets + ticketsToGive,
      streak: streak,
      message:
        streak >= 7
          ? "7 Day Streak! +3 Tickets!"
          : streak >= 3
            ? `${streak} Day Streak! +${ticketsToGive} Tickets!`
            : `Daily Login! +${ticketsToGive} Ticket!`,
    })
  } catch (error) {
    console.error("Claim spin ticket error:", error)
    return NextResponse.json({ error: "Failed to claim" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const userId = session.user.id
    const today = new Date().toISOString().split("T")[0]

    // Check today's claim
    const { data: todayClaim } = await supabase
      .from("daily_spin_tickets")
      .select("*")
      .eq("user_id", userId)
      .eq("claimed_at", today)
      .single()

    // Get user's total tickets
    const { data: userData } = await supabase.from("users").select("spin_tickets").eq("discord_id", userId).single()

    // Get streak history (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentClaims } = await supabase
      .from("daily_spin_tickets")
      .select("claimed_at, streak, tickets_received")
      .eq("user_id", userId)
      .gte("claimed_at", sevenDaysAgo.toISOString().split("T")[0])
      .order("claimed_at", { ascending: false })

    // Calculate current streak
    let currentStreak = 0
    if (recentClaims && recentClaims.length > 0) {
      currentStreak = recentClaims[0].streak || 0
    }

    return NextResponse.json({
      canClaim: !todayClaim,
      claimedToday: !!todayClaim,
      totalTickets: userData?.spin_tickets || 0,
      currentStreak: currentStreak,
      nextClaimAt: todayClaim ? getNextClaimTime() : null,
      recentClaims: recentClaims || [],
    })
  } catch (error) {
    console.error("Get spin ticket status error:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}

function getNextClaimTime() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}
