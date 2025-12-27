import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ coins: 0, spin_tickets: 0 })
    }

    const supabase = await createClient()
    const discordId = session.user.id

    // Get user coins
    const { data: user } = await supabase
      .from("users")
      .select("coins")
      .eq("discord_id", discordId)
      .single()

    // Get tickets from spin_wheel_tickets table
    const tickets = await db.spinWheel.getTickets(discordId)

    return NextResponse.json({
      coins: user?.coins || 0,
      spin_tickets: tickets?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ coins: 0, spin_tickets: 0 })
  }
}
