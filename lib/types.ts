// Production types for FiveM Tools V7

export type Framework = "standalone" | "esx" | "qbcore" | "qbox"
export type AssetCategory = "scripts" | "mlo" | "vehicles" | "clothing"
export type Membership = "free" | "vip" | "admin"
export type NotificationType = "reply" | "mention" | "like" | "system" | "download"

export interface Asset {
  id: string
  title: string
  description: string
  category: AssetCategory
  framework: Framework
  version: string
  price: "free" | "premium"
  coinPrice: number
  image: string
  downloads: number
  rating: number
  author: string
  authorId: string
  createdAt: string
  updatedAt: string
  tags: string[]
  fileSize?: string
  requirements?: string[]
  changelog?: string
  isVerified: boolean
  isFeatured: boolean
  virusScanStatus?: "pending" | "clean" | "threat"
  virusScanHash?: string
  downloadLink?: string
}

export interface User {
  id: string
  discordId: string
  username: string
  email: string | null
  avatar: string
  membership: Membership
  downloads: number
  reputation: number
  points: number
  coins: number
  achievements: Achievement[]
  createdAt: string
  lastSeen: string
  isBanned: boolean
  banReason?: string
  isAdmin?: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
}

export interface ForumThread {
  id: string
  title: string
  content: string
  categoryId: string
  category: string
  authorId: string
  author: User
  replies: number
  likes: number
  views: number
  isPinned: boolean
  isLocked: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  lastReplyAt: string
  lastReplyBy?: User
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  threadCount: number
  postCount: number
  color: string
  order: number
}

export interface ForumReply {
  id: string
  threadId: string
  content: string
  authorId: string
  author: User
  likes: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  isEdited: boolean
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export interface Stats {
  onlineUsers: number
  totalMembers: number
  totalAssets: number
  totalDownloads: number
  totalThreads: number
  totalPosts: number
}

export interface Report {
  id: string
  type: "thread" | "reply" | "user" | "asset"
  targetId: string
  reason: string
  description?: string
  reporterId: string
  reporter: User
  status: "pending" | "reviewing" | "resolved" | "dismissed"
  moderatorId?: string
  moderatorNotes?: string
  createdAt: string
  resolvedAt?: string
}

export interface Sponsor {
  id: string
  name: string
  image: string
  url?: string
  type: "video" | "image" | "gif"
  isActive: boolean
}

export interface FrameworkInfo {
  id: Framework
  name: string
  logo: string
  color: string
  description: string
}

// Session User type for auth
export interface SessionUser {
  id: string
  discordId: string
  username: string
  email: string | null
  avatar: string
  membership: Membership
  isAdmin: boolean
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
