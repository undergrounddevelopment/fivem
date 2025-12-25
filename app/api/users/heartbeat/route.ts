import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const supabase = await getSupabaseAdminClient()

    // Update user's last_seen timestamp
    const { error } = await supabase
      .from("users")
      .update({ last_seen: new Date().toISOString() })
      .eq("discord_id", session.user.id)

    if (error) {
      console.error("Heartbeat error:", error)
      return NextResponse.json({ success: false }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Heartbeat error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
