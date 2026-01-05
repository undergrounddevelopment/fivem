import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()

    const now = Date.now()
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString()
    const hourAgo = new Date(now - 60 * 60 * 1000).toISOString()
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()

    const [onlineResult, downloadsResult, uploadsResult, threadsResult, repliesResult] = await Promise.all([
      supabase.from("users").select("discord_id", { count: "exact", head: true }).gte("last_seen", fiveMinutesAgo),
      supabase.from("downloads").select("id", { count: "exact", head: true }).gte("created_at", fiveMinutesAgo),
      supabase.from("assets").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
      supabase.from("forum_threads").select("id", { count: "exact", head: true }).gte("created_at", hourAgo).eq("is_deleted", false),
      supabase.from("forum_replies").select("id", { count: "exact", head: true }).gte("created_at", hourAgo).eq("is_deleted", false),
    ])

    const forumActivity = (threadsResult.count || 0) + (repliesResult.count || 0)

    return NextResponse.json({
      success: true,
      data: {
        online_users: onlineResult.count || 0,
        active_downloads: downloadsResult.count || 0,
        recent_uploads: uploadsResult.count || 0,
        forum_activity: forumActivity,
        total_revenue: 0,
        server_load: 0,
      },
    })
  } catch (error) {
    console.error("[realtime/stats] Error:", error)
    return NextResponse.json(
      {
        success: false,
        data: {
          online_users: 0,
          active_downloads: 0,
          recent_uploads: 0,
          forum_activity: 0,
          total_revenue: 0,
          server_load: 0,
        },
      },
      { status: 500 },
    )
  }
}
