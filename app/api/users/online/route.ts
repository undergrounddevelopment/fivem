import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('users')
      .select('discord_id, username, avatar, membership')
      .gte('last_seen', fiveMinutesAgo)
      .eq('is_banned', false)
      .order('last_seen', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    return NextResponse.json({
      users: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Online users error:', error)
    return NextResponse.json({ users: [], count: 0 })
  }
}
