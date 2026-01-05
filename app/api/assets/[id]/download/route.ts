import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

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

    // Get asset details
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single()

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins, discord_id')
      .eq('discord_id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For FREE assets: Check if user has commented before allowing download
    const isFreeAsset = !asset.coin_price || asset.coin_price === 0
    if (isFreeAsset) {
      // Check if user has commented on this asset
      const { data: userComment, error: commentError } = await supabase
        .from('asset_comments')
        .select('id')
        .eq('asset_id', id)
        .eq('user_id', session.user.id)
        .limit(1)
        .single()

      if (commentError || !userComment) {
        return NextResponse.json({ 
          error: 'Comment required',
          message: 'You must leave a comment before downloading this free asset',
          requireComment: true
        }, { status: 403 })
      }
    }

    // Check if asset is premium and user has enough coins
    if (asset.coin_price > 0) {
      if (user.coins < asset.coin_price) {
        return NextResponse.json({ 
          error: 'Insufficient coins',
          required: asset.coin_price,
          current: user.coins
        }, { status: 400 })
      }

      // Check if already purchased
      const { data: existingDownload } = await supabase
        .from('downloads')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('asset_id', id)
        .single()

      if (!existingDownload) {
        // Deduct coins
        const newBalance = user.coins - asset.coin_price
        await supabase
          .from('users')
          .update({ coins: newBalance })
          .eq('discord_id', session.user.id)

        // Record transaction
        await supabase
          .from('coin_transactions')
          .insert({
            user_id: session.user.id,
            amount: -asset.coin_price,
            type: 'purchase',
            description: `Downloaded asset: ${asset.title}`,
            reference_id: asset.id
          })

        // Record download
        await supabase
          .from('downloads')
          .insert({
            user_id: session.user.id,
            asset_id: id,
            coin_spent: asset.coin_price
          })
      }
    } else {
      // Free asset - just record download
      const { data: existingDownload } = await supabase
        .from('downloads')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('asset_id', id)
        .single()

      if (!existingDownload) {
        await supabase
          .from('downloads')
          .insert({
            user_id: session.user.id,
            asset_id: id,
            coin_spent: 0
          })
      }
    }

    // Increment download count
    await supabase
      .from('assets')
      .update({ downloads: (asset.downloads || 0) + 1 })
      .eq('id', id)

    // Return download link
    return NextResponse.json({
      success: true,
      downloadUrl: asset.download_url || asset.download_link,
      message: 'Download started'
    })

  } catch (error) {
    console.error('[API Asset Download] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}