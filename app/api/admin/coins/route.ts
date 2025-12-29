import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { security } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!security.checkRateLimit(`admin_coins_${session.user.id}`, 100, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await request.json()
    const userId = String(body.userId || "")
    const amount = Number.parseInt(String(body.amount || "0"))
    const reason = security.sanitizeInput(String(body.reason || ""))
    const action = String(body.action || "add")

    if (!userId || !security.isValidDiscordId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      return NextResponse.json({ error: "Invalid amount (1-100000)" }, { status: 400 })
    }

    if (!["add", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (action === "add") {
      await db.coins.addCoins({ user_id: userId, amount, type: 'admin_adjust', description: reason })
    } else {
      await db.coins.deductCoins({ user_id: userId, amount, type: 'admin_adjust', description: reason })
    }

    const newBalance = await db.coins.getUserBalance(userId)

    security.logSecurityEvent("Admin adjusted user coins", { adminId: session.user.id, userId, action, amount }, "medium")

    return NextResponse.json({ success: true, totalCoins: newBalance, change: action === "add" ? amount : -amount, action })
  } catch (error) {
    console.error("Admin coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}