import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 50
    const offset = (page - 1) * limit

    const supabase = getSupabaseAdminClient()

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,discord_id.ilike.%${search}%`)
    }

    const { data: users, count, error } = await query

    if (error) throw error

    const formattedUsers = (users || []).map((user) => ({
      id: user.id,
      discordId: user.discord_id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      membership: user.membership,
      coins: user.coins,
      reputation: user.reputation,
      downloads: user.downloads,
      isAdmin: user.is_admin,
      isBanned: user.is_banned,
      banReason: user.ban_reason,
      createdAt: user.created_at,
      lastSeen: user.last_seen,
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    logger.error("Admin users error", error, {
      endpoint: "/api/admin/users",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
