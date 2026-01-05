import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get asset with proper error handling
    const { data: asset, error } = await supabase
      .from('assets')
      .select(`
        id,
        title,
        description,
        features,
        installation,
        changelog,
        thumbnail,
        category,
        framework,
        version,
        status,
        downloads,
        views,
        rating,
        coin_price,
        author_id,
        tags,
        created_at,
        updated_at
      `)
      .eq('id', params.id)
      .single()

    if (error || !asset) {
      console.error('Asset fetch error:', error)
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get author info separately to avoid join issues
    let author = null
    if (asset.author_id) {
      const { data: authorData } = await supabase
        .from('users')
        .select('id, username, avatar, membership')
        .eq('id', asset.author_id)
        .single()
      
      author = authorData
    }

    // Increment view count (don't wait for it)
    supabase
      .from('assets')
      .update({ views: (asset.views || 0) + 1 })
      .eq('id', params.id)
      .then(() => {})
      .catch(() => {})

    const response = {
      asset: {
        ...asset,
        author: author || {
          id: asset.author_id,
          username: 'Unknown User',
          avatar: null,
          membership: 'member'
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
