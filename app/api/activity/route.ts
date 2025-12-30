import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: downloads } = await supabase
      .from('downloads')
      .select('*, users(username, avatar), assets(title)')
      .order('created_at', { ascending: false })
      .limit(10)
    
    const activities = (downloads || []).map(d => ({
      id: d.id,
      type: 'download',
      action: `downloaded ${d.assets?.title || 'an asset'}`,
      createdAt: d.created_at,
      user: {
        username: d.users?.username || 'Anonymous',
        avatar: d.users?.avatar || null
      }
    }))
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Activity error:', error)
    return NextResponse.json([])
  }
}
