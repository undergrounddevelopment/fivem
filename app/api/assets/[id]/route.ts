import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from "@/lib/supabase/server"

// Remove global client
// const supabase = ...

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[API Asset Detail] Query error:', error)
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get author info separately if author_id exists
    let authorData: any = null
    if (asset.author_id) {
      const { data: author } = await supabase
        .from('users')
        .select('id, discord_id, username, avatar, membership, xp, level, current_badge')
        .eq('id', asset.author_id)
        .single()
      
      authorData = author || null
    }

    // Increment view count
    await supabase
      .from('assets')
      .update({ views: (asset.views || 0) + 1 })
      .eq('id', id)

    // Format response
    const formattedAsset = {
      ...asset,
      price: asset.coin_price === 0 ? 'free' : 'premium',
      coinPrice: asset.coin_price || 0,
      author: authorData?.username || 'Unknown',
      authorData: authorData || { 
        username: 'Unknown', 
        avatar: null, 
        membership: 'free', 
        xp: 0, 
        level: 1,
        current_badge: 'beginner'
      },
      authorId: asset.author_id,
      isVerified: asset.is_verified !== false,
      isFeatured: asset.is_featured || asset.status === 'featured',
      image: asset.thumbnail_url || asset.thumbnail,
      thumbnail: asset.thumbnail_url || asset.thumbnail,
      downloadLink: asset.download_url || asset.download_link,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }

    return NextResponse.json(formattedAsset)
  } catch (error) {
    console.error('[API Asset Detail] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Instantiate client
    const supabase = createAdminClient()

    // Check if user owns the asset or is admin
    const { data: asset } = await supabase
      .from('assets')
      .select('author_id')
      .eq('id', id)
      .single()

    const { data: user } = await supabase
      .from('users')
      .select('is_admin, membership, discord_id')
      .eq('discord_id', session.user.id)
      .single()

    // Get asset author info
    let assetAuthor: any = null
    if (asset?.author_id) {
      const { data: author } = await supabase
        .from('users')
        .select('discord_id')
        .eq('id', asset.author_id)
        .single()
      assetAuthor = author || null
    }

    const isOwner = assetAuthor?.discord_id === session.user.id
    const isAdmin = user?.is_admin || user?.membership === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update asset with all fields
    const { data: updatedAsset, error } = await supabase
      .from('assets')
      .update({
        title: data.title,
        description: data.description,
        features: data.features,
        installation: data.installation,
        changelog: data.changelog,
        category: data.category,
        framework: data.framework,
        version: data.version,
        coin_price: data.coin_price || data.coinPrice || 0,
        thumbnail: data.thumbnail,
        thumbnail_url: data.thumbnail,
        download_link: data.download_link || data.downloadLink,
        download_url: data.download_link || data.downloadLink,
        youtube_link: data.youtube_link || data.youtubeLink,
        github_link: data.github_link || data.githubLink,
        docs_link: data.docs_link || data.docsLink,
        tags: data.tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API Asset Update] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedAsset)
  } catch (error) {
    console.error('[API Asset Update] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const supabase = createAdminClient()

    // Check if user owns the asset or is admin
    const { data: asset } = await supabase
      .from('assets')
      .select('author_id')
      .eq('id', id)
      .single()

    const { data: user } = await supabase
      .from('users')
      .select('is_admin, membership, discord_id')
      .eq('discord_id', session.user.id)
      .single()

    // Get asset author info
    let assetAuthor: any = null
    if (asset?.author_id) {
      const { data: author } = await supabase
        .from('users')
        .select('discord_id')
        .eq('id', asset.author_id)
        .single()
      assetAuthor = author || null
    }

    const isOwner = assetAuthor?.discord_id === session.user.id
    const isAdmin = user?.is_admin || user?.membership === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete asset
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API Asset Delete] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Asset Delete] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}