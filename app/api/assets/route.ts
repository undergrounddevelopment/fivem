import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { assetsQueries } from '@/lib/db/queries'
import { sendDiscordNotification } from '@/lib/discord-webhook'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const framework = searchParams.get('framework')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const [assets, total] = await Promise.all([
      assetsQueries.getAll({ category: category || undefined, framework: framework || undefined, search: search || undefined, limit, offset }),
      assetsQueries.getCount({ category: category || undefined, framework: framework || undefined, search: search || undefined })
    ])

    const formattedAssets = (assets || []).map((asset: any) => ({
      ...asset,
      price: asset.coin_price === 0 ? 'free' : 'premium',
      coinPrice: asset.coin_price || 0,
      author: asset.author?.username || 'Unknown',
      authorData: asset.author ? { 
        username: asset.author.username, 
        avatar: asset.author.avatar, 
        membership: asset.author.membership,
        xp: asset.author.xp ?? 0,
        level: asset.author.level ?? 1,
      } : { username: 'Unknown', avatar: null, membership: 'free', xp: 0, level: 1 },
      authorId: asset.author_id,
      isVerified: asset.is_verified !== false,
      isFeatured: asset.is_featured || (asset.downloads || 0) > 10000,
      image: asset.thumbnail,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }))

    return NextResponse.json({
      items: formattedAssets,
      assets: formattedAssets,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit) || 1,
      },
    })
  } catch (error) {
    console.error('Assets API error:', error)
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

    // Get user UUID from database (session.user.id is discord_id)
    const supabase = createAdminClient()
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('discord_id', session.user.id)
      .single()

    if (userError || !dbUser) {
      console.error('User not found:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const asset = await assetsQueries.create({
      title: data.title,
      description: data.description,
      category: data.category,
      framework: data.framework || 'standalone',
      version: data.version || '1.0.0',
      coin_price: data.coinPrice || 0,
      thumbnail: data.thumbnail || data.image,
      download_link: data.downloadLink,
      file_size: data.fileSize,
      tags: data.tags || [],
      author_id: dbUser.id, // Use UUID from database
    })

    // Send Discord notification for new asset
    if (asset) {
      await sendDiscordNotification({
        title: asset.title,
        description: asset.description,
        category: asset.category,
        thumbnail: asset.thumbnail,
        author: { username: session.user.name || 'Unknown' },
        id: asset.id,
      })
    }

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
