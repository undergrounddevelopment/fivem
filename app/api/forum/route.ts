import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL || 
  process.env.fivemvip_SUPABASE_URL || 
  process.env.SUPABASE_URL!,
  process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('forum_threads')
      .select('*, author:users!author_id(username, avatar, membership), category:forum_categories(name, icon, color)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category_id', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Forum API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ threads: data || [] })
  } catch (error) {
    console.error('[Forum API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
