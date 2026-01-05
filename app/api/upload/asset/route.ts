import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"
import { logger } from "@/lib/logger"
import { XP_CONFIG, getLevelFromXP } from "@/lib/xp-badges"
import { broadcastEvent } from "@/lib/realtime/broadcast"
import { hasPgConnection, pgPool } from "@/lib/db/postgres"
import { sendDiscordNotification } from "@/lib/discord-webhook"

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

    const supabase = getSupabaseAdminClient()

    // Get user UUID from database (session.user.id is discord_id)
    let user: { id: string; membership?: string | null; username?: string | null } | null = null
    if (hasPgConnection && pgPool) {
      const res = await pgPool.query('SELECT id, membership, username FROM users WHERE discord_id = $1 LIMIT 1', [session.user.id])
      user = res.rows?.[0] || null
    } else {
      const { data: supaUser, error: userError } = await supabase
        .from("users")
        .select("id, membership, username")
        .eq("discord_id", session.user.id)
        .single()

      if (userError || !supaUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      user = supaUser
    }

    if (!user?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // VIP and admin assets are auto-approved (Akamai v7 uses pending/approved/rejected/featured)
    const assetStatus = user?.membership === "vip" || user?.membership === "admin" ? "approved" : "pending"

    const sanitize = (text: string | null | undefined, maxLen = 50000) => {
      if (!text) return null
      return text.trim().slice(0, maxLen)
    }

    const safeTags = Array.isArray(tags) ? tags.slice(0, 20).map((t: string) => String(t).trim().slice(0, 50)) : []
    const safeThumbnail = thumbnailUrl || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(title)}`
    const safeCoinPrice = Math.max(0, Math.min(10000, Number(coinPrice) || 0))
    const parsedFileSize = fileSize ? Number.parseInt(String(fileSize), 10) : NaN
    const safeFileSize = Number.isFinite(parsedFileSize) ? parsedFileSize : null

    const metadata = {
      features: features ? String(features) : null,
      installation: installation ? String(installation) : null,
      changelog: changelog ? String(changelog) : null,
      youtubeLink: youtubeLink ? String(youtubeLink) : null,
      githubLink: githubLink ? String(githubLink) : null,
      docsLink: docsLink ? String(docsLink) : null,
      version: version ? String(version) : null,
    }

    let asset: any = null
    if (hasPgConnection && pgPool) {
      const res = await pgPool.query(
        `
          INSERT INTO assets (
            title,
            description,
            category,
            framework,
            coin_price,
            download_url,
            thumbnail_url,
            tags,
            file_size,
            creator_id,
            metadata,
            status,
            virus_scan_status,
            rating,
            rating_count,
            downloads,
            is_verified,
            is_featured
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
          )
          RETURNING *
        `,
        [
          sanitize(title, 200),
          sanitize(description),
          category,
          framework || "standalone",
          safeCoinPrice,
          fileUrl,
          safeThumbnail,
          safeTags,
          safeFileSize,
          user.id,
          metadata,
          assetStatus,
          "pending",
          5.0,
          0,
          0,
          false,
          false,
        ],
      )
      asset = res.rows?.[0] || null
    } else {
      const { data: supaAsset, error } = await supabase
        .from("assets")
        .insert({
          title: sanitize(title, 200),
          description: sanitize(description),
          features: sanitize(features),
          installation: sanitize(installation),
          changelog: sanitize(changelog),
          category,
          framework: framework || "standalone",
          coin_price: safeCoinPrice,
          download_link: fileUrl,
          thumbnail: safeThumbnail,
          tags: safeTags,
          file_size: fileSize || "Unknown",
          author_id: user.id, // Use UUID from database, not discord_id
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
      asset = supaAsset
    }

    if (!asset) {
      return NextResponse.json({ error: "Failed to save asset" }, { status: 500 })
    }

    // Log activity
    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "upload",
      action: `uploaded ${title}`,
      target_id: asset.id,
    })

    // Award XP for uploading asset
    try {
      const xpReward = XP_CONFIG.rewards.UPLOAD_ASSET

      if (hasPgConnection && pgPool) {
        const cur = await pgPool.query('SELECT xp, level FROM users WHERE discord_id = $1 LIMIT 1', [session.user.id])
        const currentUser = cur.rows?.[0]
        if (currentUser) {
          const newXP = (currentUser.xp || 0) + xpReward
          const levelInfo = getLevelFromXP(newXP)

          await pgPool.query(
            'UPDATE users SET xp = $1, level = $2, current_badge = $3, updated_at = NOW() WHERE discord_id = $4',
            [newXP, levelInfo.level, levelInfo.title.toLowerCase(), session.user.id],
          )

          // Log XP transaction (xp_transactions.user_id references users.discord_id)
          await pgPool.query(
            'INSERT INTO xp_transactions (user_id, amount, activity_type, description) VALUES ($1,$2,$3,$4)',
            [session.user.id, xpReward, 'UPLOAD_ASSET', `Earned ${xpReward} XP for uploading asset "${title}"`],
          )
        }
      } else {
        const { data: currentUser } = await supabase
          .from("users")
          .select("xp, level")
          .eq("discord_id", session.user.id)
          .single()

        if (currentUser) {
          const newXP = (currentUser.xp || 0) + xpReward
          const levelInfo = getLevelFromXP(newXP)

          await supabase
            .from("users")
            .update({
              xp: newXP,
              level: levelInfo.level,
              current_badge: levelInfo.title.toLowerCase(),
              updated_at: new Date().toISOString(),
            })
            .eq("discord_id", session.user.id)

          // Log XP transaction
          await supabase.from("xp_transactions").insert({
            user_id: session.user.id,
            amount: xpReward,
            activity_type: "UPLOAD_ASSET",
            description: `Earned ${xpReward} XP for uploading asset "${title}"`,
          })
        }
      }
    } catch (xpError) {
      console.error("[XP] Error awarding XP for upload:", xpError)
    }

    if (assetStatus === "approved") {
      const categoryLabels: Record<string, string> = {
        scripts: "Script",
        mlo: "MLO Map",
        vehicles: "Vehicle",
        clothing: "Clothing",
      }

      const notification = {
        title: `New ${categoryLabels[category] || "Asset"} Available!`,
        message: `${user?.username || "A user"} just uploaded "${title}" - ${Number(coinPrice) === 0 ? "FREE" : `${coinPrice} Coins`}`,
        type: "new_asset",
        link: `/asset/${asset.id}`,
        asset_id: asset.id,
        created_by: session.user.id,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
      }

      if (hasPgConnection && pgPool) {
        await pgPool.query(
          `
            INSERT INTO public_notifications (title, message, type, link, asset_id, created_by, is_active, expires_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          `,
          [
            notification.title,
            notification.message,
            notification.type,
            notification.link,
            notification.asset_id,
            notification.created_by,
            notification.is_active,
            notification.expires_at,
          ],
        )
      } else {
        await supabase.from("public_notifications").insert(notification)
      }
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

    // Send Discord notification for ALL uploads (pending and approved)
    try {
      await sendDiscordNotification({
        title: asset.title || title,
        description: asset.description || description,
        category: asset.category || category,
        thumbnail: asset.thumbnail || safeThumbnail,
        author: { username: user?.username || session.user.name || "Unknown User" },
        id: asset.id,
      })
      console.log("✅ Discord notification sent for asset:", asset.title)
    } catch (discordError) {
      console.error("❌ Discord notification failed:", discordError)
      // Don't fail the upload if Discord notification fails
    }

    // Realtime notification (works even after migrating DB away from Supabase)
    broadcastEvent("scripts-page-assets", "assets_changed", {
      id: asset.id,
      category: asset.category,
      status: asset.status,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      asset,
      message: assetStatus === "approved" ? "Asset uploaded and published!" : "Asset uploaded and pending approval",
    })
  } catch (error: any) {
    logger.error("Asset upload failed", error, {
      endpoint: "/api/upload/asset",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Upload failed: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
