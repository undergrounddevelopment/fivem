import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { generateLinkvertiseUrl } from '@/lib/linkvertise'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
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

    // Verify download token if required
    const token = _request.nextUrl.searchParams.get('token')
    
    // Check if Linkvertise is required
    if (asset.require_linkvertise) {
       // Import dynamically to avoid circular deps if any, though not expected here
       const { verifyDownloadToken } = await import('@/lib/token')
       
       if (!token) {
         console.warn(`[API Download] Missing token for protected asset ${id}`)
         return NextResponse.json({ error: 'Download token required' }, { status: 403 })
       }

       const validToken = verifyDownloadToken(token)
       if (!validToken || validToken.userId !== session.user.id || validToken.assetId !== id) {
         console.warn(`[API Download] Invalid token for asset ${id} user ${session.user.id}`)
         return NextResponse.json({ error: 'Invalid or expired download token' }, { status: 403 })
       }
    }

    // Redirect to the actual download URL
    // console.log(`[API Download] Success: ${asset.title} - Redirecting to ${asset.download_url}`)
    // return NextResponse.redirect(asset.download_url)

    // PROXY DOWNLOAD - Stream the file to the user without exposing the URL
    try {
      const fileResponse = await fetch(asset.download_url)
      
      if (!fileResponse.ok) {
        console.error(`[API Download] Failed to fetch file from source: ${fileResponse.status}`)
        throw new Error('Failed to fetch file from source')
      }

      const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream'
      const contentDisposition = `attachment; filename="${asset.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.zip"`

      return new NextResponse(fileResponse.body, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': contentDisposition,
        },
      })
    } catch (proxyError) {
      console.error('[API Download] Proxy error:', proxyError)
      // Fallback to redirect if proxy fails (optional, but maybe safer to fail secure)
      // return NextResponse.redirect(asset.download_url) 
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

  } catch (error) {
    console.error('[API Download] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
