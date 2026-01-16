import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyLinkvertiseHash, logDownloadAttempt, LINKVERTISE_CONFIG } from '@/lib/linkvertise'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assetId } = await params
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    // Get user UUID
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('discord_id', session.user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get asset
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error || !asset) {
      await logDownloadAttempt(assetId, dbUser.id, false, hash, 'Asset not found')
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Verify Linkvertise hash jika enabled
    if (LINKVERTISE_CONFIG.enabled) {
      const isValid = await verifyLinkvertiseHash(hash)
      if (!isValid) {
        await logDownloadAttempt(assetId, dbUser.id, false, hash, 'Invalid hash')
        return NextResponse.json({
          error: 'Invalid download link. Please use the Linkvertise link.',
          linkvertiseUrl: asset.download_url
        }, { status: 403 })
      }
    }

    // Update download count
    await supabase
      .from('assets')
      .update({ downloads: (asset.downloads || 0) + 1 })
      .eq('id', assetId)

    // Log download
    await supabase.from('downloads').insert({
      asset_id: assetId,
      user_id: dbUser.id
    })

    // Award XP
    // Award XP
    const { xpQueries } = await import('@/lib/xp/queries')
    await xpQueries.awardXP(session.user.id, 'asset_download', assetId)

    await logDownloadAttempt(assetId, dbUser.id, true, hash, 'Success')

    return NextResponse.json({
      success: true,
      downloadUrl: asset.download_url,
      message: 'Download started'
    })
  } catch (error) {
    console.error('[API Download] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assetId } = await params

    // Get user UUID
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('discord_id', session.user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get asset
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Update download count
    await supabase
      .from('assets')
      .update({ downloads: (asset.downloads || 0) + 1 })
      .eq('id', assetId)

    // Log download
    await supabase.from('downloads').insert({
      asset_id: assetId,
      user_id: dbUser.id
    })

    // Award XP
    // Award XP
    const { xpQueries } = await import('@/lib/xp/queries')
    await xpQueries.awardXP(session.user.id, 'asset_download', assetId)

    // Fetch dynamic settings for Linkvertise
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'linkvertise')
      .single()

    let finalDownloadUrl = asset.download_url

    // Apply Linkvertise if enabled dynamically
    if (settings?.value?.enabled && settings?.value?.userId) {
      // Check if already is linkvertise (to avoid double wrap if old data exists)
      const isAlreadyLinkvertise = asset.download_url?.includes('linkvertise.com') || asset.download_url?.includes('direct-link.net');

      if (!isAlreadyLinkvertise && asset.download_url) {
        const { generateLinkvertiseUrl } = await import('@/lib/linkvertise')
        // We direct to the verification route, OR we can wrap the direct link.
        // The verification route is better for analytics: /api/linkvertise/download/[id]
        // But wait, the verification route redirects to /api/download/[id].
        // If we verify HERE (in POST /download), we might skip verification?
        // No, this is "Initiate Download".
        // If we want to force Linkvertise, we should give the Linkvertise URL that points to the verification route.

        const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkvertise/download/${assetId}`
        finalDownloadUrl = generateLinkvertiseUrl(settings.value.userId, targetUrl)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Download tracked',
      downloadUrl: finalDownloadUrl
    })
  } catch (error) {
    console.error('[API Download POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
