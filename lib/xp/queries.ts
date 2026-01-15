import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"

// XP Activities Configuration
export const XP_ACTIVITIES = {
  upload_asset: 100,
  create_thread: 50,
  create_reply: 20,
  receive_like: 10,
  daily_login: 10,
  asset_download: 15,
}

// Badge Tiers Configuration
export const BADGE_TIERS = [
  { tier: 1, name: "Beginner Bolt", minXp: 0, maxXp: 999, color: "#9CA3AF" },
  { tier: 2, name: "Intermediate Bolt", minXp: 1000, maxXp: 4999, color: "#10B981" },
  { tier: 3, name: "Advanced Bolt", minXp: 5000, maxXp: 14999, color: "#3B82F6" },
  { tier: 4, name: "Expert Bolt", minXp: 15000, maxXp: 49999, color: "#8B5CF6" },
  { tier: 5, name: "Legend Bolt", minXp: 50000, maxXp: 999999, color: "#F59E0B" },
]

export const xpQueries = {
  // Award XP to user
  awardXP: async (discordId: string, activity: string, referenceId?: string) => {
    try {
      const supabase = createAdminClient()
      const xpAmount = XP_ACTIVITIES[activity as keyof typeof XP_ACTIVITIES] || 0

      if (xpAmount === 0) {
        console.warn(`[XP] Unknown activity: ${activity}`)
        return { success: false, error: "Unknown activity" }
      }

      // Get user
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, xp, badge_tier")
        .eq("discord_id", discordId)
        .single()

      if (userError || !user) {
        console.error("[XP] User not found:", discordId)
        return { success: false, error: "User not found" }
      }

      const newXp = (user.xp || 0) + xpAmount
      const newBadgeTier = getBadgeTierFromXP(newXp)
      const badgeUpgraded = newBadgeTier > (user.badge_tier || 1)

      // Update user XP and badge tier
      const { error: updateError } = await supabase
        .from("users")
        .update({
          xp: newXp,
          badge_tier: newBadgeTier
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("[XP] Update error:", updateError)
        return { success: false, error: updateError.message }
      }

      // Record activity
      await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          action: activity,
          details: referenceId ? `Reference: ${referenceId}` : null,
          xp_earned: xpAmount,
        })


      console.log(`[XP] Awarded ${xpAmount} XP to ${discordId} for ${activity}`)

      return {
        success: true,
        xpAwarded: xpAmount,
        newXp,
        newBadgeTier,
        badgeUpgraded,
      }
    } catch (error: any) {
      console.error("[XP] Award error:", error)
      return { success: false, error: error.message }
    }
  },

  // Get user XP stats
  getUserXPStats: async (discordId: string) => {
    try {
      const supabase = await createClient()

      const { data: user, error } = await supabase
        .from("users")
        .select("xp, badge_tier")
        .eq("discord_id", discordId)
        .single()

      if (error || !user) return null

      const currentTier = BADGE_TIERS.find(t => t.tier === (user.badge_tier || 1)) || BADGE_TIERS[0]
      const nextTier = BADGE_TIERS.find(t => t.tier === (user.badge_tier || 1) + 1)

      const progress = nextTier
        ? ((user.xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100
        : 100

      return {
        xp: user.xp || 0,
        badgeTier: user.badge_tier || 1,
        currentBadge: currentTier,
        nextBadge: nextTier,
        progress: Math.min(Math.max(progress, 0), 100),
        xpToNext: nextTier ? nextTier.minXp - user.xp : 0,
      }
    } catch (error) {
      console.error("[XP] Get stats error:", error)
      return null
    }
  },

  // Get XP leaderboard
  getLeaderboard: async (limit = 50) => {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("users")
        .select("discord_id, username, avatar, xp, badge_tier")
        .order("xp", { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((user, index) => ({
        rank: index + 1,
        discordId: user.discord_id,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp || 0,
        badgeTier: user.badge_tier || 1,
        badge: BADGE_TIERS.find(t => t.tier === (user.badge_tier || 1)) || BADGE_TIERS[0],
      }))
    } catch (error) {
      console.error("[XP] Leaderboard error:", error)
      return []
    }
  },

  // Get user activities
  getUserActivities: async (discordId: string, limit = 20) => {
    try {
      const supabase = await createClient()

      // Get user ID first
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("discord_id", discordId)
        .single()

      if (!user) return []

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[XP] Get activities error:", error)
      return []
    }
  },
}

// Helper function to get badge tier from XP
export function getBadgeTierFromXP(xp: number): number {
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (xp >= BADGE_TIERS[i].minXp) {
      return BADGE_TIERS[i].tier
    }
  }
  return 1
}

// Helper function to get badge info
export function getBadgeInfo(tier: number) {
  return BADGE_TIERS.find(t => t.tier === tier) || BADGE_TIERS[0]
}
