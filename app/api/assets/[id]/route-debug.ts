import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== API DEBUG START ===')
  console.log('Asset ID:', params.id)
  
  try {
    console.log('Creating Supabase client...')
    const supabase = createClient()
    console.log('Supabase client created')
    
    // Test connection first
    console.log('Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('assets')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Database connection test failed:', testError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: testError.message 
      }, { status: 500 })
    }
    
    console.log('Database connection OK')
    
    // Get asset with proper error handling
    console.log('Fetching asset...')
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

    console.log('Query result:', { asset, error })

    if (error) {
      console.error('Asset fetch error:', error)
      return NextResponse.json({ 
        error: 'Asset not found',
        details: error.message,
        code: error.code 
      }, { status: 404 })
    }

    if (!asset) {
      console.log('No asset found')
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    console.log('Asset found:', asset.title)

    // Get author info separately to avoid join issues
    let author = null
    if (asset.author_id) {
      console.log('Fetching author info...')
      const { data: authorData, error: authorError } = await supabase
        .from('users')
        .select('id, username, avatar, membership')
        .eq('id', asset.author_id)
        .single()
      
      if (authorError) {
        console.warn('Author fetch error:', authorError)
      } else {
        author = authorData
        console.log('Author found:', author?.username)
      }
    }

    // Increment view count (don't wait for it)
    console.log('Incrementing view count...')
    supabase
      .from('assets')
      .update({ views: (asset.views || 0) + 1 })
      .eq('id', params.id)
      .then(() => console.log('View count updated'))
      .catch((err) => console.warn('View count update failed:', err))

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

    console.log('=== API DEBUG SUCCESS ===')
    return NextResponse.json(response)
  } catch (error) {
    console.error('=== API DEBUG ERROR ===')
    console.error('Caught error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}