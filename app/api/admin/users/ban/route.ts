import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, reason } = await request.json()

    const supabase = getSupabaseAdminClient()

    const { data: user, error } = await supabase
      .from("users")
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_by: session.user.id,
        ban_reason: reason || null,
      })
      .eq("discord_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Ban user error:", error)
      return NextResponse.json({ error: "Failed to ban user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Ban user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
