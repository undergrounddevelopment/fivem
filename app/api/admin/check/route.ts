import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      security.logSecurityEvent("Unauthorized admin check attempt", { ip: "unknown" }, "medium")
      return NextResponse.json({ error: "Not authenticated", isAdmin: false }, { status: 401 })
    }

    // Rate limiting untuk admin check
    if (!security.checkRateLimit(`admin_check_${session.user.id}`, 10, 60000)) {
      security.logSecurityEvent("Admin check rate limit exceeded", { userId: session.user.id }, "high")
      return NextResponse.json({ error: "Too many requests", isAdmin: false }, { status: 429 })
    }

    const supabase = createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
      security.logSecurityEvent("Non-admin attempted admin access", { userId: session.user.id }, "high")
      return NextResponse.json({ error: "Not authorized", isAdmin: false }, { status: 403 })
    }

    security.logSecurityEvent("Admin access granted", { userId: session.user.id }, "low")

    return NextResponse.json({
      isAdmin: true,
      membership: user.membership,
    })
  } catch (error) {
    security.logSecurityEvent("Admin check error", { error: error instanceof Error ? error.message : "Unknown error" }, "high")
    return NextResponse.json({ error: "Internal error", isAdmin: false }, { status: 500 })
  }
}