import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Get overview stats
    const [
      { count: totalUsers },
      { count: totalAssets },
      { data: downloads },
      { count: totalThreads },
      { count: totalReplies },
      { data: ratings }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('assets').select('*', { count: 'exact', head: true }),
      supabase.from('downloads').select('*'),
      supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
      supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
      supabase.from('assets').select('rating').not('rating', 'is', null)
    ])

    const totalDownloads = downloads?.length || 0
    const avgRating = ratings?.reduce((acc, r) => acc + (r.rating || 0), 0) / (ratings?.length || 1)

    // Get daily stats from real database
    const dailyStatsData: { date: string; users: number; downloads: number; threads: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date()
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const [usersRes, downloadsRes, threadsRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString()),
        supabase.from('downloads').select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString()),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())
      ])

      dailyStatsData.push({
        date: dayStart.toLocaleDateString(),
        users: usersRes.count || 0,
        downloads: downloadsRes.count || 0,
        threads: threadsRes.count || 0
      })
    }
    const dailyStats = dailyStatsData

    // Get category stats
    const { data: categoryData } = await supabase
      .from('assets')
      .select('category')
      .not('category', 'is', null)

    const categoryStats = categoryData?.reduce((acc: any[], asset) => {
      const existing = acc.find(c => c.name === asset.category)
      if (existing) {
        existing.count++
      } else {
        acc.push({ name: asset.category, count: 1, color: '#8884d8' })
      }
      return acc
    }, []) || []

    // Get top assets
    const { data: topAssets } = await supabase
      .from('assets')
      .select('id, title, downloads, rating')
      .order('downloads', { ascending: false })
      .limit(5)

    // Get top users
    const { data: topUsers } = await supabase
      .from('users')
      .select('id, username, xp, level')
      .order('xp', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers || 0,
          totalAssets: totalAssets || 0,
          totalDownloads,
          totalThreads: totalThreads || 0,
          totalReplies: totalReplies || 0,
          activeUsers: Math.floor((totalUsers || 0) * 0.3),
          revenue: totalDownloads * 0.5,
          avgRating
        },
        charts: {
          dailyStats,
          categoryStats,
          topAssets: topAssets || [],
          topUsers: topUsers || []
        }
      }
    })
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}