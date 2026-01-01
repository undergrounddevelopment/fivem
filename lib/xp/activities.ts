// XP Activity IDs and helper functions
export const XP_ACTIVITIES = {
  DAILY_LOGIN: "daily_login",
  CREATE_THREAD: "create_thread",
  REPLY_THREAD: "reply_thread",
  UPLOAD_ASSET: "upload_asset",
  DOWNLOAD_ASSET: "download_asset",
  RECEIVE_LIKE: "receive_like",
  GIVE_LIKE: "give_like",
  CLAIM_DAILY_COINS: "claim_daily_coins",
  SPIN_WHEEL: "spin_wheel",
  COMPLETE_PROFILE: "complete_profile",
  FIRST_DOWNLOAD: "first_download",
  FIRST_UPLOAD: "first_upload",
} as const

export type XPActivityType = (typeof XP_ACTIVITIES)[keyof typeof XP_ACTIVITIES]

// Helper to award XP (use this throughout the app)
export async function awardXP(userId: string, activity: XPActivityType, referenceId?: string) {
  const { xpQueries } = await import("./queries")
  return xpQueries.awardXP(userId, activity, referenceId)
}

// Additional logic can be added here to handle professional logic and daily limits
