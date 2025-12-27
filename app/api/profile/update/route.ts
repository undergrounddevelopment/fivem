import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, username, bio, avatar } = body

    // Verify user is updating their own profile
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = getSupabaseAdminClient()

    // Update user profile
    const { data, error } = await supabase
      .from("users")
      .update({
        username: username || undefined,
        avatar: avatar || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("discord_id", userId)
      .select()
      .single()

    if (error) {
      logger.error("Profile update error", error, { userId })
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.discord_id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        membership: data.membership,
        coins: data.coins,
      },
    })
  } catch (error: any) {
    logger.error("Profile update error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
