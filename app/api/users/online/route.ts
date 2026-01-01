import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"

export async function GET(request: Request) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    if (!security.checkRateLimit(`users_online_${clientIP}`, 100, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const supabase = getSupabaseAdminClient()

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: onlineUsers, error } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership, is_admin, last_seen")
      .eq("is_banned", false)
      .not("last_seen", "is", null)
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", { ascending: false })
      .limit(20)

    if (error) throw error

    let users = onlineUsers || []

    if (users.length === 0) {
      const { data: recentUsers } = await supabase
        .from("users")
        .select("discord_id, username, avatar, membership, is_admin, last_seen")
        .eq("is_banned", false)
        .not("last_seen", "is", null)
        .order("last_seen", { ascending: false })
        .limit(5)

      users = recentUsers || []
    }

    const formattedUsers = users.map((user) => ({
      id: user.discord_id,
      username: user.username,
      avatar: user.avatar,
      membership: user.is_admin ? "admin" : user.membership,
      isOnline: true,
    }))

    return NextResponse.json({
      users: formattedUsers,
      count: formattedUsers.length,
    })
  } catch (error: any) {
    console.error("Online users error:", error)
    return NextResponse.json({ users: [], count: 0 })
  }
}
