import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    console.log(`[API Download] User ${session.user.id} downloading asset ${id}`)

    // Get asset details
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single()

    if (assetError || !asset) {
      console.error('[API Download] Asset not found:', assetError)
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, coins')
      .eq('discord_id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already purchased/downloaded this asset
    const { data: existingDownload } = await supabase
      .from('downloads')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('asset_id', id)
      .single()

    let coinsSpent = 0

    // Check if asset is premium and user hasn't purchased yet
    if (asset.coin_price > 0 && !existingDownload) {
      if (user.coins < asset.coin_price) {
        return NextResponse.json({ 
          error: 'Insufficient coins',
          required: asset.coin_price,
          available: user.coins
        }, { status: 403 })
      }

      coinsSpent = asset.coin_price

      // Deduct coins
      await supabase
        .from('users')
        .update({ coins: user.coins - asset.coin_price })
        .eq('id', user.id)

      // Record transaction (ignore errors)
      try {
        await supabase
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            amount: -asset.coin_price,
            type: 'purchase',
            description: `Downloaded: ${asset.title}`,
            asset_id: asset.id
          })
      } catch { /* ignore */ }
    }

    // Increment download count (ignore errors)
    try {
      await supabase
        .from('assets')
        .update({ downloads: (asset.downloads || 0) + 1 })
        .eq('id', id)
    } catch { /* ignore */ }

    // Record download in downloads table (only if not already recorded)
    if (!existingDownload) {
      try {
        await supabase
          .from('downloads')
          .insert({
            user_id: session.user.id, // discord_id
            asset_id: asset.id
          })
      } catch { /* ignore if already exists */ }
    }

    // Record download activity (ignore errors)
    try {
      await supabase
        .from('activities')
        .insert({
          user_id: session.user.id, // discord_id
          type: 'download',
          description: `Downloaded ${asset.title}`,
          asset_id: asset.id
        })
    } catch { /* ignore */ }

    // Return download URL
    const downloadUrl = asset.download_url || asset.download_link
    if (!downloadUrl) {
      return NextResponse.json({ error: 'Download URL not available' }, { status: 404 })
    }

    console.log(`[API Download] Success: ${asset.title}`)

    return NextResponse.json({ 
      downloadUrl,
      coinsSpent,
      message: existingDownload ? 'Already purchased' : 'Download started successfully'
    })

  } catch (error) {
    console.error('[API Download] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
