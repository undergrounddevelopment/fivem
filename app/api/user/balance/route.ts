import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Simple in-memory cache
const cache = new Map<string, { coins: number, spin_tickets: number, timestamp: number }>()
const CACHE_TTL = 3000 // 3 seconds

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ coins: 0, spin_tickets: 0 })
    }

    const discordId = session.user.id

    // Check cache first
    const cached = cache.get(discordId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ coins: cached.coins, spin_tickets: cached.spin_tickets })
    }

    // Get coins from coin_transactions (single source of truth)
    const coins = await db.coins.getUserBalance(discordId)

    // Get tickets from spin_wheel_tickets table only
    const tickets = await db.spinWheel.getTickets(discordId)

    const result = {
      coins: coins || 0,
      spin_tickets: tickets?.length || 0,
      timestamp: Date.now()
    }

    // Update cache
    cache.set(discordId, result)

    return NextResponse.json({
      coins: result.coins,
      spin_tickets: result.spin_tickets
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ coins: 0, spin_tickets: 0 })
  }
}
