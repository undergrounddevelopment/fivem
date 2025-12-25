import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

async function verifyAdmin(session: any, supabase: any) {
  const { data: user } = await supabase
    .from("users")
    .select("is_admin, membership, role")
    .eq("discord_id", session.user.id)
    .single()

  return user?.is_admin === true || user?.membership === "admin" || user?.role === "admin"
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    if (!(await verifyAdmin(session, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: spins, error } = await supabase
      .from("spin_history")
      .select("id, user_id, prize_name, coins_won, created_at")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    const userIds = [...new Set(spins?.map(s => s.user_id) || [])]
    
    let usersMap: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("discord_id, username, avatar")
        .in("discord_id", userIds)
      
      usersMap = (users || []).reduce((acc, u) => {
        acc[u.discord_id] = u
        return acc
      }, {} as Record<string, any>)
    }

    const logs = (spins || []).map(spin => ({
      ...spin,
      user: usersMap[spin.user_id] || { username: "Unknown", avatar: null }
    }))

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Spin logs error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
