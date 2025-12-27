import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!security.checkRateLimit(`daily_claim_${session.user.id}`, 10, 86400000)) {
      security.logSecurityEvent(
        "Daily claim rate limit exceeded",
        {
          userId: session.user.id,
        },
        "medium",
      )
      return NextResponse.json({ error: "Too many claim attempts" }, { status: 429 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("discord_id", session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.is_banned) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Check if already claimed today
    const { data: existingClaim } = await supabase
      .from("daily_rewards")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("claimed_at", today.toISOString().split("T")[0])
      .single()

    if (existingClaim) {
      return NextResponse.json(
        {
          error: "Daily coins already claimed today",
          nextClaim: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        { status: 400 },
      )
    }

    // Calculate daily amount based on membership
    const baseAmount = 25
    const membershipMultiplier: Record<string, number> = {
      free: 1,
      premium: 2,
      vip: 3,
      admin: 5,
    }

    const dailyAmount = baseAmount * (membershipMultiplier[user.membership] || 1)
    const newCoins = user.coins + dailyAmount

    // Update user coins
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("discord_id", session.user.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Record daily reward
    await supabase.from("daily_rewards").insert({
      user_id: session.user.id,
      amount: dailyAmount,
      streak: 1,
    })

    // Create coin transaction
    await supabase.from("coin_transactions").insert({
      user_id: session.user.id,
      amount: dailyAmount,
      type: "daily_claim",
      description: `Daily coins (${user.membership} member)`,
    })

    // Log successful claim
    security.logSecurityEvent(
      "Daily coins claimed",
      {
        userId: session.user.id,
        amount: dailyAmount,
        membership: user.membership,
        totalCoins: updatedUser.coins,
      },
      "low",
    )

    return NextResponse.json({
      success: true,
      coinsEarned: dailyAmount,
      totalCoins: updatedUser.coins,
      membership: user.membership,
      nextClaim: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    })
  } catch (error: any) {
    logger.error("Daily coins error", error, {
      endpoint: "/api/coins/daily",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
