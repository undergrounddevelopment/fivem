import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ tickets: 0 })
    }

    const userId = session.user.id

    // Use the correct ticket table (spin_wheel_tickets) instead of legacy users.spin_tickets
    const tickets = await db.spinWheel.getTickets(userId)

    return NextResponse.json({
      tickets: tickets.length,
    })
  } catch (error) {
    console.error("Error fetching spin tickets:", error)
    return NextResponse.json({ tickets: 0 })
  }
}
