'use server'

import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function getAssets(category?: string) {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from('assets').select('*, users(username, avatar)').eq('status', 'active')
  
  if (category) query = query.eq('category', category)
  
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) {
    console.error('getAssets error:', error)
    return []
  }
  return data || []
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
