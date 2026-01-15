import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyAssetUpload } from '@/lib/discord-webhook'
import { autoConvertToLinkvertise } from '@/lib/linkvertise'
import { createAdminClient } from "@/lib/supabase/server"

// Client instantiated inside handlers, not globally

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const framework = searchParams.get('framework')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    console.log('[API Assets] Query:', { category, framework, search, page, limit })

    const supabase = createAdminClient()

    // Build query - Fix status filter to match database enum
    let query = supabase
      .from('assets')
      .select('*, author:users!assets_author_id_fkey(username, avatar, membership)', { count: 'exact' })
      .in('status', ['pending', 'approved', 'featured', 'active'])

    // Add status filter if specified
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    if (category) query = query.eq('category', category)
    if (framework && framework !== 'all') query = query.eq('framework', framework)
    if (search) query = query.ilike('title', `%${search}%`)

    query = query.order('created_at', { ascending: false })
    query = query.range(offset, offset + limit - 1)

    const { data: assets, error, count } = await query

    if (error) {
      console.error('[API Assets] Query error:', error)
      return NextResponse.json({ error: error.message, items: [], assets: [] }, { status: 500 })
    }

    console.log(`[API Assets] Found ${assets?.length || 0} assets (total: ${count})`)

    const formattedAssets = (assets || []).map((asset: any) => {
      // 100% real author data only - no fallbacks
      const authorData = asset.author || null

      return {
        ...asset,
        price: asset.coin_price === 0 ? 'free' : 'premium',
        coinPrice: asset.coin_price || 0,
        author: authorData?.username || null,
        authorData: authorData,
        authorId: asset.author_id || asset.creator_id,
        isVerified: asset.is_verified !== false,
        isFeatured: asset.is_featured || asset.status === 'featured' || (asset.downloads || 0) > 10000,
        image: asset.thumbnail_url || asset.thumbnail,
        thumbnail: asset.thumbnail_url || asset.thumbnail,
        downloadLink: asset.download_url || asset.download_link,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      }
    })

    return NextResponse.json({
      items: formattedAssets,
      assets: formattedAssets,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    })
  } catch (error) {
    console.error('[API Assets] Error:', error)
    return NextResponse.json({ error: 'Internal server error', items: [], assets: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Store raw download link - Linkvertise wrapping happens dynamically on download
    const downloadUrl = data.downloadLink || null

    const supabase = createAdminClient()

    // Get user UUID
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('discord_id', session.user.id)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        framework: data.framework || 'standalone',
        version: data.version || '1.0.0',
        coin_price: data.coinPrice || 0,
        thumbnail_url: data.thumbnail || data.image,
        download_url: downloadUrl,
        file_size: data.fileSize,
        tags: data.tags || [],
        author_id: dbUser.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('[API Assets] Create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send Discord notification (single notification only)
    if (asset) {
      await notifyAssetUpload(asset, {
        username: session.user.name || 'Unknown'
      }).catch((err) => {
        console.error('[API Assets] Webhook error:', err)
      })
    }

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('[API Assets] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
