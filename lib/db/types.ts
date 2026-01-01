// ============================================
// DATABASE TYPES - Based on SQL Schema
// ============================================

// FORUM TYPES
export interface ForumCategory {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  sort_order: number
  is_active: boolean
  thread_count: number
  post_count: number
  created_at: Date
  updated_at: Date
}

export interface ForumThread {
  id: string
  title: string
  content: string
  category_id: string | null
  author_id: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  is_pinned: boolean
  is_locked: boolean
  is_deleted: boolean
  replies_count: number
  likes: number
  views: number
  images: string[]
  last_reply_at: Date | null
  last_reply_by: string | null
  approved_by: string | null
  approved_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface ForumReply {
  id: string
  thread_id: string
  author_id: string
  content: string
  likes: number
  is_edited: boolean
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

// COINS TYPES
export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  type: 'daily' | 'spin' | 'purchase' | 'reward' | 'admin' | 'refund'
  description: string | null
  reference_id: string | null
  created_at: Date
}

export interface DailyClaim {
  id: string
  user_id: string
  claim_type: 'coins' | 'spin'
  claim_date: Date
  claimed_at: Date
}

// SPIN WHEEL TYPES
export interface SpinWheelPrize {
  id: string
  name: string
  type: 'coins' | 'ticket' | 'item' | 'nothing'
  value: number
  probability: number
  color: string
  icon: string
  is_active: boolean
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface SpinWheelHistory {
  id: string
  user_id: string
  prize_id: string | null
  prize_name: string
  prize_type: string
  prize_value: number
  was_forced: boolean
  created_at: Date
}

export interface SpinWheelTicket {
  id: string
  user_id: string
  ticket_type: 'daily' | 'purchase' | 'reward' | 'admin'
  is_used: boolean
  used_at: Date | null
  expires_at: Date | null
  created_at: Date
}

export interface SpinWheelSettings {
  id: number
  key: string
  value: any
  updated_at: Date
}

// USER TYPES (from existing schema)
export interface User {
  discord_id: string
  username: string
  avatar: string | null
  email: string | null
  coins: number
  membership: string
  is_admin: boolean
  created_at: Date
  updated_at: Date
}

// API RESPONSE TYPES
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// FUNCTION RETURN TYPES
export interface AddCoinsResult {
  success: boolean
  transaction_id?: string
  new_balance?: number
  error?: string
}

export interface ClaimDailyResult {
  success: boolean
  error?: string
}

export interface UseTicketResult {
  success: boolean
  ticket_id?: string
  error?: string
}

export interface AdminStats {
  threads: number
  replies: number
  users: number
  totalCoins: number
}
