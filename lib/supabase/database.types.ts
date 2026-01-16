export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any
        Insert: any
        Update: any
      }
      users: {
        Row: {
          id: string
          discord_id: string
          username: string
          email: string | null
          avatar: string | null
          membership: "free" | "vip" | "admin"
          coins: number
          reputation: number
          downloads: number
          points: number
          is_banned: boolean
          ban_reason: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
          last_seen: string
          [key: string]: any
        }
        Insert: {
          id?: string
          discord_id: string
          username: string
          email?: string | null
          avatar?: string | null
          membership?: "free" | "vip" | "admin"
          coins?: number
          reputation?: number
          downloads?: number
          points?: number
          is_banned?: boolean
          ban_reason?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          last_seen?: string
          [key: string]: any
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string
          email?: string | null
          avatar?: string | null
          membership?: "free" | "vip" | "admin"
          coins?: number
          reputation?: number
          downloads?: number
          points?: number
          is_banned?: boolean
          ban_reason?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          last_seen?: string
          [key: string]: any
        }
      }
      assets: {
        Row: {
          id: string
          title: string
          description: string | null
          category: "scripts" | "mlo" | "vehicles" | "clothing"
          framework: "standalone" | "esx" | "qbcore" | "qbox"
          version: string
          coin_price: number
          thumbnail: string | null
          download_link: string | null
          file_size: string | null
          downloads: number
          tags: string[]
          status: "pending" | "active" | "rejected" | "archived"
          is_verified: boolean
          is_featured: boolean
          virus_scan_status: "pending" | "clean" | "threat"
          author_id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: "scripts" | "mlo" | "vehicles" | "clothing"
          framework?: "standalone" | "esx" | "qbcore" | "qbox"
          version?: string
          coin_price?: number
          thumbnail?: string | null
          download_link?: string | null
          file_size?: string | null
          downloads?: number
          tags?: string[]
          status?: "pending" | "active" | "rejected" | "archived"
          is_verified?: boolean
          is_featured?: boolean
          virus_scan_status?: "pending" | "clean" | "threat"
          author_id: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: "scripts" | "mlo" | "vehicles" | "clothing"
          framework?: "standalone" | "esx" | "qbcore" | "qbox"
          version?: string
          coin_price?: number
          thumbnail?: string | null
          download_link?: string | null
          file_size?: string | null
          downloads?: number
          tags?: string[]
          status?: "pending" | "active" | "rejected" | "archived"
          is_verified?: boolean
          is_featured?: boolean
          virus_scan_status?: "pending" | "clean" | "threat"
          author_id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
      }
      downloads: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          coin_spent: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          coin_spent?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          coin_spent?: number
          created_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          color: string
          thread_count: number
          post_count: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string
          color?: string
          thread_count?: number
          post_count?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          thread_count?: number
          post_count?: number
          sort_order?: number
          created_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          content: string
          category_id: string | null
          author_id: string
          replies_count: number
          likes: number
          views: number
          is_pinned: boolean
          is_locked: boolean
          is_deleted: boolean
          last_reply_at: string | null
          last_reply_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category_id?: string | null
          author_id: string
          replies_count?: number
          likes?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          last_reply_at?: string | null
          last_reply_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category_id?: string | null
          author_id?: string
          replies_count?: number
          likes?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          last_reply_at?: string | null
          last_reply_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          thread_id: string
          content: string
          author_id: string
          likes: number
          is_deleted: boolean
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          author_id: string
          likes?: number
          is_deleted?: boolean
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          author_id?: string
          likes?: number
          is_deleted?: boolean
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "reply" | "mention" | "like" | "system" | "download"
          title: string
          message: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: "reply" | "mention" | "like" | "system" | "download"
          title: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "reply" | "mention" | "like" | "system" | "download"
          title?: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          action: string
          target_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          action: string
          target_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          action?: string
          target_id?: string | null
          metadata?: Json
          created_at?: string
        }
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
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          target_type: "thread" | "reply" | "asset"
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: "thread" | "reply" | "asset"
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: "thread" | "reply" | "asset"
          target_id?: string
          created_at?: string
        }
      }
      daily_rewards: {
        Row: {
          id: string
          user_id: string
          claimed_at: string
          amount: number
          streak: number
        }
        Insert: {
          id?: string
          user_id: string
          claimed_at?: string
          amount: number
          streak?: number
        }
        Update: {
          id?: string
          user_id?: string
          claimed_at?: string
          amount?: number
          streak?: number
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      spin_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      spin_wheel_prizes: {
        Row: {
          id: string
          name: string
          type: string
          value: number
          image_url: string | null
          probability: number
          color: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          value?: number
          image_url?: string | null
          probability?: number
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          value?: number
          image_url?: string | null
          probability?: number
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      spin_wheel_history: {
        Row: {
          id: string
          user_id: string
          prize_id: string | null
          prize_name: string | null
          prize_value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prize_id?: string | null
          prize_name?: string | null
          prize_value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prize_id?: string | null
          prize_name?: string | null
          prize_value?: number | null
          created_at?: string
        }
      }
      spin_wheel_tickets: {
        Row: {
          id: string
          user_id: string
          tickets: number
          last_earned: string
        }
        Insert: {
          id?: string
          user_id: string
          tickets?: number
          last_earned?: string
        }
        Update: {
          id?: string
          user_id?: string
          tickets?: number
          last_earned?: string
        }
      }
    }
  }
}
