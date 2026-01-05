import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get asset
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
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get author info
    let author = null
    if (asset.author_id) {
      const { data: authorData } = await supabase
        .from('users')
        .select('id, username, avatar, membership')
        .eq('id', asset.author_id)
        .single()
      
      author = authorData
    }

    // Increment view count
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
      error: 'Internal server error'
    }, { status: 500 })
  }
}