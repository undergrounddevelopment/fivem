import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized", transactions: [] }, { status: 401 })
    }

    const supabase = getSupabase()

    // Get transactions
    const { data: transactions, error } = await supabase
      .from("coin_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("[Transactions API] Error:", error)
      return NextResponse.json({ transactions: [] })
    }

    // Get user details for each transaction
    const userIds = [...new Set((transactions || []).map(t => t.user_id).filter(Boolean))]
    const usersMap: Record<string, any> = {}

    if (userIds.length > 0) {
      // Try discord_id first
      const { data: users1 } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar")
        .in("discord_id", userIds)

      for (const u of users1 || []) {
        usersMap[u.discord_id] = u
      }

      // Try uuid for any missing
      const missingIds = userIds.filter(id => !usersMap[id])
      if (missingIds.length > 0) {
        const { data: users2 } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar")
          .in("id", missingIds)

        for (const u of users2 || []) {
          usersMap[u.id] = u
        }
      }
    }

    const formattedTransactions = (transactions || []).map((t) => {
      const user = usersMap[t.user_id]
      return {
        id: t.id,
        username: user?.username || "Unknown User",
        avatar: user?.avatar || null,
        type: t.amount > 0 ? "add" : "remove",
        amount: Math.abs(t.amount),
        reason: t.reason || t.description || t.type || "No reason",
        date: t.created_at ? new Date(t.created_at).toISOString().split("T")[0] : "Unknown",
      }
    })

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error: any) {
    console.error("[Transactions API] Error:", error)
    return NextResponse.json({ transactions: [] })
  }
}
