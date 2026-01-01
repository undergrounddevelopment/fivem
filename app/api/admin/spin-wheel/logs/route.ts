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
      .select(`
        id,
        user_id,
        prize_name,
        coins_won,
        created_at,
        user:users!spin_history_user_id_fkey(username, avatar)
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error("Spin logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
