import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"
import { autoCleanText } from "@/lib/text-formatter"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    if (!id || typeof id !== "string" || id.length < 10) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 })
    }

    if (!security.checkRateLimit(`asset_view_${clientIP}`, 500, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: asset, error } = await supabase.from("assets").select("*").eq("id", id).single()

    if (error || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    if (asset.status === "rejected" || asset.status === "archived") {
      return NextResponse.json({ error: "Asset not available" }, { status: 404 })
    }

    let author = null
    if (asset.author_id) {
      const { data: authorData } = await supabase
        .from("users")
        .select("username, avatar, membership, is_banned")
        .eq("discord_id", asset.author_id)
        .single()
      author = authorData
    }

    if (author?.is_banned) {
      return NextResponse.json({ error: "Asset not available" }, { status: 404 })
    }

    const formattedAsset = {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      features: asset.features || "",
      installation: asset.installation || "",
      changelog: asset.changelog || "",
      category: asset.category,
      framework: asset.framework,
      version: asset.version || "1.0.0",
      price: asset.coin_price === 0 ? "free" : "premium",
      coinPrice: asset.coin_price || 0,
      coin_price: asset.coin_price || 0,
      image: asset.thumbnail,
      thumbnail: asset.thumbnail,
      downloadLink: asset.download_link,
      download_link: asset.download_link,
      fileSize: asset.file_size || "~5 MB",
      file_size: asset.file_size || "~5 MB",
      downloads: asset.downloads || 0,
      tags: asset.tags || [],
      status: asset.status,
      author: author?.username || "FiveM Developer",
      authorAvatar: author?.avatar,
      authorMembership: author?.membership || "free",
      author_id: asset.author_id,
      rating: asset.rating || 5.0,
      rating_count: asset.rating_count || Math.max(Math.floor((asset.downloads || 0) / 10), 1),
      isVerified: asset.is_verified || asset.virus_scan_status === "clean" || true,
      is_verified: asset.is_verified || true,
      isFeatured: asset.is_featured || (asset.downloads || 0) > 1000,
      is_featured: asset.is_featured,
      youtubeLink: asset.youtube_link || "",
      githubLink: asset.github_link || "",
      docsLink: asset.docs_link || "",
      youtube_link: asset.youtube_link || "",
      github_link: asset.github_link || "",
      docs_link: asset.docs_link || "",
      createdAt: asset.created_at,
      created_at: asset.created_at,
      updatedAt: asset.updated_at,
      updated_at: asset.updated_at,
    }

    return NextResponse.json(formattedAsset)
  } catch (error: any) {
    const { id } = await context.params
    logger.error("Fetch asset error", error, {
      assetId: id,
      endpoint: `/api/assets/${id}`,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const supabase = await getSupabaseAdminClient()

    // Get current asset to verify ownership
    const { data: asset, error: fetchError } = await supabase.from("assets").select("author_id").eq("id", id).single()

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Auto-clean text fields
    const cleanedData = {
      title: body.title?.trim(),
      description: autoCleanText(body.description || ""),
      features: autoCleanText(body.features || ""),
      installation: autoCleanText(body.installation || ""),
      changelog: autoCleanText(body.changelog || ""),
      category: body.category,
      framework: body.framework,
      version: body.version,
      coin_price: body.coin_price || 0,
      tags: body.tags || [],
      thumbnail: body.thumbnail,
      download_link: body.download_link,
      youtube_link: body.youtube_link || null,
      github_link: body.github_link || null,
      docs_link: body.docs_link || null,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase.from("assets").update(cleanedData).eq("id", id)

    if (updateError) {
      logger.error("Update asset error", updateError, { assetId: id })
      return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Asset updated successfully" })
  } catch (error: any) {
    const { id } = await context.params
    logger.error("Update asset error", error, { assetId: id })
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const supabase = await getSupabaseAdminClient()

    // Get current asset to verify it exists
    const { data: asset, error: fetchError } = await supabase
      .from("assets")
      .select("author_id, title")
      .eq("id", id)
      .single()

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Delete the asset
    const { error: deleteError } = await supabase.from("assets").delete().eq("id", id)

    if (deleteError) {
      logger.error("Delete asset error", deleteError, { assetId: id })
      return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
    }

    logger.info("Asset deleted", { assetId: id, title: asset.title })
    return NextResponse.json({ success: true, message: "Asset deleted successfully" })
  } catch (error: any) {
    const { id } = await context.params
    logger.error("Delete asset error", error, { assetId: id })
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
