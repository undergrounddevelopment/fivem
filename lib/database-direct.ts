import { createAdminClient } from '@/lib/supabase/server'

// Users
export async function getUsers() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getUserById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateUser(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('discord_id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Assets
export async function getAssets() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      users(username, avatar)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAssetById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      users(username, avatar)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createAsset(asset: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('assets')
    .insert(asset)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAsset(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAsset(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Announcements
export async function getAnnouncements() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createAnnouncement(announcement: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAnnouncement(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAnnouncement(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Banners
export async function getBanners() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createBanner(banner: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('banners')
    .insert(banner)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBanner(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBanner(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Spin Wheel
export async function getSpinWheelPrizes() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('spin_wheel_prizes')
    .select('*')
    .order('probability', { ascending: false })
  if (error) throw error
  return data
}

export async function createSpinWheelPrize(prize: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('spin_wheel_prizes')
    .insert(prize)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSpinWheelPrize(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('spin_wheel_prizes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSpinWheelPrize(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('spin_wheel_prizes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getSpinHistory(userId?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('spin_history')
    .select(`
      *,
      users(username, avatar),
      spin_wheel_prizes(name, type, value)
    `)
    .order('created_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createSpinHistory(spin: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('spin_history')
    .insert(spin)
    .select()
    .single()
  if (error) throw error
  return data
}

// Forum
export async function getForumCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function createForumCategory(category: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forum_categories')
    .insert(category)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateForumCategory(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forum_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteForumCategory(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('forum_categories')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getForumThreads(categoryId?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('forum_threads')
    .select(`
      *,
      users(username, avatar),
      forum_categories(name, slug)
    `)
    .order('created_at', { ascending: false })
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getForumThreadById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`
      *,
      users(username, avatar),
      forum_categories(name, slug)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createForumThread(thread: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .insert(thread)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateForumThread(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteForumThread(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Notifications
export async function getNotifications(userId?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createNotification(notification: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNotification(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNotification(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Analytics & Stats
export async function getAnalytics() {
  const supabase = createAdminClient()
  
  const [
    { count: totalUsers },
    { count: totalAssets },
    { count: totalDownloads },
    { count: activeUsers }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('assets').select('*', { count: 'exact', head: true }),
    supabase.from('downloads').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('last_seen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ])
  
  return {
    totalUsers: totalUsers || 0,
    totalAssets: totalAssets || 0,
    totalDownloads: totalDownloads || 0,
    activeUsers: activeUsers || 0
  }
}

export async function getDashboardStats() {
  const supabase = createAdminClient()
  
  const [users, assets, announcements, banners] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('assets').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*', { count: 'exact', head: true }),
    supabase.from('banners').select('*', { count: 'exact', head: true })
  ])
  
  return {
    users: users.count || 0,
    assets: assets.count || 0,
    announcements: announcements.count || 0,
    banners: banners.count || 0
  }
}