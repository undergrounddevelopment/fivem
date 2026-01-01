/**
 * Database type definitions
 * These should match your Supabase schema
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
      }
      // Add more table definitions as needed
    }
  }
}

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Asset = Database["public"]["Tables"]["assets"]["Row"]
