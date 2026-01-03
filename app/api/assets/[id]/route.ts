import { NextResponse } from "next/server"
import { assetsQueries } from "@/lib/db/queries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await assetsQueries.getById(id)

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Increment views
    await assetsQueries.incrementViews(id)

    // Format the asset with author info
    const formattedAsset = {
      ...asset,
      price: asset.coin_price === 0 ? 'free' : 'premium',
      coinPrice: asset.coin_price,
      author: asset.author ? {
        id: asset.author_id,
        username: asset.author.username || 'Unknown',
        avatar: asset.author.avatar,
        membership: asset.author.membership || 'free',
        xp: asset.author.xp ?? 0,
        level: asset.author.level ?? 1,
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
