import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import type { Badge, UserBadge, XPTransaction, XPAwardResult, UserXPStats } from "./types"

export const xpQueries = {
  // Get all badges
  getBadges: async (): Promise<Badge[]> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("badges").select("*").order("tier", { ascending: true })

      if (error) throw error
      return (data || []).map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        imageUrl: b.image_url,
        minXp: b.min_xp,
        maxXp: b.max_xp,
        color: b.color,
        tier: b.tier,
      }))
    } catch (error) {
      console.error("[xpQueries.getBadges] Error:", error)
      return []
    }
  },

  // Get user's current badge
  getUserBadge: async (userId: string): Promise<Badge | null> => {
    try {
      const supabase = await createClient()
      const { data: user, error } = await supabase
        .from("users")
        .select("current_badge")
        .eq("discord_id", userId)
        .single()

      if (error || !user) return null

      const { data: badge, error: badgeError } = await supabase
        .from("badges")
        .select("*")
        .eq("id", user.current_badge)
        .single()

      if (badgeError) return null

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        imageUrl: badge.image_url,
        minXp: badge.min_xp,
        maxXp: badge.max_xp,
        color: badge.color,
        tier: badge.tier,
      }
    } catch (error) {
      console.error("[xpQueries.getUserBadge] Error:", error)
      return null
    }
  },

  // Get user's unlocked badges
  getUserBadges: async (userId: string): Promise<UserBadge[]> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("user_badges")
        .select(
          `
          *,
          badge:badges(*)
        `,
        )
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false })

      if (error) throw error
      return (data || []).map((ub) => ({
        id: ub.id,
        userId: ub.user_id,
        badgeId: ub.badge_id,
        unlockedAt: ub.unlocked_at,
        isEquipped: ub.is_equipped,
        badge: ub.badge
          ? {
              id: ub.badge.id,
              name: ub.badge.name,
              description: ub.badge.description,
              imageUrl: ub.badge.image_url,
              minXp: ub.badge.min_xp,
              maxXp: ub.badge.max_xp,
              color: ub.badge.color,
              tier: ub.badge.tier,
            }
          : undefined,
      }))
    } catch (error) {
      console.error("[xpQueries.getUserBadges] Error:", error)
      return []
    }
  },

  // Get XP transactions
  getXPTransactions: async (userId: string, limit = 50): Promise<XPTransaction[]> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("xp_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map((t) => ({
        id: t.id,
        userId: t.user_id,
        amount: t.amount,
        activityType: t.activity_type,
        description: t.description,
        referenceId: t.reference_id,
        createdAt: t.created_at,
      }))
    } catch (error) {
      console.error("[xpQueries.getXPTransactions] Error:", error)
      return []
    }
  },

  // Award XP
  awardXP: async (userId: string, activityId: string, referenceId?: string): Promise<XPAwardResult> => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase.rpc("award_xp", {
        p_user_id: userId,
        p_activity_id: activityId,
        p_reference_id: referenceId || null,
      })

      if (error) {
        console.error("[xpQueries.awardXP] Error:", error)
        return { success: false, error: error.message }
      }

      return data as XPAwardResult
    } catch (error: any) {
      console.error("[xpQueries.awardXP] Error:", error)
      return { success: false, error: error.message || "Failed to award XP" }
    }
  },

  // Get user XP stats
  getUserXPStats: async (userId: string): Promise<UserXPStats | null> => {
    try {
      const supabase = await createClient()

      // Get user data
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("xp, level, current_badge")
        .eq("discord_id", userId)
        .single()

      if (userError || !user) return null

      // Get all badges
      const badges = await xpQueries.getBadges()
      const currentBadge = badges.find((b) => b.id === user.current_badge)
      const nextBadge = badges.find((b) => b.tier === (currentBadge?.tier || 0) + 1) || null

      // Calculate progress
      const xpForNextBadge = nextBadge ? nextBadge.minXp - user.xp : 0
      const progress =
        currentBadge && nextBadge
          ? ((user.xp - currentBadge.minXp) / (nextBadge.minXp - currentBadge.minXp)) * 100
          : 100

      // Get transaction count
      const { count } = await supabase
        .from("xp_transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      // Get recent activities
      const recentActivities = await xpQueries.getXPTransactions(userId, 10)

      return {
        xp: user.xp,
        level: user.level,
        currentBadge: user.current_badge,
        badge: currentBadge || badges[0],
        nextBadge,
        xpForNextBadge,
        progress: Math.min(Math.max(progress, 0), 100),
        totalTransactions: count || 0,
        recentActivities,
      }
    } catch (error) {
      console.error("[xpQueries.getUserXPStats] Error:", error)
      return null
    }
  },

  // Get XP leaderboard
  getLeaderboard: async (
    limit = 100,
  ): Promise<Array<{ userId: string; username: string; avatar: string; xp: number; level: number; badge: string }>> => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("users")
        .select("discord_id, username, avatar, xp, level, current_badge")
        .order("xp", { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map((u) => ({
        userId: u.discord_id,
        username: u.username,
        avatar: u.avatar,
        xp: u.xp,
        level: u.level,
        badge: u.current_badge,
      }))
    } catch (error) {
      console.error("[xpQueries.getLeaderboard] Error:", error)
      return []
    }
  },
}
