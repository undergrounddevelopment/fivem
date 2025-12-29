import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ coins: 0, tickets: 0 })
    }

    const coins = await db.coins.getUserBalance(session.user.id)
    const tickets = await db.spinWheel.getTickets(session.user.id)

    return NextResponse.json({
      coins: coins || 0,
      tickets: tickets?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching coins:", error)
    return NextResponse.json({ coins: 0, tickets: 0 })
  }
}
