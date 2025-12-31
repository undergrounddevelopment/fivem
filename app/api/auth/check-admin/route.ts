import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    console.log("[v0] Auth check-admin starting...")

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.log("[v0] No session found")
      return NextResponse.json({ isAdmin: false })
    }

    console.log("[v0] Session user:", session.user)

    // Check session first - NextAuth already checked admin status
    if (session.user.isAdmin === true) {
      console.log("[v0] Admin status from session: true")
      return NextResponse.json({ isAdmin: true })
    }

    const supabase = createAdminClient()
    const discordId = session.user.id

    console.log("[v0] Checking database for discord_id:", discordId)

    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("[v0] Final isAdmin:", isAdmin)

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("[v0] Error checking admin:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
