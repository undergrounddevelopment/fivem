import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    if (!security.checkRateLimit(`stats_${clientIP}`, 100, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const supabase = getSupabaseAdminClient()

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const [usersResult, assetsResult, downloadsResult, threadsResult, repliesResult, onlineResult] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).eq("is_banned", false),
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("downloads").select("*", { count: "exact", head: true }),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_banned", false)
        .gte("last_seen", fiveMinutesAgo),
    ])

    const totalUsers = usersResult.count || 0
    const totalAssets = assetsResult.count || 0
    const totalDownloads = downloadsResult.count || 0
    const totalThreads = threadsResult.count || 0
    const totalReplies = repliesResult.count || 0
    const onlineUsers = Math.max(1, onlineResult.count || 0)

    const stats = {
      users: totalUsers,
      assets: totalAssets,
      downloads: totalDownloads,
      posts: totalThreads + totalReplies,
      categories: 4,
      frameworks: 4,
      onlineUsers: onlineUsers,
      totalMembers: totalUsers,
      totalUsers: totalUsers,
      totalAssets: totalAssets,
      totalDownloads: totalDownloads,
      totalThreads: totalThreads,
      totalPosts: totalThreads + totalReplies,
    }

    security.logSecurityEvent(
      "Stats requested",
      {
        ip: clientIP,
        userAgent: request.headers.get("user-agent") || "unknown",
      },
      "low",
    )

    return NextResponse.json(stats)
  } catch (error: any) {
    logger.error("Stats API error", error, {
      endpoint: "/api/stats",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({
      users: 0,
      assets: 0,
      downloads: 0,
      posts: 0,
      categories: 4,
      frameworks: 4,
      onlineUsers: 1,
      totalMembers: 0,
      totalUsers: 0,
      totalAssets: 0,
      totalDownloads: 0,
      totalThreads: 0,
      totalPosts: 0,
    })
  }
}
