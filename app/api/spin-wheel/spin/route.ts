import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// Rate limiting map (in-memory, resets on server restart)
const spinCooldowns = new Map<string, number>()
const SPIN_COOLDOWN_MS = 2000 // 2 seconds between spins

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
    const lastSpin = spinCooldowns.get(userId) || 0
    const now = Date.now()
    if (now - lastSpin < SPIN_COOLDOWN_MS) {
      return NextResponse.json({ error: "Please wait before spinning again" }, { status: 429 })
    }
    spinCooldowns.set(userId, now)

    // ============================================
    // STEP 3: ATOMIC TICKET DEDUCTION
    // ============================================
    const supabase = getSupabaseAdminClient()
    
    // First, try to use ticket from spin_wheel_tickets table (atomic update)
    const { data: tableTicket, error: tableError } = await supabase
      .from("spin_wheel_tickets")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_used", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .select()
      .single()

    let ticketUsed = false
    
    if (tableTicket && !tableError) {
      ticketUsed = true
      console.log('[SPIN] Used ticket from table:', tableTicket.id)
    } else {
      // Fallback: Try to use legacy ticket from users.spin_tickets
      // Use atomic decrement with check
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("spin_tickets, discord_id")
        .or(`discord_id.eq.${userId},id.eq.${userId}`)
        .single()

      if (userData && userData.spin_tickets > 0) {
        const { error: updateError, data: updatedUser } = await supabase
          .from("users")
          .update({ spin_tickets: userData.spin_tickets - 1 })
          .eq("discord_id", userData.discord_id)
          .gt("spin_tickets", 0) // IMPORTANT: Only update if > 0 (atomic check)
          .select("spin_tickets")
          .single()

        if (!updateError && updatedUser) {
          ticketUsed = true
          console.log('[SPIN] Used legacy ticket, remaining:', updatedUser.spin_tickets)
        }
      }
    }

    if (!ticketUsed) {
      spinCooldowns.delete(userId) // Allow retry immediately
      return NextResponse.json({ error: "No tickets available" }, { status: 403 })
    }

    // ============================================
    // STEP 4: GET PRIZES AND SELECT WINNER
    // ============================================
    const prizes = await db.spinWheel.getPrizes()
    if (!prizes.length) {
      return NextResponse.json({ error: "No prizes available" }, { status: 500 })
    }

    // Weighted random selection (server-side only, cannot be manipulated)
    const totalProb = prizes.reduce((sum, p) => sum + parseFloat(p.probability.toString()), 0)
    const random = Math.random() * totalProb
    
    let cumulative = 0
    let winner = prizes[0]
    
    for (const prize of prizes) {
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

    const prizeIndex = prizes.findIndex(p => p.id === winner.id)

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
    return NextResponse.json({ error: "Failed to spin" }, { status: 500 })
  }
}
