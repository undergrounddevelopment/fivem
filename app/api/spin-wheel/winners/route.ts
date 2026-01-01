import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get recent winners with user profiles
    const { data: winners, error } = await supabase
      .from("spin_history")
      .select(`
        id,
        user_id,
        prize_name,
        coins_won,
        created_at,
        users:user_id (
          username,
          avatar_url
        )
      `)
      .gt("coins_won", 0)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching winners:", error)
      return NextResponse.json({ winners: [] })
    }

    // Format winners data
    const formattedWinners = (winners || []).map((w: any) => ({
      id: w.id,
      user_id: w.user_id,
      username: w.users?.username || "Anonymous",
      avatar_url: w.users?.avatar_url || null,
      prize_name: w.prize_name,
      coins_won: w.coins_won,
      created_at: w.created_at
    }))

    return NextResponse.json({ winners: formattedWinners })
  } catch (error) {
    console.error("Error fetching winners:", error)
    return NextResponse.json({ winners: [] })
  }
}
