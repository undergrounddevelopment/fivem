import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Admin check starting...")

    const session = await getServerSession(authOptions)

    console.log("[v0] Session:", session ? "exists" : "missing")

    if (!session?.user?.id) {
      console.log("[v0] No user ID in session")
      return NextResponse.json({ error: "Not authenticated", isAdmin: false }, { status: 401 })
    }

    console.log("[v0] Checking admin for user:", session.user.id)

    const supabase = createAdminClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, discord_id, is_admin, role, membership")
      .eq("discord_id", session.user.id)
      .single()

    console.log("[v0] User data:", user)
    console.log("[v0] Query error:", error)

    if (error || !user) {
      console.error("[v0] Admin check - user not found:", error)
      return NextResponse.json({ error: "User not found", isAdmin: false }, { status: 404 })
    }

    // Check multiple admin indicators
    const isAdmin =
      user.is_admin === true || ["admin", "owner"].includes(user.role || "") || user.membership === "admin"

    console.log("[v0] Is admin:", isAdmin)

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized", isAdmin: false }, { status: 403 })
    }

    return NextResponse.json({
      isAdmin: true,
      role: user.role || "admin",
      membership: user.membership,
    })
  } catch (error) {
    console.error("[v0] Admin check error:", error)
    return NextResponse.json({ error: "Internal error", isAdmin: false }, { status: 500 })
  }
}
