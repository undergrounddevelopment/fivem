import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const discordId = session.user.id

    const { data: userData } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", discordId)
      .single()

    if (!userData?.is_admin && userData?.membership !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const stats = {
      totalUsers: 0,
      totalBanners: 0,
      activeBanners: 0,
      totalAnnouncements: 0,
      activeAnnouncements: 0,
      forumCategories: 0,
      totalSpins: 0,
      totalCoinsWon: 0,
      pendingAssets: 0,
    }

    try {
      const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })
      stats.totalUsers = totalUsers || 0
    } catch (e) {
      console.log("[v0] users table not accessible")
    }

    try {
      const { count: totalBanners } = await supabase.from("banners").select("*", { count: "exact", head: true })
      stats.totalBanners = totalBanners || 0
    } catch (e) {
      console.log("[v0] banners table not accessible")
    }

    try {
      const { count: activeBanners } = await supabase
        .from("banners")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
      stats.activeBanners = activeBanners || 0
    } catch (e) {
      console.log("[v0] active banners query failed")
    }

    try {
      const { count: totalAnnouncements } = await supabase
        .from("announcements")
        .select("*", { count: "exact", head: true })
      stats.totalAnnouncements = totalAnnouncements || 0
    } catch (e) {
      console.log("[v0] announcements table not accessible")
    }

    try {
      const { count: activeAnnouncements } = await supabase
        .from("announcements")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
      stats.activeAnnouncements = activeAnnouncements || 0
    } catch (e) {
      console.log("[v0] active announcements query failed")
    }

    try {
      const { count: forumCategories } = await supabase
        .from("forum_categories")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
      stats.forumCategories = forumCategories || 0
    } catch (e) {
      console.log("[v0] forum_categories table not accessible")
    }

    try {
      const { count: totalSpins } = await supabase.from("spin_history").select("*", { count: "exact", head: true })
      stats.totalSpins = totalSpins || 0
    } catch (e) {
      console.log("[v0] spin_history table not accessible")
    }

    try {
      const { data: coinsData } = await supabase.from("spin_history").select("prize_amount")
      stats.totalCoinsWon = coinsData?.reduce((sum, s) => sum + (s.prize_amount || 0), 0) || 0
    } catch (e) {
      console.log("[v0] spin_history coins query failed")
    }

    try {
      const { count: pendingAssets } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
      stats.pendingAssets = pendingAssets || 0
    } catch (e) {
      console.log("[v0] assets table not accessible")
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
