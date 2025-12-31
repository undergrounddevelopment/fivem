'use server'

import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function getAssets(category?: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from('assets').select('*').eq('status', 'active')
  
  if (category) query = query.eq('category', category)
  
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) {
    console.error('getAssets error:', error)
    return []
  }

  const assets = data || []
  const authorIds = Array.from(new Set(assets.map((a: any) => a.author_id).filter(Boolean)))

  const { data: users, error: usersError } = authorIds.length
    ? await supabase.from('users').select('discord_id, username, avatar, membership').in('discord_id', authorIds)
    : { data: [], error: null }

  if (usersError) {
    console.error('getAssets users hydrate error:', usersError)
    return assets
  }

  const usersByDiscordId = new Map<string, any>()
  for (const u of users || []) usersByDiscordId.set(u.discord_id, u)

  return assets.map((asset: any) => {
    const user = usersByDiscordId.get(asset.author_id)
    return {
      ...asset,
      users: user ? { username: user.username, avatar: user.avatar, membership: user.membership } : null,
    }
  })
}

export async function getPublicAnnouncements() {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .eq('type', 'public')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('getPublicAnnouncements error:', error)
    return []
  }
  return data || []
}
