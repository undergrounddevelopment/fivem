import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create client inside handler - NOT at module level
    const supabase = createAdminClient()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Simple query without foreign key joins that may not exist
    let query = supabase
      .from('forum_threads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category_id', category)
    }

    const { data: threads, error } = await query

    if (error) {
      console.error('[Forum API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch author data for each thread
    const enrichedThreads = await Promise.all(
      (threads || []).map(async (thread: any) => {
        let authorData = null
        if (thread.author_id) {
          const { data: author } = await supabase
            .from('users')
            .select('username, avatar, membership')
            .eq('id', thread.author_id)
            .single()
          authorData = author
        }

        let categoryData = null
        if (thread.category_id) {
          const { data: cat } = await supabase
            .from('forum_categories')
            .select('name, icon, color')
            .eq('id', thread.category_id)
            .single()
          categoryData = cat
        }

        return {
          ...thread,
          author: authorData,
          category: categoryData
        }
      })
    )

    return NextResponse.json({ threads: enrichedThreads })
  } catch (error) {
    console.error('[Forum API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
