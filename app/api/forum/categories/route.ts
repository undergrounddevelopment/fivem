import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    const categoriesWithCounts = await Promise.all(
      (data || []).map(async (cat) => {
        const { count } = await supabase
          .from('forum_threads')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)
        
        return { ...cat, thread_count: count || 0 }
      })
    )
    
    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('Forum categories error:', error)
    return NextResponse.json([])
  }
}
