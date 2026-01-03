import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"

// ============================================
// FORUM QUERIES
// ============================================

export const forumQueries = {
  getCategories: async () => {
    try {
      const supabase = createAdminClient()
      
      // Get categories
      const { data: categories, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error) throw error
      if (!categories) return []

      // Get thread counts for each category
      const { data: threadCounts } = await supabase
        .from("forum_threads")
        .select("category_id")
        .eq("is_deleted", false)

      // Count threads per category
      const countMap: Record<string, number> = {}
      for (const thread of threadCounts || []) {
        countMap[thread.category_id] = (countMap[thread.category_id] || 0) + 1
      }

      // Add thread_count to each category
      return categories.map(cat => ({
        ...cat,
        thread_count: countMap[cat.id] || 0
      }))
    } catch (error) {
      console.error("[forumQueries.getCategories] Error:", error)
      return []
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("forum_categories").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[forumQueries.getCategoryById] Error:", error)
      return null
    }
  },

  getThreads: async (categoryId?: string, limit = 20, offset = 0) => {
    try {
      const supabase = createAdminClient()
      
      // Get threads
      let query = supabase
        .from("forum_threads")
        .select(`*`)
        .eq("is_deleted", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      const { data: threads, error } = await query
      if (error) throw error
      if (!threads || threads.length === 0) return []

      // Get unique author IDs (forum_threads.author_id is TEXT matching users.discord_id)
      const authorIds = [...new Set(threads.map(t => t.author_id).filter(Boolean))]
      
      // Fetch authors by discord_id first, then try UUID if not found
      let authorsMap: Record<string, any> = {}
      if (authorIds.length > 0) {
        // Try discord_id match first
        const { data: authorsByDiscord } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
          .in("discord_id", authorIds)
        
        for (const author of authorsByDiscord || []) {
          authorsMap[author.discord_id] = author
        }

        // For any missing authors, try UUID match (backward compatibility)
        const missingIds = authorIds.filter(id => !authorsMap[id])
        if (missingIds.length > 0) {
          const { data: authorsByUUID } = await supabase
            .from("users")
            .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
            .in("id", missingIds)
          
          for (const author of authorsByUUID || []) {
            authorsMap[author.id] = author
          }
        }
      }

      // Attach author to each thread
      return threads.map(thread => {
        const author = authorsMap[thread.author_id]
        return {
          ...thread,
          author: author ? {
            id: author.id,
            discord_id: author.discord_id,
            username: author.username || 'Unknown',
            avatar: author.avatar,
            membership: author.membership || 'free',
            xp: author.xp || 0,
            level: author.level || 1,
            current_badge: author.current_badge || 'beginner'
          } : null
        }
      })
    } catch (error) {
      console.error("[forumQueries.getThreads] Error:", error)
      return []
    }
  },

  getThreadById: async (id: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("forum_threads").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[forumQueries.getThreadById] Error:", error)
      return null
    }
  },

  createThread: async (data: {
    title: string
    content: string
    category_id: string
    author_id: string
    images?: string[]
  }) => {
    try {
      const supabase = createAdminClient()
      const { data: thread, error } = await supabase
        .from("forum_threads")
        .insert({
          title: data.title,
          content: data.content,
          category_id: data.category_id,
          author_id: data.author_id,
          images: data.images || [],
        })
        .select()
        .single()

      if (error) throw error
      return thread
    } catch (error) {
      console.error("[forumQueries.createThread] Error:", error)
      return null
    }
  },

  updateThread: async (
    id: string,
    data: Partial<{
      title: string
      content: string
      status: string
      is_pinned: boolean
      is_locked: boolean
    }>,
  ) => {
    try {
      const supabase = createAdminClient()
      const { data: thread, error } = await supabase
        .from("forum_threads")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return thread
    } catch (error) {
      console.error("[forumQueries.updateThread] Error:", error)
      return null
    }
  },

  getReplies: async (threadId: string, limit = 50, offset = 0) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[forumQueries.getReplies] Error:", error)
      return []
    }
  },

  createReply: async (data: { thread_id: string; author_id: string; content: string }) => {
    try {
      const supabase = createAdminClient()
      const { data: reply, error } = await supabase.from("forum_replies").insert(data).select().single()

      if (error) throw error
      return reply
    } catch (error) {
      console.error("[forumQueries.createReply] Error:", error)
      return null
    }
  },
}

// ============================================
// COINS QUERIES
// ============================================

export const coinsQueries = {
  getUserBalance: async (userId: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase.from("users").select("coins").eq("discord_id", userId).single()

      if (error) throw error
      return data?.coins || 0
    } catch (error) {
      console.error("[coinsQueries.getUserBalance] Error:", error)
      return 0
    }
  },

  getTransactions: async (userId: string, limit = 50, offset = 0) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[coinsQueries.getTransactions] Error:", error)
      return []
    }
  },

  addCoins: async (data: {
    user_id: string
    amount: number
    type: string
    description?: string
    reference_id?: string
  }) => {
    try {
      const supabase = createAdminClient()

      // First, get current balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("coins")
        .eq("discord_id", data.user_id)
        .single()

      if (userError) throw userError

      const newBalance = (user.coins || 0) + data.amount

      // Update balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ coins: newBalance })
        .eq("discord_id", data.user_id)

      if (updateError) throw updateError

      // Record transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("coin_transactions")
        .insert({
          user_id: data.user_id,
          amount: data.amount,
          type: data.type,
          description: data.description || null,
          reference_id: data.reference_id || null,
        })
        .select()
        .single()

      if (transactionError) throw transactionError
      return transaction
    } catch (error) {
      console.error("[coinsQueries.addCoins] Error:", error)
      return null
    }
  },

  canClaimDaily: async (userId: string, claimType: string) => {
    try {
      const supabase = createAdminClient()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data, error } = await supabase
        .from("coin_transactions")
        .select("created_at")
        .eq("user_id", userId)
        .eq("type", claimType)
        .gte("created_at", yesterday.toISOString())
        .limit(1)

      if (error) throw error
      return !data || data.length === 0
    } catch (error) {
      console.error("[coinsQueries.canClaimDaily] Error:", error)
      return false
    }
  },

  claimDailyReward: async (userId: string, claimType: string, amount = 100) => {
    try {
      return await coinsQueries.addCoins({
        user_id: userId,
        amount,
        type: claimType,
        description: "Daily reward claim",
      })
    } catch (error) {
      console.error("[coinsQueries.claimDailyReward] Error:", error)
      return null
    }
  },
}

// ============================================
// SPIN WHEEL QUERIES
// ============================================

export const spinWheelQueries = {
  getPrizes: async () => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("spin_wheel_prizes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[spinWheelQueries.getPrizes] Error:", error)
      return []
    }
  },

  getHistory: async (userId: string, limit = 50, offset = 0) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("spin_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[spinWheelQueries.getHistory] Error:", error)
      return []
    }
  },

  recordSpin: async (data: {
    user_id: string
    prize_id: string
    prize_name: string
    coins_won: number
    was_forced?: boolean
  }) => {
    try {
      const supabase = createAdminClient()
      const { data: spin, error } = await supabase
        .from("spin_history")
        .insert({
          user_id: data.user_id,
          prize_id: data.prize_id,
          prize_name: data.prize_name,
          coins_won: data.coins_won,
          was_forced: data.was_forced || false,
        })
        .select()
        .single()

      if (error) throw error
      return spin
    } catch (error) {
      console.error("[spinWheelQueries.recordSpin] Error:", error)
      return null
    }
  },

  getTickets: async (userId: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("spin_wheel_tickets")
        .select("*")
        .eq("user_id", userId)
        .eq("is_used", false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[spinWheelQueries.getTickets] Error:", error)
      return []
    }
  },

  useTicket: async (userId: string) => {
    try {
      const supabase = createAdminClient()

      // Find first available ticket
      const { data: tickets, error: findError } = await supabase
        .from("spin_wheel_tickets")
        .select("id")
        .eq("user_id", userId)
        .eq("is_used", false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: true })
        .limit(1)

      if (findError) throw findError
      if (!tickets || tickets.length === 0) return { success: false }

      // Mark as used
      const { error: updateError } = await supabase
        .from("spin_wheel_tickets")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", tickets[0].id)

      if (updateError) throw updateError
      return { success: true }
    } catch (error) {
      console.error("[spinWheelQueries.useTicket] Error:", error)
      return { success: false }
    }
  },

  addTicket: async (userId: string, ticketType: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("spin_wheel_tickets")
        .insert({ user_id: userId, ticket_type: ticketType })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[spinWheelQueries.addTicket] Error:", error)
      return null
    }
  },
}

// ============================================
// ADMIN QUERIES
// ============================================

export const adminQueries = {
  isAdmin: async (userId: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("users")
        .select("is_admin, membership")
        .eq("discord_id", userId)
        .single()

      if (error) throw error
      return data?.is_admin === true || data?.membership === "admin"
    } catch (error) {
      console.error("[adminQueries.isAdmin] Error:", error)
      return false
    }
  },

  getPendingThreads: async (limit = 50, offset = 0) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[adminQueries.getPendingThreads] Error:", error)
      return []
    }
  },

  approveThread: async (threadId: string, adminId: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("forum_threads")
        .update({
          status: "approved",
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", threadId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[adminQueries.approveThread] Error:", error)
      return null
    }
  },

  rejectThread: async (threadId: string, reason: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("forum_threads")
        .update({
          status: "rejected",
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", threadId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[adminQueries.rejectThread] Error:", error)
      return null
    }
  },

  getStats: async () => {
    try {
      const supabase = createAdminClient()

      const [threadsCount, repliesCount, usersCount, coinsSum] = await Promise.all([
        supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("is_deleted", false),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("coin_transactions").select("amount").gt("amount", 0),
      ])

      const totalCoins = coinsSum.data?.reduce((sum, t) => sum + t.amount, 0) || 0

      return {
        threads: threadsCount.count || 0,
        replies: repliesCount.count || 0,
        users: usersCount.count || 0,
        totalCoins,
      }
    } catch (error) {
      console.error("[adminQueries.getStats] Error:", error)
      return { threads: 0, replies: 0, users: 0, totalCoins: 0 }
    }
  },
}

// ============================================
// ASSETS QUERIES
// ============================================

export const assetsQueries = {
  getAll: async (filters?: {
    category?: string
    framework?: string
    search?: string
    limit?: number
    offset?: number
  }) => {
    const { category, framework, search, limit = 100, offset = 0 } = filters || {}

    try {
      const supabase = createAdminClient()
      let query = supabase
        .from("assets")
        .select(`*`)
        .in("status", ["active", "pending"]) // Include pending to show more assets

      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      if (framework && framework !== "all") {
        query = query.eq("framework", framework)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

      const { data: assets, error } = await query
      if (error) {
        console.error("[assetsQueries.getAll] Query error:", error)
        throw error
      }
      console.log("[assetsQueries.getAll] Found assets:", assets?.length || 0)
      if (!assets || assets.length === 0) return []

      // Get unique author IDs (these are UUIDs matching users.id)
      const authorIds = [...new Set(assets.map(a => a.author_id).filter(Boolean))]
      
      // Fetch authors by id (UUID primary key) - assets.author_id is UUID
      let authorsMap: Record<string, any> = {}
      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar, membership, xp, level, current_badge")
          .in("id", authorIds)
        
        for (const author of authors || []) {
          authorsMap[author.id] = author
        }
      }

      // Attach author to each asset
      return assets.map(asset => {
        const author = authorsMap[asset.author_id]
        return {
          ...asset,
          author: author ? {
            id: author.id,
            discord_id: author.discord_id,
            username: author.username || 'Unknown',
            avatar: author.avatar,
            membership: author.membership || 'free',
            xp: author.xp || 0,
            level: author.level || 1
          } : null,
          author_name: author?.username || 'Unknown',
          author_avatar: author?.avatar || null
        }
      })
    } catch (error) {
      console.error("[assetsQueries.getAll] Error:", error)
      return []
    }
  },

  getCount: async (filters?: { category?: string; framework?: string; search?: string }) => {
    const { category, framework, search } = filters || {}

    try {
      const supabase = createAdminClient()
      let query = supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "pending"])

      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      if (framework && framework !== "all") {
        query = query.eq("framework", framework)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { count, error } = await query
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error("[assetsQueries.getCount] Error:", error)
      return 0
    }
  },

  getById: async (id: string) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          *,
          author:users!assets_author_id_fkey(discord_id, username, avatar, membership)
        `,
        )
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[assetsQueries.getById] Error:", error)
      return null
    }
  },

  create: async (data: {
    title: string
    description: string
    category: string
    framework?: string
    version?: string
    coin_price?: number
    thumbnail?: string
    download_link?: string
    file_size?: string
    tags?: string[]
    author_id: string
  }) => {
    try {
      const supabase = createAdminClient()
      const { data: asset, error } = await supabase
        .from("assets")
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          framework: data.framework || "standalone",
          version: data.version || "1.0.0",
          coin_price: data.coin_price || 0,
          thumbnail: data.thumbnail || null,
          download_link: data.download_link || null,
          file_size: data.file_size || null,
          tags: data.tags || [],
          author_id: data.author_id,
        })
        .select()
        .single()

      if (error) throw error
      return asset
    } catch (error) {
      console.error("[assetsQueries.create] Error:", error)
      return null
    }
  },

  update: async (id: string, data: any) => {
    try {
      const supabase = createAdminClient()
      const { data: asset, error } = await supabase
        .from("assets")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return asset
    } catch (error) {
      console.error("[assetsQueries.update] Error:", error)
      return null
    }
  },

  incrementViews: async (id: string) => {
    try {
      const supabase = createAdminClient()
      const { error } = await supabase.rpc("increment_views", { asset_id: id })

      if (error) throw error
      return true
    } catch (error) {
      console.error("[assetsQueries.incrementViews] Error:", error)
      return false
    }
  },

  incrementDownloads: async (id: string) => {
    try {
      const supabase = createAdminClient()
      const { error } = await supabase.rpc("increment_downloads", { asset_id: id })

      if (error) throw error
      return true
    } catch (error) {
      console.error("[assetsQueries.incrementDownloads] Error:", error)
      return false
    }
  },

  getRecent: async (limit = 6) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          *,
          author:users!assets_author_id_fkey(username)
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[assetsQueries.getRecent] Error:", error)
      return []
    }
  },

  getTrending: async (limit = 6) => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          *,
          author:users!assets_author_id_fkey(username)
        `,
        )
        .eq("status", "active")
        .order("downloads", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[assetsQueries.getTrending] Error:", error)
      return []
    }
  },
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  forum: forumQueries,
  coins: coinsQueries,
  spinWheel: spinWheelQueries,
  admin: adminQueries,
  assets: assetsQueries,
}
