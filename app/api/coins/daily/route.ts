import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!security.checkRateLimit(`daily_claim_${session.user.id}`, 10, 86400000)) {
      security.logSecurityEvent("Daily claim rate limit exceeded", { userId: session.user.id }, "medium")
      return NextResponse.json({ error: "Too many claim attempts" }, { status: 429 })
    }

    const userId = session.user.id
    const canClaim = await db.coins.canClaimDaily(userId, 'coins')

    if (!canClaim) {
      return NextResponse.json({ error: "Daily coins already claimed today" }, { status: 400 })
    }

    const amount = 25
    await db.coins.claimDailyReward(userId, 'coins', amount)
    const newBalance = await db.coins.getUserBalance(userId)

    security.logSecurityEvent("Daily coins claimed", { userId, amount }, "low")

    return NextResponse.json({
      success: true,
      coinsEarned: amount,
      totalCoins: newBalance,
    })
  } catch (error: any) {
    logger.error("Daily coins error", error, { endpoint: "/api/coins/daily" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
