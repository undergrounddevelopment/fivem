import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as Sentry from "@sentry/nextjs"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const userId = session.user.id

    const todayDateStr = new Date().toISOString().slice(0, 10)
    const tomorrowUtc = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ))
    const yesterdayUtc = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate() - 1,
      0,
      0,
      0,
      0,
    ))
    const yesterdayDateStr = yesterdayUtc.toISOString().slice(0, 10)

    const { data: existingClaim } = await supabase
      .from("daily_claims")
      .select("id")
      .eq("user_id", userId)
      .in("claim_type", ["spin", "spin_ticket"])
      .eq("claim_date", todayDateStr)
      .maybeSingle()

    if (existingClaim) {
      return NextResponse.json({ error: "Already claimed today" }, { status: 400 })
    }

    const { data: recentClaims } = await supabase
      .from("daily_claims")
      .select("claim_date")
      .eq("user_id", userId)
      .in("claim_type", ["spin", "spin_ticket"])
      .order("claim_date", { ascending: false })
      .limit(30)

    const claimDates = new Set((recentClaims || []).map((c: any) => c.claim_date))
    const subtractOneDay = (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00.000Z")
      d.setUTCDate(d.getUTCDate() - 1)
      return d.toISOString().slice(0, 10)
    }

    let newStreak = 1
    if (claimDates.has(yesterdayDateStr)) {
      let streak = 0
      let cursor = yesterdayDateStr
      while (claimDates.has(cursor)) {
        streak += 1
        cursor = subtractOneDay(cursor)
        if (streak > 365) break
      }
      newStreak = streak + 1
    }

    let bonusTickets = 1
    if (newStreak >= 7) bonusTickets = 3
    else if (newStreak >= 3) bonusTickets = 2

    const ticketRows = Array.from({ length: bonusTickets }).map(() => ({
      user_id: userId,
      ticket_type: "daily",
      expires_at: tomorrowUtc.toISOString(),
    }))

    const { error: ticketError } = await supabase.from("spin_wheel_tickets").insert(ticketRows)
    if (ticketError) {
      throw ticketError
    }

    const { error: claimError } = await supabase.from("daily_claims").insert({
      user_id: userId,
      claim_type: "spin",
      claim_date: todayDateStr,
      claimed_at: new Date().toISOString(),
    })

    if (claimError) {
      throw claimError
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from("spin_wheel_tickets")
      .select("id")
      .eq("user_id", userId)
      .eq("is_used", false)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())

    if (ticketsError) {
      throw ticketsError
    }

    return NextResponse.json({
      success: true,
      newTickets: (tickets || []).length,
      newStreak,
      bonusTickets,
    })
  } catch (error) {
    console.error("Error claiming daily:", error)
    Sentry.captureException(error, {
      contexts: {
        spinWheel: {
          action: 'claimDaily'
        }
      }
    });
    return NextResponse.json({ error: "Failed to claim daily ticket" }, { status: 500 })
  }
}