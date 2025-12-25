import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// This endpoint allows setting the first user or a specific Discord ID as admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Get the target Discord ID from request or use current user
    const body = await request.json().catch(() => ({}))
    const targetDiscordId = body.discordId || session?.user?.id

    // Check if this is the secret admin setup (first time setup)
    const secretKey = request.headers.get("x-admin-secret")
    const envSecret = process.env.ADMIN_SECRET || "setup-admin-2024"

    const supabase = await getSupabaseAdminClient()

    // Count existing admins
    const { count: existingAdmins } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_admin", true)

    const isAuthorized = secretKey === envSecret || existingAdmins === 0 || session?.user?.isAdmin === true

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "Unauthorized. Use x-admin-secret header or be an existing admin.",
        },
        { status: 403 },
      )
    }

    if (!targetDiscordId) {
      return NextResponse.json({ error: "No Discord ID provided" }, { status: 400 })
    }

    // Update user to admin
    const { data: user, error } = await supabase
      .from("users")
      .update({
        is_admin: true,
        membership: "admin",
        coins: 999999,
      })
      .eq("discord_id", targetDiscordId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "User not found. Please login with Discord first.",
          },
          { status: 404 },
        )
      }
      throw error
    }

    console.log(`Admin set for Discord ID: ${targetDiscordId}`)

    return NextResponse.json({
      success: true,
      message: `User ${user.username} is now an admin`,
      user: {
        id: user.discord_id,
        username: user.username,
        isAdmin: user.is_admin,
        membership: user.membership,
      },
    })
  } catch (error: any) {
    console.error("Force admin error:", error)
    return NextResponse.json(
      {
        error: "Failed to set admin",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// GET: Check current admin status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const supabase = await getSupabaseAdminClient()

    const { count: adminCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_admin", true)

    const { data: admins } = await supabase
      .from("users")
      .select("discord_id, username, membership")
      .eq("is_admin", true)

    return NextResponse.json({
      currentUser: session?.user
        ? {
            id: session.user.id,
            isAdmin: session.user.isAdmin,
            membership: session.user.membership,
          }
        : null,
      adminCount: adminCount || 0,
      admins: admins || [],
      envAdminId: process.env.ADMIN_DISCORD_ID || "not set (using default)",
    })
  } catch (error) {
    console.error("Check admin error:", error)
    return NextResponse.json({ error: "Failed to check admin status" }, { status: 500 })
  }
}
