import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const minRating = searchParams.get('minRating')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (query.length < 2) {
      return NextResponse.json({ success: true, results: [] })
    }

    let results: any[] = []

    // Search threads
    if (type === 'all' || type === 'threads') {
      let threadQuery = supabase
        .from('forum_threads')
        .select(`
          id, title, content, category_id, created_at,
          author:users!forum_threads_author_id_fkey(username, avatar),
          replies:forum_replies(count)
        `)
        .ilike('title', `%${query}%`)
        .eq('status', 'approved')

      if (category) threadQuery = threadQuery.eq('category_id', category)
      if (author) {
        const { data: authorData } = await supabase
          .from('users')
          .select('id')
          .ilike('username', `%${author}%`)
          .single()
        
        if (authorData) threadQuery = threadQuery.eq('author_id', authorData.id)
      }

      const { data: threads } = await threadQuery.limit(limit)

      if (threads) {
        results.push(...threads.map(thread => ({
          id: thread.id,
          title: thread.title,
          type: 'thread',
          author: thread.author?.username || 'Unknown',
          category: thread.category_id,
          replies: thread.replies?.length || 0,
          createdAt: thread.created_at,
          excerpt: thread.content?.substring(0, 150) + '...' || '',
          tags: []
        })))
      }
    }

    // Search assets
    if (type === 'all' || type === 'assets') {
      let assetQuery = supabase
        .from('assets')
        .select(`
          id, title, description, category, created_at, downloads, rating,
          author:users!assets_author_id_fkey(username, avatar),
          tags
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .in('status', ['approved', 'featured'])

      if (category) assetQuery = assetQuery.eq('category', category)
      if (minRating) assetQuery = assetQuery.gte('rating', parseInt(minRating))
      if (author) {
        const { data: authorData } = await supabase
          .from('users')
          .select('id')
          .ilike('username', `%${author}%`)
          .single()
        
        if (authorData) assetQuery = assetQuery.eq('author_id', authorData.id)
      }

      const { data: assets } = await assetQuery.limit(limit)

      if (assets) {
        results.push(...assets.map(asset => ({
          id: asset.id,
          title: asset.title,
          type: 'asset',
          author: asset.author?.username || 'Unknown',
          category: asset.category,
          rating: asset.rating || 0,
          downloads: asset.downloads || 0,
          createdAt: asset.created_at,
          excerpt: asset.description?.substring(0, 150) + '...' || '',
          tags: asset.tags || []
        })))
      }
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'popular':
          return (b.replies || b.downloads || 0) - (a.replies || a.downloads || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return NextResponse.json({
      success: true,
      results: results.slice(0, limit),
      total: results.length
    })

  } catch (error) {
    console.error('[API Advanced Search] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}