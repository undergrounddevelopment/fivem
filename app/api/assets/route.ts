import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendDiscordNotification } from '@/lib/discord-webhook'

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
      db.assets.getAll({ category: category || undefined, framework: framework || undefined, search: search || undefined, limit, offset }),
      db.assets.getCount({ category: category || undefined, framework: framework || undefined, search: search || undefined })
    ])

    const formattedAssets = assets.map(asset => ({
      ...asset,
      price: asset.coin_price === 0 ? 'free' : 'premium',
      coinPrice: asset.coin_price,
      author: asset.author_name || 'Unknown',
      authorData: { username: asset.author_name, avatar: asset.author_avatar, membership: asset.membership },
      authorId: asset.author_id,
      isVerified: asset.is_verified || true,
      isFeatured: asset.is_featured || asset.downloads > 10000,
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
        total,
        pages: Math.ceil(total / limit),
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

    const asset = await db.assets.create({
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
      author_id: session.user.id,
    })

    // Send Discord notification for new asset
    if (asset && asset[0]) {
      await sendDiscordNotification({
        title: asset[0].title,
        description: asset[0].description,
        category: asset[0].category,
        thumbnail: asset[0].thumbnail,
        author: { username: session.user.name || 'Unknown' },
        id: asset[0].id,
      })
    }

    return NextResponse.json(asset[0], { status: 201 })
  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
