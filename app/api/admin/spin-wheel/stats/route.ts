import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get total spins
    const { count: totalSpins } = await supabase.from("spin_history").select("*", { count: "exact", head: true })

    // Get total coins won
    const { data: coinsData } = await supabase.from("spin_history").select("coins_won")
    const totalCoinsWon = coinsData?.reduce((sum, row) => sum + (row.coins_won || 0), 0) || 0

    // Get unique spinners
    const { data: uniqueData } = await supabase.from("spin_history").select("user_id")
    const uniqueSpinners = new Set(uniqueData?.map((row) => row.user_id)).size

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayData } = await supabase
      .from("spin_history")
      .select("coins_won")
      .gte("created_at", today.toISOString())

    const todaySpins = todayData?.length || 0
    const todayCoinsWon = todayData?.reduce((sum, row) => sum + (row.coins_won || 0), 0) || 0

    const avgCoinsPerSpin = totalSpins && totalSpins > 0 ? totalCoinsWon / totalSpins : 0

    // Get most won prize
    const { data: prizeStats } = await supabase.from("spin_history").select("prize_name")
    const prizeCounts: Record<string, number> = {}
    prizeStats?.forEach((row) => {
      prizeCounts[row.prize_name] = (prizeCounts[row.prize_name] || 0) + 1
    })
    const mostWonPrize = Object.entries(prizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"

    // Get active force wins count
    const { count: activeForceWins } = await supabase
      .from("spin_wheel_force_wins")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get settings
    const { data: settings } = await supabase.from("spin_wheel_settings").select("*").limit(1).single()

    // Get recent spins with user info
    const { data: recentSpins } = await supabase
      .from("spin_history")
      .select("id, user_id, prize_id, prize_name, coins_won, created_at, spin_type")
      .order("created_at", { ascending: false })
      .limit(50)

    // Fetch user info for recent spins
    const userIds = [...new Set(recentSpins?.map((s) => s.user_id) || [])]
    let userMap = new Map()

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, name, username, avatar, discord_id")
        .in("discord_id", userIds)
      userMap = new Map(users?.map((u) => [u.discord_id, u]) || [])
    }

    const recentSpinsWithUsers =
      recentSpins?.map((spin) => ({
        ...spin,
        user: userMap.get(spin.user_id) || null,
      })) || []

    return NextResponse.json({
      stats: {
        totalSpins: totalSpins || 0,
        totalCoinsWon,
        uniqueSpinners,
        todaySpins,
        todayCoinsWon,
        avgCoinsPerSpin: Math.round(avgCoinsPerSpin * 10) / 10,
        mostWonPrize,
        activeForceWins: activeForceWins || 0,
      },
      recentSpins: recentSpinsWithUsers,
      settings: settings || {
        daily_free_spins: 0,
        spin_cost_coins: 0,
        is_enabled: true,
        jackpot_threshold: 500,
      },
    })
  } catch (error) {
    console.error("Error fetching spin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
