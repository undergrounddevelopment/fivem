import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 }
  }

  const supabase = createAdminClient()
  const { data: userData } = await supabase.from("users").select("id, role").eq("discord_id", session.user.id).single()

  if (!userData?.role || !["admin", "owner", "vip"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 }
  }

  return { session, supabase, userData }
}

export async function GET() {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: eligibleUsers, error } = await auth.supabase
      .from("spin_wheel_eligible_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching eligible users:", error)
      return NextResponse.json({ eligibleUsers: [] })
    }

    // Get user details for each eligible user
    const userIds = eligibleUsers?.map((e) => e.user_id) || []

    if (userIds.length === 0) {
      return NextResponse.json({ eligibleUsers: [] })
    }

    const { data: users } = await auth.supabase
      .from("users")
      .select("id, name, username, avatar, role, discord_id")
      .in("id", userIds)

    const enrichedData = eligibleUsers?.map((eu) => ({
      ...eu,
      user: users?.find((u) => u.id === eu.user_id) || null,
    }))

    return NextResponse.json({ eligibleUsers: enrichedData || [] })
  } catch (error) {
    console.error("Error fetching eligible users:", error)
    return NextResponse.json({ error: "Failed to fetch eligible users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { user_id: raw_user_id, spins_remaining, reason, expires_at } = body

    if (!raw_user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Robust User Lookup (Discord ID or UUID)
    const { data: targetUser } = await auth.supabase
      .from("users")
      .select("id")
      .or(`discord_id.eq.${raw_user_id},id.eq.${raw_user_id}`)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user_id = targetUser.id

    // Check if entry already exists
    const { data: existing } = await auth.supabase
      .from("spin_wheel_eligible_users")
      .select("id, spins_remaining")
      .eq("user_id", user_id)
      .single()

    let result
    if (existing) {
      // Update existing - add spins to current balance
      result = await auth.supabase
        .from("spin_wheel_eligible_users")
        .update({
          spins_remaining: existing.spins_remaining + (spins_remaining || 1),
          reason: reason || "Admin grant",
          expires_at: expires_at || null,
          granted_by: auth.userData.id,
        })
        .eq("id", existing.id)
        .select()
        .single()
    } else {
      // Insert new
      result = await auth.supabase
        .from("spin_wheel_eligible_users")
        .insert({
          user_id,
          spins_remaining: (spins_remaining || 1),
          reason: reason || "Admin grant",
          expires_at: expires_at || null,
          granted_by: auth.userData.id,
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error("Error granting spins:", result.error)
      throw result.error
    }

    return NextResponse.json({ eligibleUser: result.data })
  } catch (error) {
    console.error("Error granting spins:", error)
    return NextResponse.json({ error: "Failed to grant spins" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { error } = await auth.supabase.from("spin_wheel_eligible_users").delete().eq("user_id", userId)

    if (error) {
      console.error("Error removing eligibility:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing eligibility:", error)
    return NextResponse.json({ error: "Failed to remove eligibility" }, { status: 500 })
  }
}
