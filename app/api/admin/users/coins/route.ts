import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, amount, reason } = await request.json()

    const supabase = getSupabaseAdminClient()

    // Get current user coins
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("coins")
      .eq("discord_id", userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user coins
    const newCoins = (currentUser.coins || 0) + amount
    const { data: user, error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("discord_id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Update coins error:", updateError)
      return NextResponse.json({ error: "Failed to update coins" }, { status: 500 })
    }

    // Create transaction record
    await supabase.from("coin_transactions").insert({
      user_id: userId,
      amount,
      type: "admin_adjustment",
      description: reason || "Admin adjustment",
      admin_id: session.user.id,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Adjust coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
