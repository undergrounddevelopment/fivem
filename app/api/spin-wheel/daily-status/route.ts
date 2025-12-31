import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        canClaim: false, 
        claimedToday: false,
        currentStreak: 0,
        totalTickets: 0,
        nextClaimAt: null
      })
    }

    const supabase = createAdminClient()
    const discordId = session.user.id

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
    const yesterdayDate = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate() - 1,
      0,
      0,
      0,
      0,
    ))
    const yesterdayDateStr = yesterdayDate.toISOString().slice(0, 10)

    const { data: todayClaim } = await supabase
      .from("daily_claims")
      .select("id, claim_date, claimed_at")
      .eq("user_id", discordId)
      .in("claim_type", ["spin", "spin_ticket"])
      .eq("claim_date", todayDateStr)
      .maybeSingle()

    const { data: recentClaims } = await supabase
      .from("daily_claims")
      .select("claim_date")
      .eq("user_id", discordId)
      .in("claim_type", ["spin", "spin_ticket"])
      .order("claim_date", { ascending: false })
      .limit(30)

    const claimDates = new Set((recentClaims || []).map((c: any) => c.claim_date))
    const subtractOneDay = (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00.000Z")
      d.setUTCDate(d.getUTCDate() - 1)
      return d.toISOString().slice(0, 10)
    }

    const streakStart = todayClaim ? todayDateStr : yesterdayDateStr
    let currentStreak = 0
    let cursor = streakStart
    while (claimDates.has(cursor)) {
      currentStreak += 1
      cursor = subtractOneDay(cursor)
      if (currentStreak > 365) break
    }

    // Get current ticket count
    const tickets = await db.spinWheel.getTickets(discordId)

    if (todayClaim) {
      return NextResponse.json({
        canClaim: false,
        claimedToday: true,
        currentStreak,
        lastClaim: todayClaim.claimed_at,
        totalTickets: tickets.length,
        nextClaimAt: tomorrowUtc.toISOString(),
      })
    }

    return NextResponse.json({
      canClaim: true,
      claimedToday: false,
      currentStreak,
      nextStreak: currentStreak + 1,
      totalTickets: tickets.length,
      nextClaimAt: tomorrowUtc.toISOString(),
    })
  } catch (error) {
    console.error("Error checking daily status:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'checkDailyStatus'
          }
        }
      });
    });
    
    return NextResponse.json({ 
      canClaim: false, 
      claimedToday: false,
      currentStreak: 0,
      totalTickets: 0,
      nextClaimAt: null,
      error: "Failed to fetch daily status"
    })
  }
}