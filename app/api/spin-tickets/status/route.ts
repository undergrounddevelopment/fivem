import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ tickets: 0 })
    }

    const supabase = createAdminClient()
    const { data: user } = await supabase
      .from("users")
      .select("spin_tickets")
      .eq("discord_id", session.user.id)
      .single()

    return NextResponse.json({
      tickets: user?.spin_tickets || 0,
    })
  } catch (error) {
    console.error("Error fetching spin tickets:", error)
    return NextResponse.json({ tickets: 0 })
  }
}
