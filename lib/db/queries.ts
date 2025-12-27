import sql from './postgres'

// ============================================
// FORUM QUERIES
// ============================================

export const forumQueries = {
  // Categories
  getCategories: async () => {
    return await sql`
      SELECT * FROM forum_categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `
  },

  getCategoryById: async (id: string) => {
    return await sql`
      SELECT * FROM forum_categories WHERE id = ${id}
    `
  },

  // Threads
  getThreads: async (categoryId?: string, limit = 20, offset = 0) => {
    if (categoryId) {
      return await sql`
        SELECT 
          t.*,
          u.id as user_id,
          u.username as author_username,
          u.avatar as author_avatar,
          u.membership as author_membership
        FROM forum_threads t
        LEFT JOIN users u ON t.author_id::text = u.id::text
        WHERE t.category_id = ${categoryId} 
        AND t.status = 'approved' 
        AND t.is_deleted = false
        ORDER BY t.is_pinned DESC, t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }
    return await sql`
      SELECT 
        t.*,
        u.id as user_id,
        u.username as author_username,
        u.avatar as author_avatar,
        u.membership as author_membership
      FROM forum_threads t
      LEFT JOIN users u ON t.author_id::text = u.id::text
      WHERE t.status = 'approved' 
      AND t.is_deleted = false
      ORDER BY t.is_pinned DESC, t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  },

  getThreadById: async (id: string) => {
    return await sql`
      SELECT * FROM forum_threads WHERE id = ${id}
    `
  },

  createThread: async (data: {
    title: string
    content: string
    category_id: string
    author_id: string
    images?: string[]
  }) => {
    return await sql`
      INSERT INTO forum_threads (title, content, category_id, author_id, images)
      VALUES (${data.title}, ${data.content}, ${data.category_id}, ${data.author_id}, ${data.images || []})
      RETURNING *
    `
  },

  updateThread: async (id: string, data: Partial<{
    title: string
    content: string
    status: string
    is_pinned: boolean
    is_locked: boolean
  }>) => {
    const title = data.title ?? null
    const content = data.content ?? null
    const status = data.status ?? null
    const is_pinned = data.is_pinned ?? null
    const is_locked = data.is_locked ?? null
    
    return await sql`
      UPDATE forum_threads 
      SET 
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        status = COALESCE(${status}, status),
        is_pinned = COALESCE(${is_pinned}, is_pinned),
        is_locked = COALESCE(${is_locked}, is_locked),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  },

  // Replies
  getReplies: async (threadId: string, limit = 50, offset = 0) => {
    return await sql`
      SELECT * FROM forum_replies 
      WHERE thread_id = ${threadId} 
      AND is_deleted = false
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `
  },

  createReply: async (data: {
    thread_id: string
    author_id: string
    content: string
  }) => {
    return await sql`
      INSERT INTO forum_replies (thread_id, author_id, content)
      VALUES (${data.thread_id}, ${data.author_id}, ${data.content})
      RETURNING *
    `
  },
}

// ============================================
// COINS QUERIES
// ============================================

export const coinsQueries = {
  getUserBalance: async (userId: string) => {
    const result = await sql`SELECT get_user_balance(${userId}) as balance`
    return result[0]?.balance || 0
  },

  getTransactions: async (userId: string, limit = 50, offset = 0) => {
    return await sql`
      SELECT * FROM coin_transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  },

  addCoins: async (data: {
    user_id: string
    amount: number
    type: string
    description?: string
    reference_id?: string
  }) => {
    const result = await sql`
      SELECT add_coins(
        ${data.user_id}, 
        ${data.amount}, 
        ${data.type}, 
        ${data.description || null}, 
        ${data.reference_id || null}
      ) as result
    `
    return result[0]?.result
  },

  canClaimDaily: async (userId: string, claimType: string) => {
    const result = await sql`
      SELECT can_claim_daily(${userId}, ${claimType}) as can_claim
    `
    return result[0]?.can_claim || false
  },

  claimDailyReward: async (userId: string, claimType: string, amount = 100) => {
    const result = await sql`
      SELECT claim_daily_reward(${userId}, ${claimType}, ${amount}) as result
    `
    return result[0]?.result
  },
}

// ============================================
// SPIN WHEEL QUERIES
// ============================================

export const spinWheelQueries = {
  getPrizes: async () => {
    return await sql`
      SELECT * FROM spin_wheel_prizes 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `
  },

  getHistory: async (userId: string, limit = 50, offset = 0) => {
    return await sql`
      SELECT * FROM spin_wheel_history 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  },

  recordSpin: async (data: {
    user_id: string
    prize_id: string
    prize_name: string
    prize_type: string
    prize_value: number
    was_forced?: boolean
  }) => {
    return await sql`
      INSERT INTO spin_wheel_history 
      (user_id, prize_id, prize_name, prize_type, prize_value, was_forced)
      VALUES (${data.user_id}, ${data.prize_id}, ${data.prize_name}, ${data.prize_type}, ${data.prize_value}, ${data.was_forced || false})
      RETURNING *
    `
  },

  getTickets: async (userId: string) => {
    // First check spin_wheel_tickets table
    const tableTickets = await sql`
      SELECT * FROM spin_wheel_tickets 
      WHERE user_id = ${userId} 
      AND is_used = false
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at ASC
    `
    
    // Also check users.spin_tickets field (legacy) - try both discord_id and id
    const userTickets = await sql`
      SELECT spin_tickets FROM users 
      WHERE discord_id = ${userId} OR id::text = ${userId}
    `
    const legacyCount = userTickets[0]?.spin_tickets || 0
    
    console.log('[getTickets] userId:', userId, 'tableTickets:', tableTickets?.length, 'legacyCount:', legacyCount)
    
    // Return combined count as array-like structure
    const totalCount = (tableTickets?.length || 0) + legacyCount
    
    // Return array with length representing total tickets
    return Array.from({ length: totalCount }, (_, i) => ({ 
      id: i < (tableTickets?.length || 0) ? tableTickets[i]?.id : `legacy_${i}`,
      source: i < (tableTickets?.length || 0) ? 'table' : 'legacy'
    }))
  },

  useTicket: async (userId: string) => {
    // First try to use ticket from spin_wheel_tickets table
    const tableTickets = await sql`
      SELECT id FROM spin_wheel_tickets 
      WHERE user_id = ${userId} 
      AND is_used = false
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at ASC
      LIMIT 1
    `
    
    if (tableTickets && tableTickets.length > 0) {
      // Mark the ticket as used
      await sql`
        UPDATE spin_wheel_tickets 
        SET is_used = true, used_at = NOW()
        WHERE id = ${tableTickets[0].id}
      `
      return { success: true }
    }
    
    // Fallback: check users.spin_tickets (legacy field) - try both discord_id and id
    const userTickets = await sql`
      SELECT id, discord_id, spin_tickets FROM users 
      WHERE discord_id = ${userId} OR id::text = ${userId}
    `
    const legacyCount = userTickets[0]?.spin_tickets || 0
    const matchedDiscordId = userTickets[0]?.discord_id
    
    console.log('[useTicket] userId:', userId, 'legacyCount:', legacyCount, 'matchedDiscordId:', matchedDiscordId)
    
    if (legacyCount > 0 && matchedDiscordId) {
      // Decrement legacy tickets using the actual discord_id found
      await sql`
        UPDATE users SET spin_tickets = spin_tickets - 1 
        WHERE discord_id = ${matchedDiscordId} AND spin_tickets > 0
      `
      return { success: true }
    }
    
    return { success: false, error: "No tickets available" }
  },

  addTicket: async (userId: string, ticketType: string) => {
    return await sql`
      INSERT INTO spin_wheel_tickets (user_id, ticket_type)
      VALUES (${userId}, ${ticketType})
      RETURNING *
    `
  },
}

// ============================================
// ADMIN QUERIES
// ============================================

export const adminQueries = {
  isAdmin: async (userId: string) => {
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE discord_id = ${userId} 
        AND (is_admin = true OR membership = 'admin')
      ) as is_admin
    `
    return result[0]?.is_admin || false
  },

  getPendingThreads: async (limit = 50, offset = 0) => {
    return await sql`
      SELECT * FROM forum_threads 
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  },

  approveThread: async (threadId: string, adminId: string) => {
    return await sql`
      UPDATE forum_threads 
      SET status = 'approved', 
          approved_by = ${adminId}, 
          approved_at = NOW(),
          updated_at = NOW()
      WHERE id = ${threadId}
      RETURNING *
    `
  },

  rejectThread: async (threadId: string, reason: string) => {
    return await sql`
      UPDATE forum_threads 
      SET status = 'rejected', 
          rejection_reason = ${reason},
          updated_at = NOW()
      WHERE id = ${threadId}
      RETURNING *
    `
  },

  getStats: async () => {
    const [threads, replies, users, coins] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM forum_threads WHERE status = 'approved'`,
      sql`SELECT COUNT(*) as count FROM forum_replies WHERE is_deleted = false`,
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT SUM(amount) as total FROM coin_transactions WHERE amount > 0`,
    ])

    return {
      threads: threads[0]?.count || 0,
      replies: replies[0]?.count || 0,
      users: users[0]?.count || 0,
      totalCoins: coins[0]?.total || 0,
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
    
    let query = sql`
      SELECT a.*, u.username as author_name, u.avatar as author_avatar, u.membership
      FROM assets a
      LEFT JOIN users u ON a.author_id = u.discord_id
      WHERE a.status IN ('active', 'approved', 'published')
    `
    
    if (category && category !== 'all') {
      query = sql`${query} AND a.category = ${category}`
    }
    
    if (framework && framework !== 'all') {
      query = sql`${query} AND a.framework = ${framework}`
    }
    
    if (search) {
      query = sql`${query} AND (a.title ILIKE ${'%' + search + '%'} OR a.description ILIKE ${'%' + search + '%'})`
    }
    
    query = sql`${query} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    return await query
  },

  getCount: async (filters?: { category?: string; framework?: string; search?: string }) => {
    const { category, framework, search } = filters || {}
    
    let query = sql`SELECT COUNT(*) as count FROM assets WHERE status IN ('active', 'approved', 'published')`
    
    if (category && category !== 'all') {
      query = sql`${query} AND category = ${category}`
    }
    
    if (framework && framework !== 'all') {
      query = sql`${query} AND framework = ${framework}`
    }
    
    if (search) {
      query = sql`${query} AND (title ILIKE ${'%' + search + '%'} OR description ILIKE ${'%' + search + '%'})`
    }
    
    const result = await query
    return parseInt(result[0]?.count || '0')
  },

  getById: async (id: string) => {
    const result = await sql`
      SELECT a.*, u.username as author_name, u.avatar as author_avatar, u.membership
      FROM assets a
      LEFT JOIN users u ON a.author_id = u.discord_id
      WHERE a.id = ${id}
    `
    return result[0] || null
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
    return await sql`
      INSERT INTO assets (title, description, category, framework, version, coin_price, thumbnail, download_link, file_size, tags, author_id)
      VALUES (${data.title}, ${data.description}, ${data.category}, ${data.framework || 'standalone'}, ${data.version || '1.0.0'}, ${data.coin_price || 0}, ${data.thumbnail || null}, ${data.download_link || null}, ${data.file_size || null}, ${data.tags || []}, ${data.author_id})
      RETURNING *
    `
  },

  update: async (id: string, data: any) => {
    const title = data.title ?? null
    const description = data.description ?? null
    const category = data.category ?? null
    const framework = data.framework ?? null
    const version = data.version ?? null
    const coin_price = data.coin_price ?? null
    const thumbnail = data.thumbnail ?? null
    const download_link = data.download_link ?? null
    const file_size = data.file_size ?? null
    const status = data.status ?? null
    
    return await sql`
      UPDATE assets 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        category = COALESCE(${category}, category),
        framework = COALESCE(${framework}, framework),
        version = COALESCE(${version}, version),
        coin_price = COALESCE(${coin_price}, coin_price),
        thumbnail = COALESCE(${thumbnail}, thumbnail),
        download_link = COALESCE(${download_link}, download_link),
        file_size = COALESCE(${file_size}, file_size),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  },

  incrementViews: async (id: string) => {
    return await sql`UPDATE assets SET downloads = downloads + 1 WHERE id = ${id}`
  },

  incrementDownloads: async (id: string) => {
    return await sql`UPDATE assets SET downloads = downloads + 1 WHERE id = ${id}`
  },

  getRecent: async (limit = 6) => {
    return await sql`
      SELECT a.*, u.username as author_name
      FROM assets a
      LEFT JOIN users u ON a.author_id = u.discord_id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `
  },

  getTrending: async (limit = 6) => {
    return await sql`
      SELECT a.*, u.username as author_name
      FROM assets a
      LEFT JOIN users u ON a.author_id = u.discord_id
      WHERE a.status = 'active'
      ORDER BY a.downloads DESC
      LIMIT ${limit}
    `
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
