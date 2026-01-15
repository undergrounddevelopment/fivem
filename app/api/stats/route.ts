import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const revalidate = 600 // Cache for 10 minutes

export async function GET(request: NextRequest) {
  try {
    console.log("[Stats API] Starting fetch...")
    const supabase = createAdminClient()

    // Ambil statistik real dari database
    const results = await Promise.allSettled([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("assets").select("*", { count: "exact", head: true }).in("status", ["active", "pending"]),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("downloads").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true })
        .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString()),
      supabase.from("testimonials").select("upvotes_received")
    ])

    // Log any failures
    results.forEach((res, i) => {
      if (res.status === "rejected") {
        console.error(`[Stats API] Promise ${i} rejected:`, res.reason)
      } else if (res.status === "fulfilled" && res.value?.error) {
        console.warn(`[Stats API] Query ${i} returned error:`, res.value.error)
      }
    })

    const getCount = (res: any) => {
      if (res.status === "fulfilled" && res.value && !res.value.error) {
        return res.value.count || 0
      }
      return 0
    }

    const upvotesResult = results[6]
    const totalUpvotes = upvotesResult.status === "fulfilled" && upvotesResult.value.data
      ? upvotesResult.value.data.reduce((sum: number, t: any) => sum + (t.upvotes_received || 0), 0)
      : 0

    const stats = {
      totalUsers: getCount(results[0]),
      totalMembers: getCount(results[0]), // Alias for components expecting totalMembers
      totalAssets: getCount(results[1]),
      totalThreads: getCount(results[2]),
      totalPosts: getCount(results[3]),
      totalReplies: getCount(results[3]), // Alias for clarity
      totalDownloads: getCount(results[4]),
      onlineUsers: getCount(results[5]),
      totalUpvotes: totalUpvotes,
      lastUpdated: new Date().toISOString()
    }


    console.log("[Stats API] Successfully calculated stats:", stats)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error("Stats API CRITICAL error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
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