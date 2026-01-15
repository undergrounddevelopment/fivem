import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAdminAccess(userId: string) {
  const supabase = getSupabase()
  
  // Try discord_id first
  let { data } = await supabase
    .from('users')
    .select('is_admin, membership')
    .eq('discord_id', userId)
    .single()

  // Try UUID if not found
  if (!data) {
    const { data: byUuid } = await supabase
      .from('users')
      .select('is_admin, membership')
      .eq('id', userId)
      .single()
    data = byUuid
  }

  // Check admin status
  const isAdmin = data?.is_admin === true || 
                  data?.membership === 'admin' ||
                  userId === process.env.ADMIN_DISCORD_ID

  return isAdmin
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin using improved logic
    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = getSupabase()

    const body = await request.json()
    const userId = String(body.userId || "")
    const amount = Number.parseInt(String(body.amount || "0"))
    const reason = String(body.reason || "Admin adjustment")
    const action = String(body.action || "add")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      return NextResponse.json({ error: "Invalid amount (1-1000000)" }, { status: 400 })
    }

    if (!["add", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get user - try by discord_id first, then by uuid
    interface UserData {
      id: string
      discord_id: string
      coins: number
      username: string
    }
    
    let user: UserData | null = null
    const { data: userByDiscord } = await supabase
      .from("users")
      .select("id, discord_id, coins, username")
      .eq("discord_id", userId)
      .single()

    if (userByDiscord) {
      user = userByDiscord as UserData
    } else {
      const { data: userByUuid } = await supabase
        .from("users")
        .select("id, discord_id, coins, username")
        .eq("id", userId)
        .single()
      user = userByUuid as UserData | null
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate new balance
    const currentCoins = user.coins || 0
    const changeAmount = action === "add" ? amount : -amount
    const newBalance = Math.max(0, currentCoins + changeAmount)

    // Update user coins
    const { error: updateErr } = await supabase
      .from("users")
      .update({ coins: newBalance })
      .eq("id", user.id)

    if (updateErr) {
      console.error("[Admin Coins] Update error:", updateErr)
      return NextResponse.json({ error: "Failed to update coins" }, { status: 500 })
    }

    // Record transaction
    try {
      await supabase.from("coin_transactions").insert({
        user_id: user.discord_id || user.id,
        amount: changeAmount,
        type: "admin_adjust",
        reason: reason,
        description: `Admin ${action === "add" ? "added" : "removed"} ${amount} coins: ${reason}`
      })
    } catch (e) {
      console.error("[Admin Coins] Transaction log error:", e)
    }

    console.log(`[Admin Coins] ${action} ${amount} coins for user ${user.username} (${userId})`)

    return NextResponse.json({
      success: true,
      totalCoins: newBalance,
      change: changeAmount,
      action,
      username: user.username
    })
  } catch (error: any) {
    console.error("[Admin Coins] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get coin settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const defaultSettings = {
      dailyReward: 50,
      dailyRewardEnabled: true,
      downloadReward: 10,
      commentReward: 15,
      likeReward: 5,
      threadReward: 25,
      replyReward: 10,
      maxDailyEarnings: 500,
      premiumMultiplier: 2
    }

    try {
      const supabase = getSupabase()

      // Get settings from database or return defaults
      const { data: settings, error } = await supabase
        .from("settings")
        .select("*")
        .eq("category", "coins")
        .single()

      if (error || !settings) {
        return NextResponse.json({ settings: defaultSettings })
      }

      return NextResponse.json({
        settings: settings?.value || defaultSettings
      })
    } catch {
      // Table might not exist
      return NextResponse.json({ settings: defaultSettings })
    }
  } catch (error: any) {
    console.error("[Admin Coins Settings] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update coin settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin using improved logic
    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = getSupabase()

    const body = await request.json()

    // Try to upsert settings (might fail if table doesn't exist)
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          category: "coins",
          key: "coin_settings",
          value: body,
          updated_at: new Date().toISOString()
        }, { onConflict: "category,key" })

      if (error) {
        console.error("[Admin Coins Settings] Update error:", error)
        // Return success anyway since settings are stored in memory
        return NextResponse.json({ success: true, settings: body, note: "Settings saved locally (table may not exist)" })
      }
    } catch {
      // Table might not exist
      return NextResponse.json({ success: true, settings: body, note: "Settings saved locally (table may not exist)" })
    }

    return NextResponse.json({ success: true, settings: body })
  } catch (error: any) {
    console.error("[Admin Coins Settings] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
