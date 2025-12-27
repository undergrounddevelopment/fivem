import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Rate limit admin requests
    if (!security.checkRateLimit(`admin_users_${session.user.id}`, 100, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "20")))
    const search = security.sanitizeInput(searchParams.get("search") || "")
    const status = searchParams.get("status") // 'all', 'active', 'banned'
    const offset = (page - 1) * limit

    const supabase = getSupabaseAdminClient()

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status === "banned") {
      query = query.eq("is_banned", true)
    } else if (status === "active") {
      query = query.eq("is_banned", false)
    }

    const { data: users, count, error } = await query

    if (error) throw error

    // Get download counts for each user
    const formatted = await Promise.all(
      (users || []).map(async (u) => {
        const { count: downloadCount } = await supabase
          .from("downloads")
          .select("*", { count: "exact", head: true })
          .eq("user_id", u.discord_id)

        const { count: threadCount } = await supabase
          .from("forum_threads")
          .select("*", { count: "exact", head: true })
          .eq("author_id", u.discord_id)

        const { count: assetCount } = await supabase
          .from("assets")
          .select("*", { count: "exact", head: true })
          .eq("author_id", u.discord_id)

        return {
          id: u.discord_id,
          username: u.username,
          email: u.email,
          avatar: u.avatar || "/placeholder.svg",
          membership: u.membership,
          coins: u.coins,
          downloads: downloadCount || 0,
          posts: threadCount || 0,
          assets: assetCount || 0,
          status: u.is_banned ? "banned" : "active",
          lastActive: u.updated_at,
          createdAt: u.created_at,
          isAdmin: u.is_admin,
          accountAge: Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        }
      }),
    )

    // Log admin access
    security.logSecurityEvent(
      "Admin accessed user list",
      {
        adminId: session.user.id,
        totalUsers: count,
        page,
        search: search || "none",
        status: status || "all",
      },
      "low",
    )

    return NextResponse.json({
      users: formatted,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      summary: {
        total: count || 0,
        active: formatted.filter((u) => u.status === "active").length,
        banned: formatted.filter((u) => u.status === "banned").length,
      },
    })
  } catch (error: any) {
    logger.error("Users API error", error, {
      endpoint: "/api/users",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
