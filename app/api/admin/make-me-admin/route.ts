import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Update user to admin
    const { data, error } = await supabase
      .from("users")
      .update({
        is_admin: true,
        role: "admin",
        membership: "admin",
        coins: 999999,
      })
      .eq("discord_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error making user admin:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] User promoted to admin:", data)

    return NextResponse.json({
      success: true,
      message: "You are now an admin!",
      user: data,
    })
  } catch (error: any) {
    console.error("[v0] Make admin error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
