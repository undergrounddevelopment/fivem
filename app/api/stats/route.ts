import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Ambil statistik real dari database
    const [
      usersResult,
      assetsResult, 
      threadsResult,
      repliesResult,
      downloadsResult,
      onlineResult
    ] = await Promise.allSettled([
      supabase.from("users").select("count", { count: "exact" }),
      supabase.from("assets").select("count", { count: "exact" }).eq("status", "approved"),
      supabase.from("forum_threads").select("count", { count: "exact" }),
      supabase.from("forum_replies").select("count", { count: "exact" }),
      supabase.from("downloads").select("count", { count: "exact" }),
      supabase.from("users").select("count", { count: "exact" })
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