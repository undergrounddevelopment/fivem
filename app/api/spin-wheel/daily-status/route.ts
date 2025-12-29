import { createClient } from "@/lib/supabase/server"
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

    const supabase = await createClient()
    const discordId = session.user.id

    // Get today's date at midnight UTC
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    
    // Get tomorrow's date for next claim time
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if user already claimed today
    const { data: todayClaim, error: todayClaimError } = await supabase
      .from("daily_claims")
      .select("*")
      .eq("user_id", discordId)
      .eq("claim_type", "spin_ticket")
      .gte("claimed_at", today.toISOString())
      .single()

    if (todayClaim && !todayClaimError) {
      // Get current ticket count
      const tickets = await db.spinWheel.getTickets(discordId)
      
      return NextResponse.json({
        canClaim: false,
        claimedToday: true,
        currentStreak: todayClaim.streak || 0,
        lastClaim: todayClaim.claimed_at,
        totalTickets: tickets.length,
        nextClaimAt: tomorrow.toISOString(), // Next claim available at midnight tomorrow
      })
    }

    // Get yesterday's claim for streak calculation
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: yesterdayClaim, error: yesterdayError } = await supabase
      .from("daily_claims")
      .select("streak, claimed_at")
      .eq("user_id", discordId)
      .eq("claim_type", "spin_ticket")
      .gte("claimed_at", yesterday.toISOString())
      .lt("claimed_at", today.toISOString())
      .single()

    let currentStreak = 0
    if (yesterdayClaim && !yesterdayError) {
      currentStreak = yesterdayClaim.streak
    } 
    // If there was an error but it's not "not found", log it
    else if (yesterdayError && yesterdayError.code !== 'PGRST116') {
      console.error("Error checking yesterday's claim:", yesterdayError)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(yesterdayError, {
          contexts: {
            spinWheel: {
              userId: discordId,
              action: 'checkYesterdayClaim'
            }
          }
        });
      });
    }

    // Get current ticket count
    const tickets = await db.spinWheel.getTickets(discordId)

    return NextResponse.json({
      canClaim: true,
      claimedToday: false,
      currentStreak: currentStreak,
      nextStreak: currentStreak + 1,
      totalTickets: tickets.length,
      nextClaimAt: tomorrow.toISOString(), // Next claim available at midnight tomorrow
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