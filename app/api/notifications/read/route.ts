import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let notificationId: string | undefined
    try {
      const body = await request.json()
      notificationId = body?.notificationId
    } catch {
      notificationId = undefined
    }

    const supabase = getSupabaseAdminClient()

    if (notificationId) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", session.user.id)
    } else {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("Mark read error", error, {
      endpoint: "/api/notifications/read",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
