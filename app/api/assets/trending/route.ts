import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('status', 'active')
      .order('downloads', { ascending: false })
      .limit(4)
    
    if (error) throw error

    const assets = (data || []) as any[]
    const authorIds = Array.from(new Set(assets.map((a: any) => a.author_id).filter(Boolean)))

    const { data: users, error: usersError } = authorIds.length
      ? await supabase.from('users').select('discord_id, username, avatar, membership').in('discord_id', authorIds)
      : { data: [], error: null }

    if (usersError) throw usersError

    const usersByDiscordId = new Map<string, any>()
    for (const u of users || []) usersByDiscordId.set(u.discord_id, u)

    const items = assets
      .map((asset: any) => {
        const user = asset.author_id ? usersByDiscordId.get(asset.author_id) : null
        const computedRating = Math.min(5.0, 3.5 + ((asset.downloads || 0) / 100) * 0.5)

        return {
          id: asset.id,
          title: asset.title,
          description: asset.description,
          category: asset.category,
          framework: asset.framework,
          version: asset.version,
          price: asset.coin_price === 0 ? 'free' : 'premium',
          coinPrice: asset.coin_price,
          image: asset.thumbnail,
          thumbnail: asset.thumbnail,
          downloads: asset.downloads,
          views: asset.views,
          tags: asset.tags || [],
          author: user?.username || 'Unknown',
          authorId: asset.author_id,
          authorData: user
            ? { username: user.username, avatar: user.avatar, membership: user.membership }
            : { username: 'Unknown', avatar: null },
          rating: Math.round(computedRating * 10) / 10,
          isVerified: asset.is_verified || asset.virus_scan_status === 'clean',
          isFeatured: asset.is_featured || (asset.downloads || 0) > 1000,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at,
        }
      })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Trending assets error:', error)
    return NextResponse.json({ items: [] })
  }
}
