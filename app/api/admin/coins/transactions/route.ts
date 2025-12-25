import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: transactions, error } = await supabase
      .from("coin_transactions")
      .select(`
        id,
        amount,
        type,
        reason,
        created_at,
        user_id,
        users:user_id (
          username,
          avatar
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ transactions: [] })
    }

    const formattedTransactions = (transactions || []).map((t) => ({
      id: t.id,
      username: t.users?.username || "Unknown",
      avatar: t.users?.avatar || null,
      type: t.type,
      amount: t.amount,
      reason: t.reason || "No reason",
      date: new Date(t.created_at).toISOString().split("T")[0],
    }))

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error) {
    return NextResponse.json({ transactions: [] })
  }
}
