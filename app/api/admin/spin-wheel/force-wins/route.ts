import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 }
  }

  const supabase = await createAdminClient()
  const { data: userData } = await supabase.from("users").select("id, is_admin, membership").eq("discord_id", session.user.id).single()

  const isAdmin = userData?.is_admin === true || userData?.membership === "admin"
  if (!isAdmin) {
    return { error: "Forbidden", status: 403 }
  }

  return { userData, supabase }
}

// GET - Fetch all force wins
export async function GET() {
  try {
    const result = await verifyAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { supabase } = result

    const { data: forceWins, error } = await supabase
      .from("spin_wheel_force_wins")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching force wins:", error)
      return NextResponse.json({ forceWins: [] })
    }

    if (!forceWins || forceWins.length === 0) {
      return NextResponse.json({ forceWins: [] })
    }

    // Get user info
    const userIds = [...new Set(forceWins.map((fw) => fw.user_id))]
    const { data: users } = await supabase
      .from("users")
      .select("id, name, username, avatar, discord_id")
      .in("discord_id", userIds)

    // Get prize info
    const prizeIds = [...new Set(forceWins.map((fw) => fw.prize_id))]
    const { data: prizes } = await supabase
      .from("spin_wheel_prizes")
      .select("id, name, coins, color")
      .in("id", prizeIds)

    // Enrich force wins with user and prize data
    const enrichedForceWins = forceWins.map((fw) => ({
      ...fw,
      user: users?.find((u) => u.discord_id === fw.user_id) || null,
      prize: prizes?.find((p) => p.id === fw.prize_id) || null,
    }))

    return NextResponse.json({ forceWins: enrichedForceWins })
  } catch (error) {
    console.error("Error in GET force-wins:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new force win
export async function POST(request: Request) {
  try {
    const result = await verifyAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { userData, supabase } = result

    const body = await request.json()
    const { user_id, prize_id, max_uses, expires_at } = body

    if (!user_id || !prize_id) {
      return NextResponse.json({ error: "User ID and Prize ID are required" }, { status: 400 })
    }

    // Check if user exists - search by discord_id or id
    const { data: targetUser } = await supabase
      .from("users")
      .select("id, discord_id")
      .or(`discord_id.eq.${user_id},id.eq.${user_id}`)
      .limit(1)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if prize exists
    const { data: prize } = await supabase.from("spin_wheel_prizes").select("id").eq("id", prize_id).single()

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 })
    }

    // Deactivate any existing active force wins for this user
    await supabase
      .from("spin_wheel_force_wins")
      .update({ is_active: false })
      .eq("user_id", targetUser.discord_id)
      .eq("is_active", true)

    // Create new force win
    const { data: forceWin, error } = await supabase
      .from("spin_wheel_force_wins")
      .insert({
        user_id: targetUser.discord_id,
        prize_id,
        max_uses: max_uses || null,
        expires_at: expires_at || null,
        is_active: true,
        use_count: 0,
        created_by: userData.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating force win:", error)
      return NextResponse.json({ error: "Failed to create force win" }, { status: 500 })
    }

    return NextResponse.json({ success: true, forceWin })
  } catch (error) {
    console.error("Error in POST force-wins:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update a force win
export async function PUT(request: Request) {
  try {
    const result = await verifyAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { supabase } = result

    const body = await request.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "Force win ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("spin_wheel_force_wins").update({ is_active }).eq("id", id)

    if (error) {
      console.error("Error updating force win:", error)
      return NextResponse.json({ error: "Failed to update force win" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT force-wins:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a force win
export async function DELETE(request: Request) {
  try {
    const result = await verifyAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { supabase } = result

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Force win ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("spin_wheel_force_wins").delete().eq("id", id)

    if (error) {
      console.error("Error deleting force win:", error)
      return NextResponse.json({ error: "Failed to delete force win" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE force-wins:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
