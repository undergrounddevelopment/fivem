import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { notifyAssetUpload } from "@/lib/discord-webhook"

// Initialize Supabase client - 100% Supabase only
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [Upload Asset] Starting upload process")
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log("❌ [Upload Asset] No session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ [Upload Asset] User authenticated:", session.user.id)

    const body = await request.json()
    console.log("📥 [Upload Asset] Received data:", body)
    
    const {
      title,
      description,
      features,
      installation,
      category,
      framework,
      coinPrice = 0,
      fileUrl,
      thumbnailUrl,
      version,
      youtubeLink,
    } = body

    // Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 })
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

    console.log("✅ [Upload Asset] Validation passed")

    const supabase = getSupabaseClient()

    // Get user from database using multiple lookup methods
    console.log("🔍 [Upload Asset] Looking up user:", session.user.id)
    
    // Try multiple lookup methods to find the user
    let user = null
    let userError = null
    
    // Method 1: Look up by discord_id
    const { data: userByDiscordId, error: discordIdError } = await supabase
      .from("users")
      .select("id, membership, username, avatar, coins, discord_id")
      .eq("discord_id", session.user.id)
      .single()
    
    if (userByDiscordId && !discordIdError) {
      user = userByDiscordId
      console.log("✅ [Upload Asset] User found by discord_id:", user.id)
    } else {
      console.log("⚠️ [Upload Asset] User not found by discord_id, trying by id...")
      
      // Method 2: Look up by id field
      const { data: userById, error: idError } = await supabase
        .from("users")
        .select("id, membership, username, avatar, coins, discord_id")
        .eq("id", session.user.id)
        .single()
      
      if (userById && !idError) {
        user = userById
        console.log("✅ [Upload Asset] User found by id:", user.id)
      } else {
        console.log("⚠️ [Upload Asset] User not found by id, creating new user...")
        
        // Method 3: Create new user if not found
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            discord_id: session.user.id,
            username: session.user.name || "Unknown User",
            email: session.user.email,
            avatar: session.user.image,
            coins: 1000, // Starting coins
            xp: 0,
            level: 1,
            is_admin: session.user.id === process.env.ADMIN_DISCORD_ID,
            membership: session.user.id === process.env.ADMIN_DISCORD_ID ? "admin" : "free",
            role: session.user.id === process.env.ADMIN_DISCORD_ID ? "admin" : "member",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select("id, membership, username, avatar, coins, discord_id")
          .single()
        
        if (newUser && !createError) {
          user = newUser
          console.log("✅ [Upload Asset] New user created:", user.id)
        } else {
          userError = createError
          console.error("❌ [Upload Asset] Failed to create user:", createError)
        }
      }
    }

    if (!user) {
      console.error("❌ [Upload Asset] User lookup/creation failed:", userError)
      
      // Try to send webhook anyway with session data
      try {
        await logActivity(
          "User Lookup Failed",
          `Failed to find/create user with Discord ID: ${session.user.id}`,
          session.user.id,
          { error: userError?.message || "Unknown error" }
        )
      } catch (webhookError) {
        console.error("Failed to send error webhook:", webhookError)
      }
      
      return NextResponse.json({ 
        error: "User registration failed. Please try logging out and back in." 
      }, { status: 404 })
    }

    console.log("✅ [Upload Asset] User found:", user.id)

    // Prepare data
    const assetStatus = user?.membership === "vip" || user?.membership === "admin" ? "approved" : "pending"
    const safeThumbnail = thumbnailUrl || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(title)}`
    const safeCoinPrice = Math.max(0, Math.min(10000, Number(coinPrice) || 0))

    // Determine notification priority based on asset characteristics
    let notificationPriority: 'low' | 'normal' | 'high' = 'normal'
    
    if (user.membership === 'admin' || user.membership === 'vip') {
      notificationPriority = 'high' // VIP/Admin uploads get high priority
    }
    if (safeCoinPrice === 0) {
      notificationPriority = 'normal' // Free assets get normal priority
    }
    if (safeCoinPrice > 100) {
      notificationPriority = 'high' // Expensive assets get high priority
    }
    if (category === 'scripts' && framework === 'qbcore') {
      notificationPriority = 'high' // Popular combination gets high priority
    }

    const assetData = {
      title: title.trim(),
      description: description.trim(),
      features: features?.trim() || null,
      installation: installation?.trim() || null,
      category,
      framework: framework || "standalone",
      coin_price: safeCoinPrice,
      download_link: fileUrl,
      thumbnail: safeThumbnail,
      author_id: user.id,
      version: version || "1.0.0",
      status: assetStatus,
      virus_scan_status: "pending",
      youtube_link: youtubeLink || null,
      rating: 5.0,
      rating_count: 0,
      downloads: 0,
      is_verified: false,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log("📤 [Upload Asset] Inserting asset:", assetData)

    // Insert asset using Supabase client only
    const { data: asset, error: insertError } = await supabase
      .from("assets")
      .insert(assetData)
      .select("*")
      .single()

    if (insertError || !asset) {
      console.error("❌ [Upload Asset] Insert failed:", insertError)
      
      // Log error to Discord
      await logActivity(
        "Asset Insert Failed",
        `Failed to insert asset: ${title}`,
        session.user.id,
        { 
          error: insertError?.message,
          title,
          category,
          framework
        }
      )
      
      return NextResponse.json({ 
        error: "Failed to save asset: " + (insertError?.message || "Unknown error") 
      }, { status: 500 })
    }

    console.log("✅ [Upload Asset] Asset created:", asset.id)

    // Log activity using Supabase client only
    try {
      await supabase.from("activities").insert({
        user_id: session.user.id,
        type: "upload",
        action: `uploaded ${title}`,
        target_id: asset.id,
        created_at: new Date().toISOString()
      })
    } catch (activityError) {
      console.error("⚠️ [Upload Asset] Activity log failed:", activityError)
      // Don't fail the upload for this
    }

    // 🎉 SEND SINGLE DISCORD NOTIFICATION ONLY
    try {
      console.log("📢 [Upload Asset] Sending Discord notification...")
      
      // Prepare user data for webhook
      const webhookUser = {
        id: user.id,
        username: user.username || session.user.name,
        name: session.user.name,
        avatar: user.avatar || session.user.image,
        membership: user.membership,
        coins: user.coins
      }
      
      // Send ONLY ONE notification
      const notificationSent = await notifyAssetUpload(asset, webhookUser)
      
      if (notificationSent) {
        console.log("✅ [Upload Asset] Discord notification sent successfully")
      } else {
        console.log("⚠️ [Upload Asset] Discord notification failed")
      }
      
      console.log("✅ [Upload Asset] Notification process completed")
      
    } catch (webhookError) {
      console.error("⚠️ [Upload Asset] Discord webhook failed:", webhookError)
      // Don't fail the upload for webhook errors
    }

    console.log("🎉 [Upload Asset] Upload completed successfully")

    return NextResponse.json({
      success: true,
      asset,
      message: assetStatus === "approved" ? "Asset uploaded and published!" : "Asset uploaded and pending approval",
      notification: {
        status: "sent",
        mentions: "everyone, here"
      }
    })
  } catch (error: any) {
    console.error("❌ [Upload Asset] Unexpected error:", error)
    
    // Log critical error to Discord
    try {
      await logActivity(
        "Critical Upload Error",
        `Unexpected error during asset upload: ${error.message}`,
        undefined,
        {
          "Error": error.message,
          "Stack": error.stack?.substring(0, 500)
        }
      )
    } catch (webhookError) {
      console.error("Failed to send error webhook:", webhookError)
    }
    
    return NextResponse.json({ 
      error: "Upload failed: " + (error.message || "Unknown error") 
    }, { status: 500 })
  }
}