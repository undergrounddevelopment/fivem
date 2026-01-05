import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ purchased: false, error: 'Not logged in' })
    }

    const { id: assetId } = await params
    const supabase = getSupabase()
    const discordId = session.user.id

    // Check if user has downloaded/purchased this asset
    const { data: download, error } = await supabase
      .from('downloads')
      .select('id')
      .eq('asset_id', assetId)
      .eq('user_id', discordId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Check Purchase]', error)
    }

    // Also check purchases table if exists
    let purchase: { id: any } | null = null
    try {
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('asset_id', assetId)
        .eq('user_id', discordId)
        .single()
      purchase = data
    } catch {
      // purchases table might not exist, ignore
    }

    const hasPurchased = !!download || !!purchase

    return NextResponse.json({ purchased: hasPurchased })
  } catch (e: any) {
    console.error('[Check Purchase]', e)
    return NextResponse.json({ purchased: false, error: e.message })
  }
}
