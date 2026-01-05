import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Check if free asset requires comment
    if (asset.coin_price === 0) {
      const { data: comments } = await supabase
        .from('asset_comments')
        .select('id')
        .eq('asset_id', params.id)
        .eq('user_id', session.user.id)
        .limit(1)

      if (!comments || comments.length === 0) {
        return NextResponse.json({ 
          error: 'Comment required',
          message: 'Please leave a comment before downloading this free asset'
        }, { status: 403 })
      }
    }

    // Get download link
    const downloadUrl = asset.download_link || `https://www.fivemtools.net/assets/${params.id}`

    // Update download count
    await supabase
      .from('assets')
      .update({ downloads: (asset.downloads || 0) + 1 })
      .eq('id', params.id)

    // Log download
    await supabase
      .from('downloads')
      .insert({
        asset_id: params.id,
        user_id: session.user.id,
        downloaded_at: new Date().toISOString()
      })
      .catch(() => {})

    return NextResponse.json({ 
      downloadUrl,
      coinsSpent: asset.coin_price || 0
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
