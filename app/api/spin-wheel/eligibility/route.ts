import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        eligible: false,
        spinsRemaining: 0,
        reason: "not_logged_in",
        canClaimDaily: false,
        nextClaimAt: null,
      })
    }

    const userId = session.user.id
    const supabase = createAdminClient()

    // Current system: eligibility is ticket-based
    const tickets = await db.spinWheel.getTickets(userId)
    const spinsRemaining = tickets.length

    // Daily claim availability (used by UI to show claim CTA)
    const todayDateStr = new Date().toISOString().slice(0, 10)
    const tomorrowUtc = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() + 1,
        0,
        0,
        0,
        0,
      ),
    )

    const { data: todayClaim } = await supabase
      .from("daily_claims")
      .select("id")
      .eq("user_id", userId)
      .in("claim_type", ["spin", "spin_ticket"])
      .eq("claim_date", todayDateStr)
      .maybeSingle()

    const canClaimDaily = !todayClaim

    if (spinsRemaining > 0) {
      return NextResponse.json({
        eligible: true,
        spinsRemaining,
        reason: "has_ticket",
        isBonus: false,
        canClaimDaily,
        nextClaimAt: canClaimDaily ? null : tomorrowUtc.toISOString(),
      })
    }

    return NextResponse.json({
      eligible: false,
      spinsRemaining: 0,
      reason: "no_tickets",
      canClaimDaily,
      nextClaimAt: canClaimDaily ? null : tomorrowUtc.toISOString(),
    })
  } catch (error) {
    console.error("Error checking eligibility:", error)
    return NextResponse.json({ eligible: false, reason: "error" }, { status: 500 })
  }
}
