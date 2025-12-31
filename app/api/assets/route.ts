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
      tags: asset.tags || [],
      author: (asset as any).users?.username || 'Unknown',
      authorData: {
        username: (asset as any).users?.username || 'Unknown',
        avatar: (asset as any).users?.avatar || null,
        membership: (asset as any).users?.membership,
      },
      authorId: asset.author_id,
      isVerified: asset.is_verified || asset.virus_scan_status === 'clean',
      isFeatured: asset.is_featured || asset.downloads > 10000,
      image: asset.thumbnail,
      thumbnail: asset.thumbnail,
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

    const coinPrice =
      typeof data.coinPrice === 'number'
        ? data.coinPrice
        : typeof data.coinPrice === 'string' && data.coinPrice.trim() !== ''
          ? Number(data.coinPrice)
          : 0

    const asset = await db.assets.create({
      title: data.title,
      description: data.description,
      category: data.category,
      framework: data.framework || 'standalone',
      version: data.version || '1.0.0',
      coin_price: Number.isFinite(coinPrice) ? coinPrice : 0,
      thumbnail: data.thumbnail || data.image,
      download_link: data.downloadLink,
      file_size: data.fileSize,
      tags: data.tags || [],
      author_id: session.user.id,
    })

    const createdAsset = Array.isArray(asset) ? asset[0] : (asset as any)

    // Send Discord notification for new asset
    if (createdAsset) {
      await sendDiscordNotification({
        title: createdAsset.title,
        description: createdAsset.description,
        category: createdAsset.category,
        thumbnail: createdAsset.thumbnail,
        author: { username: session.user.name || 'Unknown' },
        id: createdAsset.id,
      })
    }

    return NextResponse.json(createdAsset, { status: 201 })
  } catch (error) {
    console.error('Create asset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
