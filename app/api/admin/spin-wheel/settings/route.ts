import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

// Helper function to verify admin status
async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 }
  }

  const supabase = await createAdminClient()
  const { data: userData } = await supabase.from("users").select("id, role").eq("discord_id", session.user.id).single()

  if (!userData || !["admin", "owner", "vip"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 }
  }

  return { userData, supabase }
}

// GET - Fetch settings
export async function GET() {
  try {
    const result = await verifyAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { supabase } = result

    const { data: settings } = await supabase.from("spin_wheel_settings").select("*").single()

    return NextResponse.json({
      settings: settings || {
        daily_free_spins: 1,
        spin_cost_coins: 50,
        is_enabled: true,
        jackpot_threshold: 500,
      },
    })
  } catch (error) {
    console.error("Error in GET settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const result = await verifyAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { supabase } = result

    const body = await request.json()
    const { daily_free_spins, spin_cost_coins, is_enabled, jackpot_threshold } = body

    // Check if settings exist
    const { data: existing } = await supabase.from("spin_wheel_settings").select("id").single()

    let error
    if (existing) {
      // Update
      const result = await supabase
        .from("spin_wheel_settings")
        .update({
          daily_free_spins,
          spin_cost_coins,
          is_enabled,
          jackpot_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
      error = result.error
    } else {
      // Insert
      const result = await supabase.from("spin_wheel_settings").insert({
        daily_free_spins,
        spin_cost_coins,
        is_enabled,
        jackpot_threshold,
      })
      error = result.error
    }

    if (error) {
      console.error("Error updating settings:", error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
