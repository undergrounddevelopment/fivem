import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
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

    const supabase = getSupabaseAdminClient()

    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("coins, username, is_banned")
      .eq("discord_id", userId)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (action === "remove" && targetUser.coins < amount) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
    }

    const increment = action === "remove" ? -amount : amount
    const newCoins = targetUser.coins + increment

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("discord_id", userId)
      .select()
      .single()

    if (updateError) throw updateError

    // Create transaction record
    await supabase.from("coin_transactions").insert({
      user_id: userId,
      amount: increment,
      type: "admin_adjust",
      description: reason || (action === "remove" ? "Admin removed coins" : "Admin added coins"),
    })

    security.logSecurityEvent(
      "Admin adjusted user coins",
      {
        adminId: session.user.id,
        targetUserId: userId,
        targetUsername: targetUser.username,
        action,
        amount,
        previousBalance: targetUser.coins,
        newBalance: updatedUser.coins,
        reason,
      },
      "medium",
    )

    return NextResponse.json({
      success: true,
      totalCoins: updatedUser.coins,
      change: increment,
      action,
    })
  } catch (error) {
    console.error("Admin coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
