export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          membership: "free" | "vip" | "premium" | "admin"
          coins: number
          reputation: number
          downloads: number
          points: number
          is_banned: boolean
          ban_reason: string | null
          is_admin: boolean
          spin_tickets: number
          role: string
          is_active: boolean
          xp: number
          level: number
          bio: string | null
          created_at: string
          updated_at: string
          last_seen: string
        }
        Insert: {
          id?: string
          discord_id: string
          username: string
          email?: string | null
          avatar?: string | null
          membership?: "free" | "vip" | "premium" | "admin"
          coins?: number
          reputation?: number
          downloads?: number
          points?: number
          is_banned?: boolean
          ban_reason?: string | null
          is_admin?: boolean
          spin_tickets?: number
          role?: string
          is_active?: boolean
          xp?: number
          level?: number
          bio?: string | null
          created_at?: string
          updated_at?: string
          last_seen?: string
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string
          email?: string | null
          avatar?: string | null
          membership?: "free" | "vip" | "premium" | "admin"
          coins?: number
          reputation?: number
          downloads?: number
          points?: number
          is_banned?: boolean
          ban_reason?: string | null
          is_admin?: boolean
          spin_tickets?: number
          role?: string
          is_active?: boolean
          xp?: number
          level?: number
          bio?: string | null
          created_at?: string
          updated_at?: string
          last_seen?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          id: string
          title: string
          description: string | null
          category: "scripts" | "mlo" | "vehicles" | "clothing" | "maps" | "tools"
          framework: "standalone" | "esx" | "qbcore" | "qbox" | null
          version: string
          coin_price: number
          thumbnail: string | null
          images: string[]
          download_link: string | null
          file_size: string | null
          downloads: number
          views: number
          rating: number
          rating_count: number
          average_rating: number
          tags: string[]
          status: "pending" | "active" | "approved" | "published" | "inactive" | "rejected" | "archived"
          is_verified: boolean
          is_featured: boolean
          virus_scan_status: "pending" | "clean" | "threat"
          features: string | null
          installation: string | null
          changelog: string | null
          youtube_link: string | null
          github_link: string | null
          docs_link: string | null
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: "scripts" | "mlo" | "vehicles" | "clothing" | "maps" | "tools"
          framework?: "standalone" | "esx" | "qbcore" | "qbox" | null
          version?: string
          coin_price?: number
          thumbnail?: string | null
          images?: string[]
          download_link?: string | null
          file_size?: string | null
          downloads?: number
          views?: number
          rating?: number
          rating_count?: number
          average_rating?: number
          tags?: string[]
          status?: "pending" | "active" | "approved" | "published" | "inactive" | "rejected" | "archived"
          is_verified?: boolean
          is_featured?: boolean
          virus_scan_status?: "pending" | "clean" | "threat"
          features?: string | null
          installation?: string | null
          changelog?: string | null
          youtube_link?: string | null
          github_link?: string | null
          docs_link?: string | null
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: "scripts" | "mlo" | "vehicles" | "clothing" | "maps" | "tools"
          framework?: "standalone" | "esx" | "qbcore" | "qbox" | null
          version?: string
          coin_price?: number
          thumbnail?: string | null
          images?: string[]
          download_link?: string | null
          file_size?: string | null
          downloads?: number
          views?: number
          rating?: number
          rating_count?: number
          average_rating?: number
          tags?: string[]
          status?: "pending" | "active" | "approved" | "published" | "inactive" | "rejected" | "archived"
          is_verified?: boolean
          is_featured?: boolean
          virus_scan_status?: "pending" | "clean" | "threat"
          features?: string | null
          installation?: string | null
          changelog?: string | null
          youtube_link?: string | null
          github_link?: string | null
          docs_link?: string | null
          author_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          thread_count: number
          post_count: number
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          thread_count?: number
          post_count?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          thread_count?: number
          post_count?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          content: string
          category_id: string | null
          author_id: string
          status: "pending" | "approved" | "rejected"
          rejection_reason: string | null
          replies_count: number
          likes: number
          views: number
          is_pinned: boolean
          is_locked: boolean
          is_deleted: boolean
          images: string[]
          last_reply_at: string | null
          last_reply_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category_id?: string | null
          author_id: string
          status?: "pending" | "approved" | "rejected"
          rejection_reason?: string | null
          replies_count?: number
          likes?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          images?: string[]
          last_reply_at?: string | null
          last_reply_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category_id?: string | null
          author_id?: string
          status?: "pending" | "approved" | "rejected"
          rejection_reason?: string | null
          replies_count?: number
          likes?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          images?: string[]
          last_reply_at?: string | null
          last_reply_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      coin_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          title: string | null
          message: string
          type: string
          is_active: boolean
          is_dismissible: boolean
          sort_order: number
          link: string | null
          link_text: string | null
          start_date: string | null
          end_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          message: string
          type?: string
          is_active?: boolean
          is_dismissible?: boolean
          sort_order?: number
          link?: string | null
          link_text?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          message?: string
          type?: string
          is_active?: boolean
          is_dismissible?: boolean
          sort_order?: number
          link?: string | null
          link_text?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          id: string
          title: string | null
          description: string | null
          image_url: string
          link: string | null
          position: string
          is_active: boolean
          sort_order: number
          priority: number
          click_count: number
          view_count: number
          start_date: string | null
          end_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          image_url: string
          link?: string | null
          position?: string
          is_active?: boolean
          sort_order?: number
          priority?: number
          click_count?: number
          view_count?: number
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          image_url?: string
          link?: string | null
          position?: string
          is_active?: boolean
          sort_order?: number
          priority?: number
          click_count?: number
          view_count?: number
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          subject: string | null
          content: string
          is_read: boolean
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          subject?: string | null
          content: string
          is_read?: boolean
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          subject?: string | null
          content?: string
          is_read?: boolean
          parent_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          type: string
          target_id: string
          reason: string
          description: string | null
          reporter_id: string
          status: string
          moderator_id: string | null
          moderator_notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          type: string
          target_id: string
          reason: string
          description?: string | null
          reporter_id: string
          status?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          target_id?: string
          reason?: string
          description?: string | null
          reporter_id?: string
          status?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          username: string
          avatar: string | null
          content: string
          rating: number
          server_name: string | null
          upvotes_received: number
          is_featured: boolean
          is_visible: boolean
          is_verified: boolean
          badge: string | null
          image_url: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          avatar?: string | null
          content: string
          rating?: number
          server_name?: string | null
          upvotes_received?: number
          is_featured?: boolean
          is_visible?: boolean
          is_verified?: boolean
          badge?: string | null
          image_url?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar?: string | null
          content?: string
          rating?: number
          server_name?: string | null
          upvotes_received?: number
          is_featured?: boolean
          is_visible?: boolean
          is_verified?: boolean
          badge?: string | null
          image_url?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          key: string
          value: Json | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value?: Json | null
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: Json | null
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          file_url: string
          file_name: string
          file_type: string
          file_size: number
          upload_type: string | null
          checksum: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          file_name: string
          file_type: string
          file_size: number
          upload_type?: string | null
          checksum?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          file_name?: string
          file_type?: string
          file_size?: number
          upload_type?: string | null
          checksum?: string | null
          created_at?: string
        }
        Relationships: []
      }
      asset_reviews: {
        Row: {
          id: string
          asset_id: string
          user_id: string
          rating: number
          comment: string | null
          is_verified_purchase: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          user_id: string
          rating: number
          comment?: string | null
          is_verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          is_verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_notifications: {
        Row: {
          id: string
          title: string
          message: string | null
          type: string
          link: string | null
          asset_id: string | null
          expires_at: string | null
          created_by: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          message?: string | null
          type?: string
          link?: string | null
          asset_id?: string | null
          expires_at?: string | null
          created_by?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string | null
          type?: string
          link?: string | null
          asset_id?: string | null
          expires_at?: string | null
          created_by?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      spin_wheel_prizes: {
        Row: {
          id: string
          name: string
          type: string
          value: number
          probability: number
          color: string
          icon: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          value: number
          probability: number
          color?: string
          icon?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          value?: number
          probability?: number
          color?: string
          icon?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      spin_wheel_history: {
        Row: {
          id: string
          user_id: string
          prize_id: string | null
          prize_name: string
          prize_type: string
          prize_value: number
          was_forced: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prize_id?: string | null
          prize_name: string
          prize_type: string
          prize_value?: number
          was_forced?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prize_id?: string | null
          prize_name?: string
          prize_type?: string
          prize_value?: number
          was_forced?: boolean
          created_at?: string
        }
        Relationships: []
      }
      spin_wheel_tickets: {
        Row: {
          id: string
          user_id: string
          ticket_type: string
          is_used: boolean
          used_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ticket_type: string
          is_used?: boolean
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ticket_type?: string
          is_used?: boolean
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      spin_wheel_settings: {
        Row: {
          id: number
          daily_free_spins: number
          spin_cost_coins: number
          is_enabled: boolean
          jackpot_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          daily_free_spins?: number
          spin_cost_coins?: number
          is_enabled?: boolean
          jackpot_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          daily_free_spins?: number
          spin_cost_coins?: number
          is_enabled?: boolean
          jackpot_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_claims: {
        Row: {
          id: string
          user_id: string
          claim_type: string
          claim_date: string
          claimed_at: string
          reward_amount: number | null
        }
        Insert: {
          id?: string
          user_id: string
          claim_type: string
          claim_date: string
          claimed_at?: string
          reward_amount?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          claim_type?: string
          claim_date?: string
          claimed_at?: string
          reward_amount?: number | null
        }
        Relationships: []
      }
      linkvertise_downloads: {
        Row: {
          id: string
          user_id: string
          asset_id: string | null
          linkvertise_url: string
          download_hash: string
          verified: boolean
          ip_address: string | null
          user_agent: string | null
          created_at: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          asset_id?: string | null
          linkvertise_url: string
          download_hash: string
          verified?: boolean
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string | null
          linkvertise_url?: string
          download_hash?: string
          verified?: boolean
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      spin_history: {
        Row: {
          id: number
          user_id: string | null
          discord_id: string | null
          prize_id: number | null
          prize_name: string | null
          coins_won: number | null
          prize_amount: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          discord_id?: string | null
          prize_id?: number | null
          prize_name?: string | null
          coins_won?: number | null
          prize_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          discord_id?: string | null
          prize_id?: number | null
          prize_name?: string | null
          coins_won?: number | null
          prize_amount?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
