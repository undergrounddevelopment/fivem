import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const adminId = process.env.ADMIN_DISCORD_ID || "1047719075322810378"

    const supabase = getSupabaseAdminClient()

    const { data: adminUser, error } = await supabase
      .from("users")
      .select("discord_id, username, is_admin, membership")
      .eq("discord_id", adminId)
      .single()

    return NextResponse.json({
      success: true,
      adminId,
      adminUser: adminUser
        ? {
            discordId: adminUser.discord_id,
            username: adminUser.username,
            isAdmin: adminUser.is_admin,
            membership: adminUser.membership,
          }
        : null,
      env: {
        hasAdminId: !!process.env.ADMIN_DISCORD_ID,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDiscordClientId: !!process.env.DISCORD_CLIENT_ID,
        hasDiscordClientSecret: !!process.env.DISCORD_CLIENT_SECRET,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
