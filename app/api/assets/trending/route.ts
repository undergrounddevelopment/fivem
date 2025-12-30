import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('assets')
      .select('*, users(username, avatar)')
      .eq('status', 'active')
      .order('downloads', { ascending: false })
      .limit(4)
    
    if (error) throw error
    
    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Trending assets error:', error)
    return NextResponse.json({ items: [] })
  }
}
