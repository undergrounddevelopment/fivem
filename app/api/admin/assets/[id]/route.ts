import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      framework,
      coinPrice,
      coin_price,
      tags,
      status,
      thumbnail,
      downloadLink,
      download_link,
      version,
      features,
      installation,
      changelog,
    } = body

    const supabase = await getSupabaseAdminClient()

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = security.sanitizeInput(title)
    if (description !== undefined) updateData.description = description // Don't sanitize - allows markdown/emoji
    if (category !== undefined) updateData.category = category
    if (framework !== undefined) updateData.framework = framework
    if (version !== undefined) updateData.version = version
    if (features !== undefined) updateData.features = features
    if (installation !== undefined) updateData.installation = installation
    if (changelog !== undefined) updateData.changelog = changelog
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail
    if (tags !== undefined) updateData.tags = tags
    if (status !== undefined) updateData.status = status

    const priceValue = coinPrice ?? coin_price
    if (priceValue !== undefined) updateData.coin_price = Math.max(0, Math.min(10000, priceValue))

    const linkValue = downloadLink || download_link
    if (linkValue !== undefined) updateData.download_link = linkValue

    // Log what we're updating for debugging
    console.log("Updating asset with data:", updateData)

    const { data: asset, error } = await supabase.from("assets").update(updateData).eq("id", id).select("*").single()

    if (error) {
      console.error("Supabase update error:", error)
      throw error
    }

    // Fetch author separately
    let author = null
    if (asset.author_id) {
      const { data: authorData } = await supabase
        .from("users")
        .select("username, avatar, membership")
        .eq("discord_id", asset.author_id)
        .single()
      author = authorData
    }

    // Log activity
    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "admin_edit",
      action: `edited asset: ${asset.title}`,
      target_id: id,
    })

    return NextResponse.json({
      success: true,
      asset: {
        ...asset,
        author,
        coinPrice: asset.coin_price,
        downloadLink: asset.download_link,
        fileSize: asset.file_size,
      },
    })
  } catch (error: any) {
    logger.error("Admin edit asset error", error, {
      assetId: id,
      endpoint: `/api/admin/assets/${id}`,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: error.message || "Failed to update asset" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: asset } = await supabase.from("assets").select("title").eq("id", id).single()

    const { error } = await supabase.from("assets").update({ status: "archived" }).eq("id", id)

    if (error) throw error

    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "admin_delete",
      action: `deleted asset: ${asset?.title || id}`,
      target_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("Admin delete asset error", error, {
      assetId: id,
      endpoint: `/api/admin/assets/${id}`,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
