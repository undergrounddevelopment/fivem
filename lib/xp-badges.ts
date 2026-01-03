// XP & Badges System Configuration
// Professional Forum XP and Badge System

export const XP_CONFIG = {
  // XP rewards for activities
  rewards: {
    CREATE_THREAD: 50,
    CREATE_REPLY: 20,
    RECEIVE_LIKE: 10,
    GIVE_LIKE: 5,
    FIRST_POST_OF_DAY: 25,
    UPLOAD_ASSET: 100,
    ASSET_DOWNLOADED: 15,
    DAILY_LOGIN: 10,
    PROFILE_COMPLETE: 50,
    SHARE_CONTENT: 15,
    RECEIVE_REPLY: 10,
    THREAD_PINNED: 200,
    ASSET_FEATURED: 300,
    HELPFUL_ANSWER: 75,
  },
  
  // Level thresholds
  levels: [
    { level: 1, minXP: 0, title: "Newbie" },
    { level: 2, minXP: 100, title: "Beginner" },
    { level: 3, minXP: 300, title: "Regular" },
    { level: 4, minXP: 600, title: "Active" },
    { level: 5, minXP: 1000, title: "Contributor" },
    { level: 6, minXP: 1500, title: "Expert" },
    { level: 7, minXP: 2500, title: "Veteran" },
    { level: 8, minXP: 4000, title: "Master" },
    { level: 9, minXP: 6000, title: "Legend" },
    { level: 10, minXP: 10000, title: "Champion" },
  ],
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  requirement: {
    type: string
    value: number
  }
  xpBonus?: number
}

export const BADGES: Badge[] = [
  // Level Badges
  {
    id: "newcomer",
    name: "Newcomer",
    description: "Welcome to the community!",
    icon: "/badges/badge1.png",
    color: "#9CA3AF",
    rarity: "common",
    requirement: { type: "level", value: 1 },
  },
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Reached Level 3",
    icon: "/badges/badge2.png",
    color: "#10B981",
    rarity: "uncommon",
    requirement: { type: "level", value: 3 },
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Reached Level 5",
    icon: "/badges/badge3.png",
    color: "#3B82F6",
    rarity: "rare",
    requirement: { type: "level", value: 5 },
  },
  {
    id: "elite",
    name: "Elite Member",
    description: "Reached Level 7",
    icon: "/badges/badge4.png",
    color: "#8B5CF6",
    rarity: "epic",
    requirement: { type: "level", value: 7 },
  },
  {
    id: "legend",
    name: "Legend",
    description: "Reached Level 10",
    icon: "/badges/badge5.png",
    color: "#F59E0B",
    rarity: "legendary",
    requirement: { type: "level", value: 10 },
  },
  
  // Activity Badges
  {
    id: "first_post",
    name: "First Steps",
    description: "Created your first forum post",
    icon: "/badges/badge1.png",
    color: "#6366F1",
    rarity: "common",
    requirement: { type: "posts", value: 1 },
  },
  {
    id: "prolific_poster",
    name: "Prolific Poster",
    description: "Created 50 forum posts",
    icon: "/badges/badge2.png",
    color: "#EC4899",
    rarity: "rare",
    requirement: { type: "posts", value: 50 },
  },
  {
    id: "conversation_starter",
    name: "Conversation Starter",
    description: "Started 10 discussions",
    icon: "/badges/badge3.png",
    color: "#14B8A6",
    rarity: "uncommon",
    requirement: { type: "threads", value: 10 },
  },
  {
    id: "helper",
    name: "Helpful Helper",
    description: "Received 25 likes on your replies",
    icon: "/badges/badge4.png",
    color: "#F97316",
    rarity: "rare",
    requirement: { type: "likes_received", value: 25 },
  },
  {
    id: "popular",
    name: "Popular Member",
    description: "Received 100 likes total",
    icon: "/badges/badge5.png",
    color: "#EF4444",
    rarity: "epic",
    requirement: { type: "likes_received", value: 100 },
  },
  
  // Asset Badges
  {
    id: "creator",
    name: "Content Creator",
    description: "Uploaded your first asset",
    icon: "/badges/badge2.png",
    color: "#22C55E",
    rarity: "common",
    requirement: { type: "assets", value: 1 },
  },
  {
    id: "prolific_creator",
    name: "Prolific Creator",
    description: "Uploaded 10 assets",
    icon: "/badges/badge4.png",
    color: "#A855F7",
    rarity: "epic",
    requirement: { type: "assets", value: 10 },
  },
  {
    id: "popular_creator",
    name: "Popular Creator",
    description: "Assets downloaded 100 times",
    icon: "/badges/badge5.png",
    color: "#FBBF24",
    rarity: "legendary",
    requirement: { type: "asset_downloads", value: 100 },
  },
  
  // Special Badges
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined in the first month",
    icon: "/badges/badge3.png",
    color: "#06B6D4",
    rarity: "rare",
    requirement: { type: "special", value: 0 },
  },
  {
    id: "vip",
    name: "VIP Member",
    description: "Premium membership holder",
    icon: "/badges/badge5.png",
    color: "#F59E0B",
    rarity: "legendary",
    requirement: { type: "membership", value: 0 },
  },
]

// Helper functions
export function getLevelFromXP(xp: number): { level: number; title: string; progress: number; nextLevelXP: number } {
  const levels = XP_CONFIG.levels
  let currentLevel = levels[0]
  let nextLevel = levels[1]
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      currentLevel = levels[i]
      nextLevel = levels[i + 1] || levels[i]
      break
    }
  }
  
  const currentLevelXP = currentLevel.minXP
  const nextLevelXP = nextLevel.minXP
  const xpInLevel = xp - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP
  const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progress,
    nextLevelXP: nextLevel.minXP,
  }
}

export function getEarnedBadges(userStats: {
  level: number
  posts: number
  threads: number
  likes_received: number
  assets: number
  asset_downloads: number
  membership: string
  created_at: string
}): Badge[] {
  const earned: Badge[] = []
  
  for (const badge of BADGES) {
    let hasEarned = false
    
    switch (badge.requirement.type) {
      case "level":
        hasEarned = userStats.level >= badge.requirement.value
        break
      case "posts":
        hasEarned = userStats.posts >= badge.requirement.value
        break
      case "threads":
        hasEarned = userStats.threads >= badge.requirement.value
        break
      case "likes_received":
        hasEarned = userStats.likes_received >= badge.requirement.value
        break
      case "assets":
        hasEarned = userStats.assets >= badge.requirement.value
        break
      case "asset_downloads":
        hasEarned = userStats.asset_downloads >= badge.requirement.value
        break
      case "membership":
        hasEarned = userStats.membership === "vip" || userStats.membership === "admin"
        break
      case "special":
        // Check for early adopter (joined within first month - Jan 2026)
        if (badge.id === "early_adopter") {
          const joinDate = new Date(userStats.created_at)
          const earlyDate = new Date("2026-02-01")
          hasEarned = joinDate < earlyDate
        }
        break
    }
    
    if (hasEarned) {
      earned.push(badge)
    }
  }
  
  return earned
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common": return "from-gray-400 to-gray-500"
    case "uncommon": return "from-green-400 to-green-600"
    case "rare": return "from-blue-400 to-blue-600"
    case "epic": return "from-purple-400 to-purple-600"
    case "legendary": return "from-yellow-400 to-orange-500"
    default: return "from-gray-400 to-gray-500"
  }
}

export function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case "common": return "border-gray-400/50"
    case "uncommon": return "border-green-400/50"
    case "rare": return "border-blue-400/50"
    case "epic": return "border-purple-400/50"
    case "legendary": return "border-yellow-400/50 animate-pulse"
    default: return "border-gray-400/50"
  }
}
