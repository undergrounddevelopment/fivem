import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, amount, reason } = await request.json()

    if (amount > 0) {
      await db.coins.addCoins({ user_id: userId, amount, type: 'admin_adjustment', description: reason })
    } else {
      await db.coins.addCoins({ user_id: userId, amount: -Math.abs(amount), type: 'admin_adjustment', description: reason })
    }

    const newBalance = await db.coins.getUserBalance(userId)

    return NextResponse.json({ success: true, user: { coins: newBalance } })
  } catch (error) {
    console.error("Adjust coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
