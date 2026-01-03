import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Ambil statistik real dari database
    const [
      usersResult,
      assetsResult, 
      threadsResult,
      repliesResult,
      downloadsResult,
      onlineResult
    ] = await Promise.allSettled([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("assets").select("*", { count: "exact", head: true }).in("status", ["active", "pending"]),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("downloads").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true })
        .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    ])

    const stats = {
      totalUsers: usersResult.status === "fulfilled" ? usersResult.value.count || 0 : 0,
      totalAssets: assetsResult.status === "fulfilled" ? assetsResult.value.count || 0 : 0,
      totalThreads: threadsResult.status === "fulfilled" ? threadsResult.value.count || 0 : 0,
      totalPosts: repliesResult.status === "fulfilled" ? repliesResult.value.count || 0 : 0,
      totalDownloads: downloadsResult.status === "fulfilled" ? downloadsResult.value.count || 0 : 0,
      onlineUsers: onlineResult.status === "fulfilled" ? onlineResult.value.count || 0 : 0,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch stats",
      data: {
        totalUsers: 0,
        totalAssets: 0,
        totalThreads: 0,
        totalPosts: 0,
        totalDownloads: 0,
        onlineUsers: 0,
        lastUpdated: new Date().toISOString()
      }
    }, { status: 500 })
  }
}