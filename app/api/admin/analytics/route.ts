import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function checkAdmin(supabase: any, discordId: string): Promise<boolean> {
  const { data } = await supabase.from("users").select("is_admin").eq("discord_id", discordId).single()
  return data?.is_admin === true
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"
    
    // Calculate date range
    const now = new Date()
    const daysBack = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get user statistics
    const { data: userStats } = await supabase
      .from("users")
      .select("id, created_at, last_seen")
      .gte("created_at", startDate.toISOString())

    const { count: totalUsersCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    const { count: activeUsersCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())

    // Get asset statistics
    const { data: assetStats } = await supabase
      .from("assets")
      .select("id, downloads, created_at")
      .gte("created_at", startDate.toISOString())

    const { count: totalAssetsCount } = await supabase
      .from("assets")
      .select("*", { count: "exact", head: true })

    const totalDownloads = assetStats?.reduce((sum, asset) => sum + (asset.downloads || 0), 0) || 0

    // Get forum statistics
    const { data: forumStats } = await supabase
      .from("forum_threads")
      .select("id, created_at")
      .gte("created_at", startDate.toISOString())

    const { data: forumReplies } = await supabase
      .from("forum_replies")
      .select("id, created_at")
      .gte("created_at", startDate.toISOString())

    const { count: threadsCount } = await supabase
      .from("forum_threads")
      .select("*", { count: "exact", head: true })

    // Get revenue statistics (mock data for now)
    const revenue = {
      total: 15420,
      monthly: 3240,
      coins: 125000,
      growth: 12.5
    }

    // Generate traffic data for charts
    const dayKeys: string[] = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dayKeys.push(date.toISOString().split("T")[0])
    }

    const [downloadsRows, assetsCreatedRows, newUsersRows, threadsCreatedRows, repliesCreatedRows] = await Promise.all([
      supabase.from("downloads").select("created_at").gte("created_at", startDate.toISOString()).limit(10000),
      supabase.from("assets").select("created_at").gte("created_at", startDate.toISOString()).limit(10000),
      supabase.from("users").select("created_at").gte("created_at", startDate.toISOString()).limit(10000),
      supabase.from("forum_threads").select("created_at").gte("created_at", startDate.toISOString()).eq("is_deleted", false).limit(10000),
      supabase.from("forum_replies").select("created_at").gte("created_at", startDate.toISOString()).eq("is_deleted", false).limit(10000),
    ])

    const bucket: Record<string, { visitors: number; pageViews: number; downloads: number }> = {}
    for (const key of dayKeys) {
      bucket[key] = { visitors: 0, pageViews: 0, downloads: 0 }
    }

    const safeDay = (iso?: string) => (iso ? iso.split("T")[0] : "")

    for (const row of newUsersRows.data || []) {
      const key = safeDay((row as any).created_at)
      if (bucket[key]) bucket[key].visitors += 1
    }

    for (const row of downloadsRows.data || []) {
      const key = safeDay((row as any).created_at)
      if (bucket[key]) {
        bucket[key].downloads += 1
        bucket[key].pageViews += 1
      }
    }

    for (const row of assetsCreatedRows.data || []) {
      const key = safeDay((row as any).created_at)
      if (bucket[key]) bucket[key].pageViews += 1
    }

    for (const row of threadsCreatedRows.data || []) {
      const key = safeDay((row as any).created_at)
      if (bucket[key]) bucket[key].pageViews += 1
    }

    for (const row of repliesCreatedRows.data || []) {
      const key = safeDay((row as any).created_at)
      if (bucket[key]) bucket[key].pageViews += 1
    }

    const trafficData: Array<{ date: string; visitors: number; pageViews: number; downloads: number }> = dayKeys.map((key) => ({
      date: key,
      visitors: bucket[key].visitors,
      pageViews: bucket[key].pageViews,
      downloads: bucket[key].downloads,
    }))

    // Get category distribution
    const { data: categoryData } = await supabase
      .from("assets")
      .select("category")

    const categoryStats = categoryData?.reduce((acc: any, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1
      return acc
    }, {}) || {}

    const categories = Object.entries(categoryStats).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
      color: ['#3b82f6', '#8b5cf6', '#06d6a0', '#f59e0b', '#ef4444'][index % 5]
    }))

    // Get top assets
    const { data: topAssets } = await supabase
      .from("assets")
      .select("id, title, downloads, category")
      .order("downloads", { ascending: false })
      .limit(10)

    const maxDownloads = topAssets?.reduce((m, a) => Math.max(m, a.downloads || 0), 0) || 0
    const topAssetsWithRating = topAssets?.map(asset => {
      const ratio = maxDownloads > 0 ? (asset.downloads || 0) / maxDownloads : 0
      const rating = Math.round((3 + 2 * ratio) * 10) / 10
      return {
        ...asset,
        rating,
      }
    }) || []

    // Generate user activity data
    const activityStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const { data: recentActivity } = await supabase
      .from("activities")
      .select("created_at, user_id")
      .gte("created_at", activityStart.toISOString())
      .limit(10000)

    const activityByHour: Record<number, { users: Set<string>; count: number }> = {}
    for (let h = 0; h < 24; h++) {
      activityByHour[h] = { users: new Set<string>(), count: 0 }
    }

    for (const row of recentActivity || []) {
      const createdAt = (row as any).created_at
      const userId = (row as any).user_id
      if (!createdAt) continue
      const d = new Date(createdAt)
      const hour = d.getHours()
      if (!activityByHour[hour]) continue
      activityByHour[hour].count += 1
      if (userId) activityByHour[hour].users.add(String(userId))
    }

    const userActivity: Array<{ hour: string; users: number; activity: number }> = []
    for (let hour = 0; hour < 24; hour++) {
      userActivity.push({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        users: activityByHour[hour].users.size,
        activity: activityByHour[hour].count,
      })
    }

    const { data: threadsAuthors } = await supabase
      .from("forum_threads")
      .select("author_id")
      .gte("created_at", activityStart.toISOString())
      .eq("is_deleted", false)
      .limit(10000)

    const { data: repliesAuthors } = await supabase
      .from("forum_replies")
      .select("author_id")
      .gte("created_at", activityStart.toISOString())
      .eq("is_deleted", false)
      .limit(10000)

    const activeForumUsers = new Set<string>()
    for (const row of threadsAuthors || []) {
      if ((row as any).author_id) activeForumUsers.add(String((row as any).author_id))
    }
    for (const row of repliesAuthors || []) {
      if ((row as any).author_id) activeForumUsers.add(String((row as any).author_id))
    }

    // Calculate growth percentages
    const userGrowth = userStats ? (userStats.length / ((totalUsersCount || 0) + 1)) * 100 : 0
    const assetGrowth = assetStats ? (assetStats.length / ((totalAssetsCount || 0) + 1)) * 100 : 0
    const forumGrowth = forumStats ? (forumStats.length / (((threadsCount || 0) + 1))) * 100 : 0

    const analyticsData = {
      users: {
        total: totalUsersCount || 0,
        active: activeUsersCount || 0,
        new: userStats?.length || 0,
        growth: Math.round(userGrowth * 100) / 100
      },
      assets: {
        total: totalAssetsCount || 0,
        downloads: totalDownloads,
        uploads: assetStats?.length || 0,
        growth: Math.round(assetGrowth * 100) / 100
      },
      forum: {
        threads: threadsCount || 0,
        replies: forumReplies?.length || 0,
        active: activeForumUsers.size,
        growth: Math.round(forumGrowth * 100) / 100
      },
      revenue,
      traffic: trafficData,
      categories,
      topAssets: topAssetsWithRating,
      userActivity
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}