import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { logErrorToHTML } from "@/lib/error-logger"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: asset } = await supabase.from("assets").select("*").eq("id", id).single()

    if (!asset) {
      logErrorToHTML(new Error("Asset not found"), `Download API - Asset: ${id}`)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureMessage('Asset not found', {
          contexts: {
            download: {
              assetId: id,
              userId: session.user.id,
              action: 'checkAsset'
            }
          }
        });
      });
      
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    if (!asset.download_link) {
      logErrorToHTML(new Error("No download_link"), `Download API - Asset: ${id}`)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureMessage('Download link not available', {
          contexts: {
            download: {
              assetId: id,
              userId: session.user.id,
              action: 'checkDownloadLink'
            }
          }
        });
      });
      
      return NextResponse.json({ error: "Download link not available" }, { status: 400 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("discord_id", session.user.id)
      .single()

    if (!user) {
      logErrorToHTML(new Error("User not found"), `Download API - User: ${session.user.id}`)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureMessage('User not found', {
          contexts: {
            download: {
              assetId: id,
              userId: session.user.id,
              action: 'checkUser'
            }
          }
        });
      });
      
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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
        coinsSpent: 0,
      })
    }

    if (asset.coin_price > 0 && user.coins < asset.coin_price) {
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureMessage('Insufficient coins for purchase', {
          contexts: {
            download: {
              assetId: id,
              userId: session.user.id,
              action: 'checkCoins',
              requiredCoins: asset.coin_price,
              availableCoins: user.coins
            }
          }
        });
      });
      
      return NextResponse.json(
        { error: `Need ${asset.coin_price} coins, you have ${user.coins}` },
        { status: 400 },
      )
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

    return NextResponse.json({
      success: true,
      downloadUrl: asset.download_link,
      coinsSpent: asset.coin_price,
    })
  } catch (error: any) {
    logger.error("Download error", error, { assetId: id })
    logErrorToHTML(error, `Download API - Error: ${id}`)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          download: {
            assetId: id,
            action: 'processDownload'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}