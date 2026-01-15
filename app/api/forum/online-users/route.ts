import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// Optimized for performance - 30s cache for live feel without DB overload
export const revalidate = 600 // Cache for 10 minutes

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: users, error } = await supabase
      .from("users")
      .select("discord_id, username, avatar, membership, last_seen")
      .eq("is_banned", false)
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Online users error:", error)
      return NextResponse.json([])
    }

    const formatted = (users || []).map((u) => ({
      id: u.discord_id,
      username: u.username,
      avatar: u.avatar,
      membership: u.membership,
      isOnline: true,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Online users error:", error)
    return NextResponse.json([])
  }
}
