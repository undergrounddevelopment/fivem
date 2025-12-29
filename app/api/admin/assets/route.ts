import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

async function verifyAdmin(session: any, supabase: any) {
  const { data: user } = await supabase
    .from("users")
    .select("is_admin, membership, role")
    .eq("discord_id", session.user.id)
    .single()

  return user?.is_admin === true || user?.membership === "admin" || user?.role === "admin"
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    if (!(await verifyAdmin(session, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let query = supabase.from("assets").select("*").order("created_at", { ascending: false }).limit(100)

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data: assets, error } = await query

    if (error) {
      console.error("Error fetching assets:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            admin: {
              userId: session.user.id,
              action: 'fetchAssets',
              statusParam: status
            }
          }
        });
      });
      
      throw error
    }

    // Fetch all unique author IDs
    const authorIds = [...new Set((assets || []).map((a) => a.author_id).filter(Boolean))]

    // Fetch authors in bulk
    let authorsMap: Record<string, any> = {}
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from("users")
        .select("discord_id, username, avatar")
        .in("discord_id", authorIds)

      authorsMap = (authors || []).reduce(
        (acc, author) => {
          acc[author.discord_id] = author
          return acc
        },
        {} as Record<string, any>,
      )
    }

    const formattedAssets = (assets || []).map((asset) => ({
      ...asset,
      author: authorsMap[asset.author_id] || null,
      tags: asset.tags || [],
      coinPrice: asset.coin_price,
      downloadLink: asset.download_link,
      fileSize: asset.file_size,
      isVerified: asset.is_verified,
      isFeatured: asset.is_featured,
      virusScanStatus: asset.virus_scan_status,
      authorId: asset.author_id,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }))

    return NextResponse.json({ assets: formattedAssets })
  } catch (error: any) {
    logger.error("Admin assets error", error, {
      endpoint: "/api/admin/assets",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          admin: {
            action: 'fetchAssets'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assetId, status } = await request.json()

    const supabase = getSupabaseAdminClient()

    if (!(await verifyAdmin(session, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: asset, error } = await supabase.from("assets").update({ status }).eq("id", assetId).select().single()

    if (error) {
      console.error("Error updating asset:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            admin: {
              userId: session.user.id,
              action: 'updateAsset',
              assetId,
              status
            }
          }
        });
      });
      
      throw error
    }

    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "admin_action",
      action: `Changed asset ${assetId} status to ${status}`,
      target_id: assetId,
    })

    return NextResponse.json({ success: true, asset })
  } catch (error: any) {
    logger.error("Update asset error", error, {
      endpoint: "/api/admin/assets",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          admin: {
            action: 'updateAsset'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}