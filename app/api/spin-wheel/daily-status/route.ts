import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ canClaim: false, streak: 0 })
    }

    const supabase = await createClient()
    const discordId = session.user.id

    // Get today's date at midnight UTC
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Check if user already claimed today
    const { data: todayClaim } = await supabase
      .from("daily_claims")
      .select("*")
      .eq("user_id", discordId)
      .eq("claim_type", "spin_ticket")
      .gte("claimed_at", today.toISOString())
      .single()

    if (todayClaim) {
      return NextResponse.json({
        canClaim: false,
        streak: todayClaim.streak || 0,
        lastClaim: todayClaim.claimed_at,
      })
    }

    // Get yesterday's claim for streak calculation
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

    const currentStreak = yesterdayClaim?.streak || 0

    return NextResponse.json({
      canClaim: true,
      streak: currentStreak,
      nextStreak: currentStreak + 1,
    })
  } catch (error) {
    console.error("Error checking daily status:", error)
    return NextResponse.json({ canClaim: false, streak: 0 })
  }
}
