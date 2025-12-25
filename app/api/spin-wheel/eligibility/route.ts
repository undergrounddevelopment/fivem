import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ eligible: false, reason: "not_logged_in" })
    }

    const supabase = await createClient()
    const userId = session.user.id

    // Check bonus spins
    const { data: eligibility } = await supabase
      .from("spin_wheel_eligible_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    // Check if has bonus spins that haven't expired
    if (eligibility && eligibility.spins_remaining > 0) {
      if (!eligibility.expires_at || new Date(eligibility.expires_at) > new Date()) {
        return NextResponse.json({
          eligible: true,
          spinsRemaining: eligibility.spins_remaining,
          reason: eligibility.reason,
          isBonus: true,
        })
      }
    }

    // Check daily spin
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todaySpins } = await supabase
      .from("spin_history")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", today.toISOString())

    if (!todaySpins || todaySpins.length === 0) {
      return NextResponse.json({
        eligible: true,
        spinsRemaining: 1,
        reason: "daily_spin",
        isBonus: false,
      })
    }

    // Calculate next spin time
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return NextResponse.json({
      eligible: false,
      spinsRemaining: 0,
      reason: "daily_limit_reached",
      nextSpinAt: tomorrow.toISOString(),
    })
  } catch (error) {
    console.error("Error checking eligibility:", error)
    return NextResponse.json({ eligible: false, reason: "error" }, { status: 500 })
  }
}
