import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      features,
      installation,
      changelog,
      category,
      framework,
      coinPrice = 0,
      tags = [],
      fileUrl,
      thumbnailUrl,
      fileSize,
      version,
      youtubeLink,
      githubLink,
      docsLink,
    } = body

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title must be less than 200 characters" }, { status: 400 })
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: "Description must be at least 10 characters" }, { status: 400 })
    }

    const validCategories = ["scripts", "mlo", "vehicles", "clothing"]
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    if (!fileUrl) {
      return NextResponse.json({ error: "Download link is required" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("membership, username")
      .eq("discord_id", session.user.id)
      .single()

    // VIP and admin assets are auto-approved
    const assetStatus = user?.membership === "vip" || user?.membership === "admin" ? "active" : "pending"

    const sanitize = (text: string | null | undefined, maxLen = 50000) => {
      if (!text) return null
      return text.trim().slice(0, maxLen)
    }

    const { data: asset, error } = await supabase
      .from("assets")
      .insert({
        title: sanitize(title, 200),
        description: sanitize(description),
        features: sanitize(features),
        installation: sanitize(installation),
        changelog: sanitize(changelog),
        category,
        framework: framework || "standalone",
        coin_price: Math.max(0, Math.min(10000, Number(coinPrice) || 0)),
        download_link: fileUrl,
        thumbnail: thumbnailUrl || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(title)}`,
        tags: Array.isArray(tags) ? tags.slice(0, 20).map((t: string) => String(t).trim().slice(0, 50)) : [],
        file_size: fileSize || "Unknown",
        author_id: session.user.id,
        version: version || "1.0.0",
        status: assetStatus,
        virus_scan_status: "pending",
        youtube_link: youtubeLink || null,
        github_link: githubLink || null,
        docs_link: docsLink || null,
        rating: 5.0,
        rating_count: 0,
        downloads: 0,
        is_verified: false,
        is_featured: false,
      })
      .select("*")
      .single()

    if (error) {
      logger.error("Asset insert failed", error)
      return NextResponse.json({ error: "Failed to save asset: " + error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "upload",
      action: `uploaded ${title}`,
      target_id: asset.id,
    })

    if (assetStatus === "active") {
      const categoryLabels: Record<string, string> = {
        scripts: "Script",
        mlo: "MLO Map",
        vehicles: "Vehicle",
        clothing: "Clothing",
      }

      await supabase.from("public_notifications").insert({
        title: `New ${categoryLabels[category] || "Asset"} Available!`,
        message: `${user?.username || "A user"} just uploaded "${title}" - ${Number(coinPrice) === 0 ? "FREE" : `${coinPrice} Coins`}`,
        type: "new_asset",
        link: `/asset/${asset.id}`,
        asset_id: asset.id,
        created_by: session.user.id,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
      })
    }

    security.logSecurityEvent(
      "Asset uploaded successfully",
      {
        userId: session.user.id,
        assetId: asset.id,
        title: asset.title,
        category: asset.category,
      },
      "low",
    )

    return NextResponse.json({
      success: true,
      asset,
      message: assetStatus === "active" ? "Asset uploaded and published!" : "Asset uploaded and pending approval",
    })
  } catch (error: any) {
    logger.error("Asset upload failed", error, {
      endpoint: "/api/upload/asset",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Upload failed: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
