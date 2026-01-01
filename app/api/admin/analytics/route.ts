import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"
    
    const supabase = createClient()
    
    // Calculate date range
    const now = new Date()
    const daysBack = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get user statistics
    const { data: userStats } = await supabase
      .from("users")
      .select("id, created_at, last_seen")
      .gte("created_at", startDate.toISOString())

    const { data: totalUsers } = await supabase
      .from("users")
      .select("count", { count: "exact" })

    const { data: activeUsers } = await supabase
      .from("users")
      .select("count", { count: "exact" })
      .gte("last_seen", new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString())

    // Get asset statistics
    const { data: assetStats } = await supabase
      .from("assets")
      .select("id, downloads, created_at")
      .gte("created_at", startDate.toISOString())

    const { data: totalAssets } = await supabase
      .from("assets")
      .select("count", { count: "exact" })

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

    const { data: totalThreads } = await supabase
      .from("forum_threads")
      .select("count", { count: "exact" })

    // Get revenue statistics (mock data for now)
    const revenue = {
      total: 15420,
      monthly: 3240,
      coins: 125000,
      growth: 12.5
    }

    // Generate traffic data for charts
    const trafficData = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      trafficData.push({
        date: date.toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 1000) + 500,
        pageViews: Math.floor(Math.random() * 3000) + 1500,
        downloads: Math.floor(Math.random() * 200) + 100
      })
    }

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

    const topAssetsWithRating = topAssets?.map(asset => ({
      ...asset,
      rating: Math.random() * 2 + 3 // Mock rating between 3-5
    })) || []

    // Generate user activity data
    const userActivity = []
    for (let hour = 0; hour < 24; hour++) {
      userActivity.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        users: Math.floor(Math.random() * 200) + 50,
        activity: Math.floor(Math.random() * 500) + 100
      })
    }

    // Calculate growth percentages
    const userGrowth = userStats ? (userStats.length / (totalUsers?.count || 1)) * 100 : 0
    const assetGrowth = assetStats ? (assetStats.length / (totalAssets?.count || 1)) * 100 : 0
    const forumGrowth = forumStats ? (forumStats.length / (totalThreads?.count || 1)) * 100 : 0

    const analyticsData = {
      users: {
        total: totalUsers?.count || 0,
        active: activeUsers?.count || 0,
        new: userStats?.length || 0,
        growth: Math.round(userGrowth * 100) / 100
      },
      assets: {
        total: totalAssets?.count || 0,
        downloads: totalDownloads,
        uploads: assetStats?.length || 0,
        growth: Math.round(assetGrowth * 100) / 100
      },
      forum: {
        threads: totalThreads?.count || 0,
        replies: forumReplies?.length || 0,
        active: Math.floor(Math.random() * 100) + 50,
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