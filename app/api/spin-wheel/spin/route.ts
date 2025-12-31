import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import * as Sentry from "@sentry/nextjs"

const SPIN_COOLDOWN_MS = 5000 // 5 seconds between spins to prevent abuse

export async function POST() {
  try {
    // ============================================
    // STEP 1: STRICT AUTHENTICATION CHECK
    // ============================================
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // ============================================
    // STEP 2: RATE LIMITING (prevent spam)
    // ============================================
    const supabase = getSupabaseAdminClient()
    const { data: lastSpinRow, error: lastSpinError } = await supabase
      .from("spin_wheel_history")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastSpinError) {
      console.error("[SPIN] Error checking last spin:", lastSpinError)
    }

    const now = Date.now()
    if (lastSpinRow?.created_at) {
      const last = new Date(lastSpinRow.created_at).getTime()
      if (now - last < SPIN_COOLDOWN_MS) {
        return NextResponse.json({ error: "Please wait before spinning again" }, { status: 429 })
      }
    }

    // ============================================
    // STEP 3: ATOMIC TICKET DEDUCTION
    // ============================================
    // Use ticket from spin_wheel_tickets table ONLY (atomic update)
    const { data: tableTicket, error: tableError } = await supabase
      .from("spin_wheel_tickets")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_used", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .select()
      .single()

    if (!tableTicket || tableError) {
      Sentry.captureMessage('No tickets available', {
        contexts: { spinWheel: { userId, action: 'ticketCheck' } }
      })
      return NextResponse.json({ error: "No tickets available" }, { status: 403 })
    }

    console.log('[SPIN] Used ticket:', tableTicket.id)

    // ============================================
    // STEP 4: GET PRIZES AND SELECT WINNER (improved algorithm)
    // ============================================
    const prizes = await db.spinWheel.getPrizes()
    if (!prizes.length) {
      return NextResponse.json({ error: "No prizes available" }, { status: 500 })
    }

    // Validate that probabilities are valid
    const validPrizes = prizes.filter(p => {
      const prob = parseFloat(p.probability.toString())
      return prob >= 0 && prob <= 100
    })
    
    if (validPrizes.length !== prizes.length) {
      console.warn('[SPIN] Invalid probabilities found, using valid prizes only')
      
      // Log warning to Sentry
      Sentry.captureMessage('Invalid prize probabilities found', {
        contexts: {
          spinWheel: {
            userId,
            action: 'validatePrizes'
          }
        }
      });
    }

    // Improved weighted random selection with better distribution
    const totalProb = validPrizes.reduce((sum, p) => sum + parseFloat(p.probability.toString()), 0)
    
    if (totalProb <= 0) {
      return NextResponse.json({ error: "Invalid prize probabilities" }, { status: 500 })
    }
    
    // Generate random number between 0 and total probability
    const random = Math.random() * totalProb
    
    let cumulative = 0
    let winner = validPrizes[0] // Default to first prize in case of issues
    
    // Find the winning prize based on cumulative probability
    for (const prize of validPrizes) {
      cumulative += parseFloat(prize.probability.toString())
      if (random <= cumulative) {
        winner = prize
        break
      }
    }

    // ============================================
    // STEP 5: RECORD SPIN IN HISTORY (audit trail)
    // ============================================
    await db.spinWheel.recordSpin({
      user_id: userId,
      prize_id: winner.id,
      prize_name: winner.name,
      prize_type: winner.type,
      prize_value: winner.value,
    })

    // ============================================
    // STEP 6: AWARD PRIZE (only coins or ticket)
    // ============================================
    if (winner.type === 'coins' && winner.value > 0) {
      await db.coins.addCoins({
        user_id: userId,
        amount: winner.value,
        type: 'spin',
        description: `Won ${winner.value} coins from spin wheel`,
      })
    } else if (winner.type === 'ticket') {
      await db.spinWheel.addTicket(userId, 'reward')
    }

    // ============================================
    // STEP 7: GET UPDATED BALANCE (realtime)
    // ============================================
    const balance = await db.coins.getUserBalance(userId)
    const tickets = await db.spinWheel.getTickets(userId)

    const prizeIndex = validPrizes.findIndex(p => p.id === winner.id)

    console.log('[SPIN] Complete - User:', userId, 'Prize:', winner.name, 'Tickets left:', tickets.length)

    return NextResponse.json({
      success: true,
      prize: {
        id: winner.id,
        name: winner.name,
        coins: winner.value,
        color: winner.color,
        rarity: winner.type,
      },
      prizeIndex,
      newBalance: balance,
      newTickets: tickets.length,
    })
  } catch (error) {
    console.error("Spin error:", error)
    
    // Capture error to Sentry
    Sentry.captureException(error, {
      contexts: {
        spinWheel: {
          action: 'processSpin'
        }
      }
    });
    
    return NextResponse.json({ error: "Failed to spin" }, { status: 500 })
  }
}