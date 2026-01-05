import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: users, error } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership, is_admin, last_seen")
      .eq("is_banned", false)
      .not("last_seen", "is", null)
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", { ascending: false })
      .limit(50)

    if (error) throw error

    const onlineUsers = (users || []).map((u) => {
      const last = u.last_seen ? new Date(u.last_seen).getTime() : 0
      const diff = Date.now() - last
      const status: "online" | "away" | "busy" = diff <= 60_000 ? "online" : diff <= 3 * 60_000 ? "away" : "busy"

      return {
        id: u.discord_id,
        username: u.username,
        avatar: u.avatar,
        membership: u.is_admin ? "admin" : u.membership || "member",
        status,
        isOnline: true,
        last_activity: u.last_seen,
      }
    })

    return NextResponse.json({ success: true, data: onlineUsers })
  } catch (error) {
    console.error("[realtime/online-users] Error:", error)
    return NextResponse.json({ success: false, data: [] }, { status: 500 })
  }
}
