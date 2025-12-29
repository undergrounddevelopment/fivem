import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
    
    // Get tomorrow's date for expiration
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if already claimed today
    const { data: existingClaim, error: claimCheckError } = await supabase
      .from("daily_claims")
      .select("*")
      .eq("user_id", discordId)
      .eq("claim_type", "spin_ticket")
      .gte("claimed_at", today.toISOString())
      .single()

    if (existingClaim && !claimCheckError) {
      return NextResponse.json({ error: "Already claimed today" }, { status: 400 })
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

    // Calculate new streak
    // If user claimed yesterday, increment streak; otherwise start from 1
    let newStreak = 1
    if (yesterdayClaim && !yesterdayError) {
      newStreak = yesterdayClaim.streak + 1
    } else {
      // If there was an error but we can't verify they didn't claim yesterday,
      // we'll be conservative and reset the streak
      // But if the error is "not found", they simply didn't claim yesterday
      if (yesterdayError && yesterdayError.code !== 'PGRST116') {
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
        
        return NextResponse.json({ error: "Error verifying claim streak" }, { status: 500 })
      }
    }

    // Calculate bonus tickets based on streak
    let bonusTickets = 1 // Base ticket
    if (newStreak >= 7) bonusTickets = 3
    else if (newStreak >= 3) bonusTickets = 2

    // Add tickets to spin_wheel_tickets table with expiration
    for (let i = 0; i < bonusTickets; i++) {
      const { error: ticketError } = await supabase
        .from("spin_wheel_tickets")
        .insert([{
          user_id: discordId,
          ticket_type: 'daily',
          expires_at: tomorrow.toISOString(), // Ticket expires at midnight tomorrow
        }])
      
      if (ticketError) {
        console.error("Error adding ticket:", ticketError)
        
        // Capture error ke Sentry
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(ticketError, {
            contexts: {
              spinWheel: {
                userId: discordId,
                action: 'addTicket'
              }
            }
          });
        });
        
        return NextResponse.json({ error: "Failed to add daily ticket" }, { status: 500 })
      }
    }

    // Get updated ticket count
    const tickets = await db.spinWheel.getTickets(discordId)
    const newTickets = tickets.length

    // Record the claim
    const { error: recordError } = await supabase.from("daily_claims").insert({
      user_id: discordId,
      claim_type: "spin_ticket",
      streak: newStreak,
      claimed_at: new Date().toISOString(),
    })

    if (recordError) {
      console.error("Error recording claim:", recordError)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(recordError, {
          contexts: {
            spinWheel: {
              userId: discordId,
              action: 'recordClaim'
            }
          }
        });
      });
      
      return NextResponse.json({ error: "Failed to record daily claim" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newTickets,
      newStreak,
      bonusTickets,
      message: bonusTickets > 1 
        ? `Streak bonus! You received ${bonusTickets} tickets! (Day ${newStreak} streak)` 
        : "Daily ticket claimed! (Day 1)",
    })
  } catch (error) {
    console.error("Error claiming daily:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'claimDaily'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to claim daily ticket" }, { status: 500 })
  }
}