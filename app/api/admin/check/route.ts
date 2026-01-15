import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { security } from "@/lib/security"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminAccess(userId: string) {
  const supabase = getSupabase()
  
  // Try discord_id first
  let { data } = await supabase
    .from('users')
    .select('is_admin, membership, role')
    .eq('discord_id', userId)
    .single()

  // Try UUID if not found
  if (!data) {
    const { data: byUuid } = await supabase
      .from('users')
      .select('is_admin, membership, role')
      .eq('id', userId)
      .single()
    data = byUuid
  }

  // Check admin status
  const isAdmin = data?.is_admin === true || 
                  data?.membership === 'admin' ||
                  ["admin", "owner"].includes(data?.role || "") ||
                  userId === process.env.ADMIN_DISCORD_ID

  return { isAdmin, data }
}

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

    const { isAdmin, data: user } = await checkAdminAccess(session.user.id)

    if (!user) {
      security.logSecurityEvent("Admin check - user not found", { userId: session.user.id }, "medium")
      return NextResponse.json({ error: "User not found", isAdmin: false }, { status: 404 })
    }

    if (!isAdmin) {
      security.logSecurityEvent("Non-admin attempted admin access", { userId: session.user.id }, "high")
      return NextResponse.json({ error: "Not authorized", isAdmin: false }, { status: 403 })
    }

    security.logSecurityEvent("Admin access granted", { userId: session.user.id }, "low")

    return NextResponse.json({
      isAdmin: true,
      role: user.role || "admin",
      membership: user.membership,
    })
  } catch (error) {
    security.logSecurityEvent("Admin check error", { error: error instanceof Error ? error.message : "Unknown error" }, "high")
    return NextResponse.json({ error: "Internal error", isAdmin: false }, { status: 500 })
  }
}
