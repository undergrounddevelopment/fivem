/**
 * Database type definitions - 100% Match with Supabase Schema
 * All 15 tables included
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          discord_id: string
          username: string
          email: string | null
          avatar: string | null
          coins: number
          membership: string
          is_admin: boolean
          role: string | null
          bio: string | null
          xp: number
          badge_tier: number
          created_at: string
          last_seen: string | null
          banned: boolean
          ban_reason: string | null
        }
        Insert: {
          discord_id: string
          username: string
          email?: string | null
          avatar?: string | null
          coins?: number
          membership?: string
          is_admin?: boolean
          role?: string | null
          bio?: string | null
          xp?: number
          badge_tier?: number
        }
        Update: {
          username?: string
          email?: string | null
          avatar?: string | null
          coins?: number
          membership?: string
          is_admin?: boolean
          role?: string | null
          bio?: string | null
          xp?: number
          badge_tier?: number
          last_seen?: string | null
          banned?: boolean
          ban_reason?: string | null
        }
      }
      assets: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          framework: string
          coin_price: number
          download_url: string | null
          thumbnail_url: string | null
          creator_id: string
          downloads: number
          likes: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          category: string
          framework: string
          coin_price?: number
          download_url?: string | null
          thumbnail_url?: string | null
          creator_id: string
          status?: string
        }
        Update: {
          title?: string
          description?: string
          category?: string
          framework?: string
          coin_price?: number
          download_url?: string | null
          thumbnail_url?: string | null
          downloads?: number
          likes?: number
          status?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          order_index?: number
        }
        Update: {
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          order_index?: number
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          content: string
          category_id: string
          author_id: string
          pinned: boolean
          locked: boolean
          views: number
          replies_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          content: string
          category_id: string
          author_id: string
          pinned?: boolean
          locked?: boolean
        }
        Update: {
          title?: string
          content?: string
          pinned?: boolean
          locked?: boolean
          views?: number
          replies_count?: number
        }
      }
      forum_replies: {
        Row: {
          id: string
          content: string
          thread_id: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          content: string
          thread_id: string
          author_id: string
        }
        Update: {
          content?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          priority: string
          active: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          title: string
          content: string
          type?: string
          priority?: string
          active?: boolean
          expires_at?: string | null
        }
        Update: {
          title?: string
          content?: string
          type?: string
          priority?: string
          active?: boolean
          expires_at?: string | null
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string | null
          active: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          title: string
          image_url: string
          link_url?: string | null
          active?: boolean
          order_index?: number
        }
        Update: {
          title?: string
          image_url?: string
          link_url?: string | null
          active?: boolean
          order_index?: number
        }
      }
      spin_wheel_prizes: {
        Row: {
          id: string
          name: string
          type: string
          value: number
          probability: number
          color: string
          active: boolean
          created_at: string
        }
        Insert: {
          name: string
          type: string
          value: number
          probability: number
          color?: string
          active?: boolean
        }
        Update: {
          name?: string
          type?: string
          value?: number
          probability?: number
          color?: string
          active?: boolean
        }
      }
      spin_wheel_tickets: {
        Row: {
          id: string
          user_id: string
          tickets: number
          last_claim: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          tickets?: number
        }
        Update: {
          tickets?: number
          last_claim?: string | null
        }
      }
      spin_wheel_history: {
        Row: {
          id: string
          user_id: string
          prize_id: string
          prize_name: string
          prize_value: number
          created_at: string
        }
        Insert: {
          user_id: string
          prize_id: string
          prize_name: string
          prize_value: number
        }
        Update: {}
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          message: string
          type?: string
          read?: boolean
        }
        Update: {
          read?: boolean
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          action: string
          details: string | null
          xp_earned: number
          created_at: string
        }
        Insert: {
          user_id: string
          action: string
          details?: string | null
          xp_earned?: number
        }
        Update: {}
      }
      downloads: {
        Row: {
          id: string
          asset_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          asset_id: string
          user_id: string
        }
        Update: {}
      }
      coin_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          type: string
          description?: string | null
        }
        Update: {}
      }
      testimonials: {
        Row: {
          id: string
          user_id: string
          rating: number
          comment: string
          approved: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          rating: number
          comment: string
          approved?: boolean
        }
        Update: {
          approved?: boolean
        }
      }
    }
  }
}

// Type exports for all tables
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Asset = Database["public"]["Tables"]["assets"]["Row"]
export type ForumCategory = Database["public"]["Tables"]["forum_categories"]["Row"]
export type ForumThread = Database["public"]["Tables"]["forum_threads"]["Row"]
export type ForumReply = Database["public"]["Tables"]["forum_replies"]["Row"]
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"]
export type Banner = Database["public"]["Tables"]["banners"]["Row"]
export type SpinWheelPrize = Database["public"]["Tables"]["spin_wheel_prizes"]["Row"]
export type SpinWheelTicket = Database["public"]["Tables"]["spin_wheel_tickets"]["Row"]
export type SpinWheelHistory = Database["public"]["Tables"]["spin_wheel_history"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type Activity = Database["public"]["Tables"]["activities"]["Row"]
export type Download = Database["public"]["Tables"]["downloads"]["Row"]
export type CoinTransaction = Database["public"]["Tables"]["coin_transactions"]["Row"]
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"]

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"]
export type ForumThreadInsert = Database["public"]["Tables"]["forum_threads"]["Insert"]
export type ForumReplyInsert = Database["public"]["Tables"]["forum_replies"]["Insert"]

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]
export type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"]
