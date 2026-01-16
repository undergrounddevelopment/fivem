import { createClient, createAdminClient } from "@/lib/supabase/server"
import { XP_CONFIG, BADGES } from "@/lib/xp-badges"

// XP Activities Configuration (Mapped with key compatibility)
export const XP_ACTIVITIES = {
  upload_asset: XP_CONFIG.rewards.UPLOAD_ASSET,
  create_thread: XP_CONFIG.rewards.CREATE_THREAD,
  create_reply: XP_CONFIG.rewards.CREATE_REPLY,
  receive_like: XP_CONFIG.rewards.RECEIVE_LIKE,
  daily_login: XP_CONFIG.rewards.DAILY_LOGIN,
  asset_download: XP_CONFIG.rewards.ASSET_DOWNLOADED,
}

// Badge Tiers Configuration (Synced with levels)
export const BADGE_TIERS = XP_CONFIG.levels.map(level => {
  const badge = BADGES.find(b => b.requirement.type === 'level' && b.requirement.value === level.level)
  return {
    tier: level.level,
    name: level.title,
    minXp: level.minXP,
    maxXp: XP_CONFIG.levels.find(l => l.level === level.level + 1)?.minXP ? XP_CONFIG.levels.find(l => l.level === level.level + 1)!.minXP - 1 : 999999,
    color: badge?.color || "#9CA3AF",
    icon: badge?.icon || "/badges/badge1.png"
  }
})

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

  // Get user XP stats and activity counts
  getUserXPStats: async (userId: string) => {
    try {
      const supabase = createAdminClient()

      // Fetch user basic info
      const { data: user, error } = await supabase
        .from("users")
        .select("id, discord_id, xp, badge_tier, membership, created_at")
        .or(`id.eq.${userId},discord_id.eq.${userId}`)
        .single()

      if (error || !user) return null

      // Count Thread Posts
      const { count: threadsCount } = await supabase
        .from("forum_threads")
        .select("*", { count: 'exact', head: true })
        .eq("author_id", user.id)

      // Count Replies
      const { count: repliesCount } = await supabase
        .from("forum_replies")
        .select("*", { count: 'exact', head: true })
        .eq("author_id", user.id)

      // Count Assets Uploaded and their likes/downloads
      const { data: assets } = await supabase
        .from("assets")
        .select("downloads, likes")
        .eq("author_id", user.id)

      const assetsCount = assets?.length || 0
      const totalAssetDownloads = assets?.reduce((sum, a) => sum + (a.downloads || 0), 0) || 0
      const assetLikes = assets?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0

      // Count Thread Likes
      const { data: threadLikes } = await supabase
        .from("forum_threads")
        .select("likes")
        .eq("author_id", user.id)
      const totalThreadLikes = threadLikes?.reduce((sum, t) => sum + (t.likes || 0), 0) || 0

      // Count Reply Likes
      const { data: replyLikes } = await supabase
        .from("forum_replies")
        .select("likes")
        .eq("author_id", user.id)
      const totalReplyLikes = replyLikes?.reduce((sum, r) => sum + (r.likes || 0), 0) || 0

      const totalLikesReceived = assetLikes + totalThreadLikes + totalReplyLikes

      const currentTier = BADGE_TIERS.find(t => t.tier === (user.badge_tier || 1)) || BADGE_TIERS[0]
      const nextTier = BADGE_TIERS.find(t => t.tier === (user.badge_tier || 1) + 1)

      const progress = nextTier
        ? ((user.xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100
        : 100

      const userStats = {
        level: user.badge_tier || 1,
        posts: (threadsCount || 0) + (repliesCount || 0),
        threads: threadsCount || 0,
        likes_received: totalLikesReceived,
        assets: assetsCount,
        asset_downloads: totalAssetDownloads,
        membership: (user.membership as string) || "member",
        created_at: user.created_at
      }

      return {
        userId: user.id,
        discordId: user.discord_id,
        xp: user.xp || 0,
        badgeTier: user.badge_tier || 1,
        currentBadge: currentTier,
        nextBadge: nextTier,
        progress: Math.min(Math.max(progress, 0), 100),
        xpToNext: nextTier ? nextTier.minXp - user.xp : 0,
        userStats
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
