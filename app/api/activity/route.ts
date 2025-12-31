import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: downloads } = await supabase
      .from('downloads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    const rows = downloads || []
    const userIds = Array.from(new Set(rows.map((d: any) => d.user_id).filter(Boolean)))
    const assetIds = Array.from(new Set(rows.map((d: any) => d.asset_id).filter(Boolean)))

    const [{ data: users }, { data: assets }] = await Promise.all([
      userIds.length
        ? supabase.from('users').select('discord_id, username, avatar').in('discord_id', userIds)
        : Promise.resolve({ data: [] as any[] }),
      assetIds.length
        ? supabase.from('assets').select('id, title').in('id', assetIds)
        : Promise.resolve({ data: [] as any[] }),
    ])

    const usersById = new Map<string, any>()
    for (const u of users || []) usersById.set(u.discord_id, u)

    const assetsById = new Map<string, any>()
    for (const a of assets || []) assetsById.set(a.id, a)
    
    const activities = rows.map((d: any) => {
      const user = usersById.get(d.user_id)
      const asset = assetsById.get(d.asset_id)
      return {
      id: d.id,
      type: 'download',
      action: `downloaded ${asset?.title || 'an asset'}`,
      createdAt: d.created_at,
      user: {
        username: user?.username || 'Anonymous',
        avatar: user?.avatar || null
      }
      }
    })
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Activity error:', error)
    return NextResponse.json([])
  }
}
