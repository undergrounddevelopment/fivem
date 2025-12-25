import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ coins: 0, spin_tickets: 0 })
    }

    const supabase = await createClient()
    const discordId = session.user.id

    const { data: user, error } = await supabase
      .from("users")
      .select("coins, spin_tickets")
      .eq("discord_id", discordId)
      .single()

    if (error || !user) {
      return NextResponse.json({ coins: 0, spin_tickets: 0 })
    }

    return NextResponse.json({
      coins: user.coins || 0,
      spin_tickets: user.spin_tickets || 0,
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ coins: 0, spin_tickets: 0 })
  }
}
