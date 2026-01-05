import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "50")))
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") // 'all', 'active', 'banned'
    const offset = (page - 1) * limit

    const supabase = getSupabase()

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`username.ilike.%${search}%`)
    }

    if (status === "banned") {
      query = query.eq("is_banned", true)
    } else if (status === "active") {
      query = query.eq("is_banned", false)
    }

    const { data: users, count, error } = await query

    if (error) {
      console.error("[Users API] Error:", error)
      return NextResponse.json({ users: [], error: error.message }, { status: 500 })
    }

    // Format users for admin coins page
    const formatted = (users || []).map((u) => ({
      id: u.discord_id || u.id, // Use discord_id as primary identifier
      discordId: u.discord_id,
      uuid: u.id,
      username: u.username || "Unknown",
      email: u.email,
      avatar: u.avatar || null,
      membership: u.membership || "member",
      coins: u.coins || 0,
      xp: u.xp || 0,
      level: u.level || 1,
      status: u.is_banned ? "banned" : "active",
      lastActive: u.last_seen,
      createdAt: u.created_at,
      isAdmin: u.is_admin || false,
    }))

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
    console.error("[Users API] Error:", error)
    return NextResponse.json({ error: "Internal server error", users: [] }, { status: 500 })
  }
}
