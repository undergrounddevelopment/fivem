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

    // Generate download URL - handle Supabase Storage paths
    let downloadUrl = asset.download_url
    
    // Check if URL is a Supabase Storage path (needs signed URL)
    const supabaseStorageHost = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const isSupabaseStorage = downloadUrl?.includes('/storage/v1/object/') || 
                               downloadUrl?.includes(supabaseStorageHost + '/storage/')
    
    if (isSupabaseStorage) {
      // Extract bucket and path from URL
      // Format: https://xxx.supabase.co/storage/v1/object/public/bucket/path
      // Or: https://xxx.supabase.co/storage/v1/object/sign/bucket/path (already signed)
      const match = downloadUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/)
      
      if (match) {
        const [, bucket, path] = match
        console.log(`[API Download] Generating signed URL for bucket: ${bucket}, path: ${path}`)
        
        const { data: signedUrlData, error: signError } = await supabase
          .storage
          .from(bucket)
          .createSignedUrl(path, 3600) // 1 hour expiry
        
        if (signError || !signedUrlData?.signedUrl) {
          console.error('[API Download] Failed to create signed URL:', signError)
          // Try using original URL as fallback
        } else {
          downloadUrl = signedUrlData.signedUrl
          console.log('[API Download] Using signed URL')
        }
      }
    }
    
    // If no valid download URL, return error
    if (!downloadUrl) {
      console.error('[API Download] No download URL available for asset:', id)
      return NextResponse.json({ error: 'Download URL not configured' }, { status: 404 })
    }

    // METHOD 1: Direct Redirect (Fastest, Most Reliable)
    // This is actually the best approach for large files
    console.log(`[API Download] Redirecting to: ${downloadUrl.substring(0, 50)}...`)
    return NextResponse.redirect(downloadUrl)

  } catch (error) {
    console.error('[API Download] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
