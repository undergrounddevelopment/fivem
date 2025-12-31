import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: userData } = await supabase
      .from("users")
      .select("membership")
      .eq("discord_id", session.user.id)
      .single()

    if (userData?.membership !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: logs, error } = await supabase
      .from("spin_history")
      .select("id, user_id, discord_id, prize_name, coins_won, created_at")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    const rows: any[] = (logs as any[]) || []
    const discordIds = Array.from(
      new Set(
        rows
          .map((l: any) => (l.discord_id as string) || (l.user_id as string))
          .filter(Boolean),
      ),
    )

    const { data: users, error: usersError } = discordIds.length
      ? await supabase.from("users").select("discord_id, username, avatar").in("discord_id", discordIds)
      : { data: [], error: null }

    if (usersError) throw usersError

    const usersByDiscordId = new Map<string, any>()
    for (const u of users || []) usersByDiscordId.set(u.discord_id, u)

    const hydrated = rows.map((l: any) => {
      const did = (l.discord_id as string) || (l.user_id as string)
      return {
        ...l,
        user: did ? usersByDiscordId.get(did) || null : null,
      }
    })

    return NextResponse.json({ logs: hydrated })
  } catch (error) {
    console.error("Spin logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
