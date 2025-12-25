import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: asset, error: assetError } = await supabase.from("assets").select("*").eq("id", id).single()

    if (assetError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("discord_id", session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (asset.coin_price > 0 && user.coins < asset.coin_price) {
      return NextResponse.json(
        {
          error: "Insufficient coins",
          required: asset.coin_price,
          available: user.coins,
        },
        { status: 400 },
      )
    }

    const { data: existingDownload } = await supabase
      .from("downloads")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("asset_id", id)
      .single()

    if (existingDownload) {
      return NextResponse.json({
        success: true,
        downloadUrl: asset.download_link,
        message: "Already purchased",
      })
    }

    if (asset.coin_price > 0) {
      await supabase
        .from("users")
        .update({ coins: user.coins - asset.coin_price })
        .eq("discord_id", session.user.id)

      await supabase.from("coin_transactions").insert({
        user_id: session.user.id,
        amount: -asset.coin_price,
        type: "asset_purchase",
        description: `Purchased: ${asset.title}`,
      })
    }

    await supabase.from("downloads").insert({
      user_id: session.user.id,
      asset_id: id,
      coin_spent: asset.coin_price,
    })

    await supabase
      .from("assets")
      .update({ downloads: asset.downloads + 1 })
      .eq("id", id)

    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "download",
      action: `downloaded ${asset.title}`,
      target_id: id,
    })

    if (asset.author_id !== session.user.id) {
      await supabase.from("notifications").insert({
        user_id: asset.author_id,
        title: "New Download",
        message: `${user.username} downloaded ${asset.title}`,
        type: "download",
        link: `/asset/${id}`,
      })
    }

    return NextResponse.json({
      success: true,
      downloadUrl: asset.download_link,
      coinsSpent: asset.coin_price,
    })
  } catch (error: any) {
    logger.error("Download error", error, {
      assetId: id,
      endpoint: `/api/download/${id}`,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
