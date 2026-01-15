import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.id !== process.env.ADMIN_DISCORD_ID) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { count: totalDownloads } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })

    const { data: assets } = await supabase
      .from('assets')
      .select('downloads')
      .not('download_url', 'is', null)

    const linkvertiseDownloads = assets?.reduce((sum, asset) => sum + (asset.downloads || 0), 0) || 0
    const conversionRate = totalDownloads ? Math.round((linkvertiseDownloads / totalDownloads) * 100) : 0
    const estimatedRevenue = ((linkvertiseDownloads / 1000) * 5).toFixed(2)

    return NextResponse.json({
      totalDownloads: totalDownloads || 0,
      linkvertiseDownloads,
      conversionRate,
      estimatedRevenue: parseFloat(estimatedRevenue)
    })
  } catch (error) {
    console.error('[API Linkvertise Stats] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
