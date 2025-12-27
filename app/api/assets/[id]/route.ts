import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await db.assets.getById(id)

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Increment views
    await db.assets.incrementViews(id)

    // Format the asset with author info
    const formattedAsset = {
      ...asset,
      price: asset.coin_price === 0 ? 'free' : 'premium',
      coinPrice: asset.coin_price,
      author: asset.author_name ? {
        id: asset.author_id,
        username: asset.author_name,
        avatar: asset.author_avatar,
        membership: asset.membership
      } : null,
      image: asset.thumbnail,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }

    return NextResponse.json({ asset: formattedAsset })
  } catch (error) {
    console.error("Asset fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
