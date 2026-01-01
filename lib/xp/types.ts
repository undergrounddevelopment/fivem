export interface Badge {
  id: string
  name: string
  description: string
  imageUrl: string
  minXp: number
  maxXp: number | null
  color: string
  tier: number
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  unlockedAt: string
  isEquipped: boolean
  badge?: Badge
}

export interface XPTransaction {
  id: string
  userId: string
  amount: number
  activityType: string
  description: string | null
  referenceId: string | null
  createdAt: string
}

export interface XPActivity {
  id: string
  name: string
  description: string | null
  xpAmount: number
  cooldownMinutes: number
  maxPerDay: number | null
  isActive: boolean
}

export interface XPAwardResult {
  success: boolean
  error?: string
  xpAwarded?: number
  totalXp?: number
  oldLevel?: number
  newLevel?: number
  leveledUp?: boolean
  oldBadge?: string
  newBadge?: string
  badgeUnlocked?: boolean
  nextClaimAt?: string
}

export interface UserXPStats {
  xp: number
  level: number
  currentBadge: string
  badge: Badge
  nextBadge: Badge | null
  xpForNextBadge: number
  progress: number
  totalTransactions: number
  recentActivities: XPTransaction[]
}
