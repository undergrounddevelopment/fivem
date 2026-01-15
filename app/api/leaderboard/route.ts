import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  try {
    const [topXpRes, topRepRes, topUploadsRes] = await Promise.all([
      // Top XP (Level)
      supabase
        .from("users")
        .select("id, discord_id, username, avatar, xp, level, membership, current_badge")
        .order("xp", { ascending: false })
        .limit(10),

      // Top Reputation
      supabase
        .from("users")
        .select("id, discord_id, username, avatar, reputation, membership, xp")
        .order("reputation", { ascending: false })
        .limit(10),
        
      // Top Contributors (by number of approved assets)
      // Note: This involves a join or count which might be heavy. 
      // For now we might just select users and let UI handle or use a view.
      // Simpler alternative: Just use 'reputation' as a proxy for contribution for now, 
      // or if we have a 'total_uploads' column on users (we don't seems so).
      // We will skip topUploads for now to keep it fast and simple, focusing on XP and Rep.
    ])

    return NextResponse.json({
      topXp: topXpRes.data || [],
      topRep: topRepRes.data || []
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
