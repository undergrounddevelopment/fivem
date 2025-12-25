import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ history: [] })
    }

    const supabase = await createClient()

    const { data: history, error } = await supabase
      .from("spin_history")
      .select("id, prize_name, coins_won, spin_type, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ history: [] })
  }
}
