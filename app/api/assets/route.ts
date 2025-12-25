import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const framework = searchParams.get("framework")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    const supabase = await getSupabaseAdminClient()

    let query = supabase
      .from("assets")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (framework && framework !== "all") {
      query = query.eq("framework", framework)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: assets, count, error } = await query

    if (error) throw error

    // Fetch authors in bulk
    const authorIds = [...new Set((assets || []).map((a) => a.author_id).filter(Boolean))]
    let authorsMap: Record<string, any> = {}
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from("users")
        .select("discord_id, username, avatar, membership")
        .in("discord_id", authorIds)
      authorsMap = (authors || []).reduce(
        (acc, a) => {
          acc[a.discord_id] = a
          return acc
        },
        {} as Record<string, any>,
      )
    }

    const formattedAssets = (assets || []).map((asset) => ({
      ...asset,
      price: asset.coin_price === 0 ? "free" : "premium",
      coinPrice: asset.coin_price,
      author: authorsMap[asset.author_id]?.username || "Unknown",
      authorData: authorsMap[asset.author_id] || null,
      authorId: asset.author_id,
      rating: 5.0,
      isVerified: asset.is_verified || true,
      isFeatured: asset.is_featured || asset.downloads > 10000,
      image: asset.thumbnail,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }))

    return NextResponse.json({
      items: formattedAssets,
      assets: formattedAssets,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    logger.error("Assets API error", error, {
      endpoint: "/api/assets",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error", items: [], assets: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const supabase = await getSupabaseAdminClient()

    const { data: asset, error } = await supabase
      .from("assets")
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        framework: data.framework || "standalone",
        version: data.version || "1.0.0",
        coin_price: data.coinPrice || 0,
        thumbnail: data.thumbnail || data.image,
        download_link: data.downloadLink,
        file_size: data.fileSize,
        tags: data.tags || [],
        author_id: session.user.id,
        status: "pending",
      })
      .select("*")
      .single()

    if (error) throw error

    // Fetch author separately
    const { data: author } = await supabase
      .from("users")
      .select("username, avatar, membership")
      .eq("discord_id", session.user.id)
      .single()

    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "upload",
      action: `uploaded ${asset.title}`,
      target_id: asset.id,
    })

    return NextResponse.json({ ...asset, author }, { status: 201 })
  } catch (error: any) {
    logger.error("Create asset error", error, {
      endpoint: "/api/assets",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
