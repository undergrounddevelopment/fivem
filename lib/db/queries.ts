import { createAdminClient } from '../supabase/server'

const supabase = createAdminClient()

async function getUsersByDiscordIds(discordIds: string[]) {
  const ids = Array.from(new Set(discordIds.filter(Boolean)))
  if (ids.length === 0) return new Map<string, any>()

  const { data, error } = await supabase
    .from('users')
    .select('id, discord_id, username, avatar, membership')
    .in('discord_id', ids)

  if (error) throw error

  const map = new Map<string, any>()
  for (const u of data || []) {
    map.set(u.discord_id, u)
  }
  return map
}

// ============================================
// USER QUERIES
// ============================================

export const userQueries = {
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  getByDiscordId: async (discordId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  create: async (userData: {
    discord_id: string
    username: string
    email?: string
    avatar?: string
  }) => {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        discord_id: userData.discord_id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        membership: 'free',
        coins: 100,
        reputation: 0
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateCoins: async (userId: string, amount: number) => {
    const { data, error } = await supabase.rpc('update_user_coins', {
      user_id: userId,
      coin_amount: amount
    })
    
    if (error) throw error
    return data
  },
}

// ============================================
// FORUM QUERIES
// ============================================

export const forumQueries = {
  getCategories: async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  getCategoryById: async (id: string) => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  getThreads: async (categoryId?: string, limit = 20, offset = 0) => {
    let query = supabase
      .from('forum_threads')
      .select('*')
      .eq('status', 'approved')
      .eq('is_deleted', false)
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error

    const threads = data || []
    const usersByDiscordId = await getUsersByDiscordIds(threads.map((t: any) => t.author_id))

    return threads.map((t: any) => ({
      ...t,
      users: usersByDiscordId.get(t.author_id) || null,
    }))
  },

  getThreadById: async (id: string) => {
    const { data, error } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error

    if (!data) return data
    const usersByDiscordId = await getUsersByDiscordIds([data.author_id])
    return {
      ...data,
      users: usersByDiscordId.get(data.author_id) || null,
    }
  },

  createThread: async (threadData: {
    title: string
    content: string
    category_id: string
    author_id: string
    images?: string[]
  }) => {
    const { data, error } = await supabase
      .from('forum_threads')
      .insert([threadData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateThread: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('forum_threads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  getReplies: async (threadId: string, limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('thread_id', threadId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) throw error

    const replies = data || []
    const usersByDiscordId = await getUsersByDiscordIds(replies.map((r: any) => r.author_id))

    return replies.map((r: any) => ({
      ...r,
      users: usersByDiscordId.get(r.author_id) || null,
    }))
  },

  createReply: async (replyData: {
    thread_id: string
    author_id: string
    content: string
  }) => {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert([replyData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// ============================================
// COINS QUERIES
// ============================================

export const coinsQueries = {
  getUserBalance: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('coins')
      .eq('discord_id', userId)
      .single()
    
    if (error) throw error
    return data?.coins || 0
  },

  getTransactions: async (userId: string, limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data || []
  },

  addCoins: async (transactionData: {
    user_id: string
    amount: number
    type: string
    description?: string
    reference_id?: string
  }) => {
    // Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from('coin_transactions')
      .insert([transactionData])
      .select()
      .single()
    
    if (txError) throw txError

    // Update user coins
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('discord_id', transactionData.user_id)
      .single()
    
    if (userError) throw userError

    const newBalance = (user.coins || 0) + transactionData.amount
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: newBalance })
      .eq('discord_id', transactionData.user_id)
    
    if (updateError) throw updateError
    
    return transaction
  },

  canClaimDaily: async (userId: string, claimType: string) => {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', claimType)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    if (!data || data.length === 0) return true
    
    const lastClaim = new Date(data[0].created_at)
    const now = new Date()
    const hoursSince = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
    
    return hoursSince >= 24
  },

  claimDailyReward: async (userId: string, claimType: string, amount = 100) => {
    const canClaim = await coinsQueries.canClaimDaily(userId, claimType)
    
    if (!canClaim) {
      throw new Error('Daily reward already claimed')
    }
    
    return await coinsQueries.addCoins({
      user_id: userId,
      amount,
      type: claimType,
      description: 'Daily reward'
    })
  },
}

// ============================================
// SPIN WHEEL QUERIES
// ============================================

export const spinWheelQueries = {
  getPrizes: async () => {
    const { data, error } = await supabase
      .from('spin_wheel_prizes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  getHistory: async (userId: string, limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('spin_wheel_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data || []
  },

  recordSpin: async (spinData: {
    user_id: string
    prize_id: string
    prize_name: string
    prize_type: string
    prize_value: number
    was_forced?: boolean
  }) => {
    const { data, error } = await supabase
      .from('spin_wheel_history')
      .insert([spinData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  getTickets: async (userId: string) => {
    const { data, error } = await supabase
      .from('spin_wheel_tickets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_used', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  useTicket: async (userId: string) => {
    // Get first available ticket
    const tickets = await spinWheelQueries.getTickets(userId)
    
    if (tickets.length === 0) {
      return { success: false }
    }
    
    const { error } = await supabase
      .from('spin_wheel_tickets')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', tickets[0].id)
    
    if (error) throw error
    
    return { success: true }
  },

  addTicket: async (userId: string, ticketType: string) => {
    const { data, error } = await supabase
      .from('spin_wheel_tickets')
      .insert([{ user_id: userId, ticket_type: ticketType }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// ============================================
// ADMIN QUERIES
// ============================================

export const adminQueries = {
  isAdmin: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin, membership')
      .eq('discord_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    return data?.is_admin === true || data?.membership === 'admin'
  },

  getPendingThreads: async (limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error

    const threads = data || []
    const usersByDiscordId = await getUsersByDiscordIds(threads.map((t: any) => t.author_id))

    return threads.map((t: any) => ({
      ...t,
      users: usersByDiscordId.get(t.author_id) || null,
    }))
  },

  approveThread: async (threadId: string, adminId: string) => {
    const { data, error } = await supabase
      .from('forum_threads')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  rejectThread: async (threadId: string, reason: string) => {
    const { data, error } = await supabase
      .from('forum_threads')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  getStats: async () => {
    const [threads, replies, users, coins] = await Promise.all([
      supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('forum_replies').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('coin_transactions').select('amount').gt('amount', 0),
    ])

    const totalCoins = coins.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    return {
      threads: threads.count || 0,
      replies: replies.count || 0,
      users: users.count || 0,
      totalCoins,
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
    
    let query = supabase
      .from('assets')
      .select('*')
      .in('status', ['active', 'approved', 'published'])
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (framework && framework !== 'all') {
      query = query.eq('framework', framework)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error

    const assets = data || []
    const usersByDiscordId = await getUsersByDiscordIds(assets.map((a: any) => a.author_id))

    return assets.map((asset: any) => {
      const user = usersByDiscordId.get(asset.author_id)
      return {
        ...asset,
        users: user
          ? {
              id: user.id,
              discord_id: user.discord_id,
              username: user.username,
              avatar: user.avatar,
              membership: user.membership,
            }
          : undefined,
      }
    })
  },

  getCount: async (filters?: { category?: string; framework?: string; search?: string }) => {
    const { category, framework, search } = filters || {}
    
    let query = supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'approved', 'published'])
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (framework && framework !== 'all') {
      query = query.eq('framework', framework)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    const { count, error } = await query
    if (error) throw error
    return count || 0
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    if (!data) return data

    const usersByDiscordId = await getUsersByDiscordIds([data.author_id])
    const user = usersByDiscordId.get(data.author_id)

    return {
      ...data,
      users: user
        ? {
            id: user.id,
            discord_id: user.discord_id,
            username: user.username,
            avatar: user.avatar,
            membership: user.membership,
          }
        : undefined,
      author: user
        ? {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            membership: user.membership,
          }
        : null,
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
    const { data: result, error } = await supabase
      .from('assets')
      .insert([{
        title: data.title,
        description: data.description,
        category: data.category,
        framework: data.framework || 'standalone',
        version: data.version || '1.0.0',
        coin_price: data.coin_price || 0,
        thumbnail: data.thumbnail || null,
        download_link: data.download_link || null,
        file_size: data.file_size || null,
        tags: data.tags || [],
        author_id: data.author_id
      }])
      .select()
    
    if (error) throw error
    return result
  },

  update: async (id: string, data: any) => {
    const { data: result, error } = await supabase
      .from('assets')
      .update(data)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return result
  },

  incrementViews: async (id: string) => {
    const { error } = await supabase.rpc('increment_asset_views', { asset_id: id })
    if (error) console.error('Increment views error:', error)
  },

  incrementDownloads: async (id: string) => {
    const { error } = await supabase.rpc('increment_asset_downloads', { asset_id: id })
    if (error) console.error('Increment downloads error:', error)
  },

  getRecent: async (limit = 6) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .in('status', ['active', 'approved', 'published'])
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error

    const assets = data || []
    const usersByDiscordId = await getUsersByDiscordIds(assets.map((a: any) => a.author_id))

    return assets.map((asset: any) => {
      const user = usersByDiscordId.get(asset.author_id)
      return {
        ...asset,
        users: user
          ? {
              id: user.id,
              discord_id: user.discord_id,
              username: user.username,
              avatar: user.avatar,
              membership: user.membership,
            }
          : undefined,
      }
    })
  },

  getTrending: async (limit = 6) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .in('status', ['active', 'approved', 'published'])
      .order('downloads', { ascending: false })
      .limit(limit)
    
    if (error) throw error

    const assets = data || []
    const usersByDiscordId = await getUsersByDiscordIds(assets.map((a: any) => a.author_id))

    return assets.map((asset: any) => {
      const user = usersByDiscordId.get(asset.author_id)
      return {
        ...asset,
        users: user
          ? {
              id: user.id,
              discord_id: user.discord_id,
              username: user.username,
              avatar: user.avatar,
              membership: user.membership,
            }
          : undefined,
      }
    })
  },
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  user: userQueries,
  forum: forumQueries,
  coins: coinsQueries,
  spinWheel: spinWheelQueries,
  admin: adminQueries,
  assets: assetsQueries,
}
