import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminAccess(userId: string) {
  const supabase = getSupabase()
  
  // Try discord_id first
  let { data } = await supabase
    .from('users')
    .select('is_admin, membership')
    .eq('discord_id', userId)
    .single()

  // Try UUID if not found
  if (!data) {
    const { data: byUuid } = await supabase
      .from('users')
      .select('is_admin, membership')
      .eq('id', userId)
      .single()
    data = byUuid
  }

  // Check admin status
  const isAdmin = data?.is_admin === true || 
                  data?.membership === 'admin' ||
                  userId === process.env.ADMIN_DISCORD_ID

  return isAdmin
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    
    const supabase = createAdminClient()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      usersResult,
      bannersResult,
      announcementsResult,
      forumResult,
      spinsResult,
      coinsResult,
      assetsResult,
      todayUsersResult,
      weekUsersResult,
      threadsResult,
      pendingThreadsResult
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("banners").select("id, is_active", { count: "exact" }),
      supabase.from("announcements").select("id, is_active", { count: "exact" }),
      supabase.from("forum_categories").select("id", { count: "exact", head: true }),
      supabase.from("spin_history").select("id", { count: "exact", head: true }),
      supabase.from("spin_history").select("coins_won"),
      supabase.from("assets").select("id, status", { count: "exact" }),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      supabase.from("forum_threads").select("id", { count: "exact", head: true }),
      supabase.from("forum_threads").select("id", { count: "exact", head: true }).eq("status", "pending")
    ])

    const totalCoinsWon = coinsResult.data?.reduce((sum, record) => sum + (record.coins_won || 0), 0) || 0
    const activeBanners = bannersResult.data?.filter(b => b.is_active).length || 0
    const activeAnnouncements = announcementsResult.data?.filter(a => a.is_active).length || 0
    const pendingAssets = assetsResult.data?.filter(a => a.status === "pending").length || 0
    const activeAssets = assetsResult.data?.filter(a => a.status === "active").length || 0
    
    const totalUsers = usersResult.count || 0
    const todayUsers = todayUsersResult.count || 0
    const weekUsers = weekUsersResult.count || 0
    const weeklyGrowth = totalUsers > 0 ? Math.round((weekUsers / totalUsers) * 100) : 0

    return NextResponse.json({
      totalUsers,
      todayUsers,
      weeklyGrowth,
      totalBanners: bannersResult.count || 0,
      activeBanners,
      totalAnnouncements: announcementsResult.count || 0,
      activeAnnouncements,
      forumCategories: forumResult.count || 0,
      totalSpins: spinsResult.count || 0,
      totalCoinsWon,
      totalAssets: assetsResult.count || 0,
      pendingAssets,
      activeAssets,
      totalThreads: threadsResult.count || 0,
      pendingThreads: pendingThreadsResult.count || 0
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
