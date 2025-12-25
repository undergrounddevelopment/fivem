import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ coins: 0, tickets: 0 })
    }

    const supabase = await createClient()

    const { data: user } = await supabase
      .from("users")
      .select("coins, spin_tickets")
      .eq("discord_id", session.user.id)
      .single()

    return NextResponse.json({
      coins: user?.coins || 0,
      tickets: user?.spin_tickets || 0,
    })
  } catch (error) {
    console.error("Error fetching coins:", error)
    return NextResponse.json({ coins: 0, tickets: 0 })
  }
}
