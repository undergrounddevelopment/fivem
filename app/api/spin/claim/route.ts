import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { notifyAdmin } from "@/lib/discord-webhook"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { history_id } = await request.json()
    if (!history_id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // 1. Verify Ownership & Status
    const { data: record, error: fetchError } = await supabase
      .from("spin_wheel_history")
      .select("*, users(username, discord_id), spin_wheel_prizes(title, type, value)")
      .eq("id", history_id)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !record) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (record.claim_status !== 'unclaimed' && record.claim_status !== null) {
      return NextResponse.json({ error: "Item already claimed or pending" }, { status: 400 })
    }

    // 2. Update Status to Pending
    const { error: updateError } = await supabase
      .from("spin_wheel_history")
      .update({ 
        claim_status: 'pending',
        claimed_at: new Date().toISOString()
      })
      .eq("id", history_id)

    if (updateError) throw updateError

    // 3. Notify Admin
    await notifyAdmin(
      "Prize Claim Request",
      `User **${record.users?.username}** requested to claim **${record.spin_wheel_prizes?.title || 'Unknown Item'}**`,
      "claim",
      {
        "User": `${record.users?.username} (<@${record.users?.discord_id}>)`,
        "Prize": record.spin_wheel_prizes?.title,
        "History ID": history_id
      }
    )

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Claim Error:", error)
    return NextResponse.json({ error: "Claim failed" }, { status: 500 })
  }
}
