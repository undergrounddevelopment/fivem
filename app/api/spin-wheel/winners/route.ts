import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: spins, error } = await supabase
      .from("spin_wheel_history")
      .select("id, user_id, prize_name, prize_value, created_at")
      .gt("prize_value", 0)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching winners:", error)
      return NextResponse.json({ winners: [] })
    }

    const userIds = Array.from(new Set((spins || []).map((s) => s.user_id).filter(Boolean)))

    const { data: users } = await supabase
      .from("users")
      .select("discord_id, username, avatar")
      .in("discord_id", userIds.length ? userIds : ["__none__"])

    const userMap = new Map((users || []).map((u) => [u.discord_id, u]))

    const formattedWinners = (spins || []).map((s: any) => {
      const u = userMap.get(s.user_id)
      return {
        id: s.id,
        user_id: s.user_id,
        username: u?.username || "Anonymous",
        avatar_url: u?.avatar || null,
        prize_name: s.prize_name,
        coins_won: s.prize_value,
        created_at: s.created_at,
      }
    })

    return NextResponse.json({ winners: formattedWinners })
  } catch (error) {
    console.error("Error fetching winners:", error)
    return NextResponse.json({ winners: [] })
  }
}
