/**
 * Unified Notification System
 * Handles both database notifications and toast notifications
 */

import { getSupabaseAdminClient } from "@/lib/supabase/server"

export type NotificationType = 
  | "reply" 
  | "mention" 
  | "like" 
  | "download" 
  | "achievement" 
  | "badge" 
  | "reward" 
  | "coins" 
  | "follow" 
  | "xp"
  | "level_up"
  | "new_asset"
  | "comment"
  | "system"

export interface NotificationData {
  userId: string // discord_id of the recipient
  type: NotificationType
  title: string
  message?: string
  link?: string
  metadata?: Record<string, any>
}

/**
 * Create a notification in the database
 * This will be shown in the notification bell dropdown
 */
export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient()
    
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message || "",
        link: data.link || "",
        metadata: data.metadata || {},
        is_read: false,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error("[Notification] Failed to create:", error)
      return false
    }

    console.log(`[Notification] Created for user ${data.userId}: ${data.title}`)
    return true
  } catch (error) {
    console.error("[Notification] Error:", error)
    return false
  }
}

/**
 * Create multiple notifications at once
 */
export async function createNotifications(notifications: NotificationData[]): Promise<number> {
  if (!notifications || notifications.length === 0) return 0

  try {
    const supabase = getSupabaseAdminClient()
    
    const records = notifications.map(n => ({
      user_id: n.userId,
      type: n.type,
      title: n.title,
      message: n.message || "",
      link: n.link || "",
      metadata: n.metadata || {},
      is_read: false,
      created_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from("notifications")
      .insert(records)

    if (error) {
      console.error("[Notification] Failed to create batch:", error)
      return 0
    }

    return notifications.length
  } catch (error) {
    console.error("[Notification] Batch error:", error)
    return 0
  }
}

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
  // Forum notifications
  threadReply: (threadTitle: string, replierName: string, threadId: string): Omit<NotificationData, "userId"> => ({
    type: "reply",
    title: "New Reply",
    message: `${replierName} replied to your thread: "${threadTitle}"`,
    link: `/forum/thread/${threadId}`,
  }),

  threadMention: (threadTitle: string, mentionerName: string, threadId: string): Omit<NotificationData, "userId"> => ({
    type: "mention",
    title: "You were mentioned",
    message: `${mentionerName} mentioned you in: "${threadTitle}"`,
    link: `/forum/thread/${threadId}`,
  }),

  threadLike: (threadTitle: string, likerName: string, threadId: string): Omit<NotificationData, "userId"> => ({
    type: "like",
    title: "Thread Liked",
    message: `${likerName} liked your thread: "${threadTitle}"`,
    link: `/forum/thread/${threadId}`,
  }),

  // Asset notifications
  assetDownload: (assetTitle: string, downloaderName: string, assetId: string): Omit<NotificationData, "userId"> => ({
    type: "download",
    title: "Asset Downloaded",
    message: `${downloaderName} downloaded your asset: "${assetTitle}"`,
    link: `/asset/${assetId}`,
  }),

  assetComment: (assetTitle: string, commenterName: string, assetId: string): Omit<NotificationData, "userId"> => ({
    type: "comment",
    title: "New Comment",
    message: `${commenterName} commented on: "${assetTitle}"`,
    link: `/asset/${assetId}`,
  }),

  assetLike: (assetTitle: string, likerName: string, assetId: string): Omit<NotificationData, "userId"> => ({
    type: "like",
    title: "Asset Liked",
    message: `${likerName} liked your asset: "${assetTitle}"`,
    link: `/asset/${assetId}`,
  }),

  // XP & Achievement notifications
  xpGained: (amount: number, reason: string): Omit<NotificationData, "userId"> => ({
    type: "xp",
    title: `+${amount} XP`,
    message: reason,
    link: "/dashboard",
  }),

  levelUp: (newLevel: number, badgeName: string): Omit<NotificationData, "userId"> => ({
    type: "level_up",
    title: "Level Up!",
    message: `You reached Level ${newLevel} and earned the "${badgeName}" badge!`,
    link: "/badges",
  }),

  badgeUnlocked: (badgeName: string): Omit<NotificationData, "userId"> => ({
    type: "badge",
    title: "Badge Unlocked",
    message: `You earned the "${badgeName}" badge!`,
    link: "/badges",
  }),

  achievementUnlocked: (achievementName: string): Omit<NotificationData, "userId"> => ({
    type: "achievement",
    title: "Achievement Unlocked",
    message: `You unlocked: "${achievementName}"`,
    link: "/dashboard",
  }),

  // Reward notifications
  coinsReceived: (amount: number, reason: string): Omit<NotificationData, "userId"> => ({
    type: "coins",
    title: `+${amount} Coins`,
    message: reason,
    link: "/dashboard",
  }),

  reward: (rewardName: string, description: string): Omit<NotificationData, "userId"> => ({
    type: "reward",
    title: rewardName,
    message: description,
    link: "/dashboard",
  }),

  // Social notifications
  newFollower: (followerName: string, followerId: string): Omit<NotificationData, "userId"> => ({
    type: "follow",
    title: "New Follower",
    message: `${followerName} started following you`,
    link: `/profile/${followerId}`,
  }),

  // System notifications
  system: (title: string, message: string, link?: string): Omit<NotificationData, "userId"> => ({
    type: "system",
    title,
    message,
    link: link || "/dashboard",
  }),
}

/**
 * Helper to send notification using template
 */
export async function sendNotification(
  userId: string,
  template: Omit<NotificationData, "userId">
): Promise<boolean> {
  return createNotification({
    userId,
    ...template,
  })
}
