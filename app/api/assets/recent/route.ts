import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"

export async function GET(request: NextRequest) {
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  if (!security.checkRateLimit(`recent_${clientIP}`, 200, 60000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const supabase = getSupabaseAdminClient()

    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(4)

    if (error) throw error

    const rows = (assets || []) as any[]
    const authorIds = Array.from(new Set(rows.map((a) => a.author_id).filter(Boolean)))

    const { data: authors, error: authorsError } = authorIds.length
      ? await supabase
          .from("users")
          .select("discord_id, username, avatar, membership, is_banned")
          .in("discord_id", authorIds)
      : { data: [], error: null }

    if (authorsError) throw authorsError

    const authorsByDiscordId = new Map<string, any>()
    for (const a of authors || []) authorsByDiscordId.set(a.discord_id, a)

    const formatted = rows
      .map((asset) => {
        const author = asset.author_id ? authorsByDiscordId.get(asset.author_id) : null
        if (author?.is_banned) return null

        const computedRating = Math.min(5.0, 3.5 + ((asset.downloads || 0) / 100) * 0.5)

        return {
          id: asset.id,
          title: asset.title,
          description: asset.description,
          category: asset.category,
          framework: asset.framework,
          version: asset.version,
          price: asset.coin_price === 0 ? "free" : "premium",
          coinPrice: asset.coin_price,
          image: asset.thumbnail,
          thumbnail: asset.thumbnail,
          downloads: asset.downloads,
          views: asset.views,
          tags: asset.tags || [],
          author: author?.username || "Unknown",
          authorId: asset.author_id,
          authorData: author
            ? {
                username: author.username,
                avatar: author.avatar,
                membership: author.membership,
              }
            : { username: "Unknown", avatar: null },
          rating: Math.round(computedRating * 10) / 10,
          isVerified: asset.is_verified || asset.virus_scan_status === "clean",
          isFeatured: asset.is_featured || (asset.downloads || 0) > 1000,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ items: formatted })
  } catch (error) {
    console.error("Recent API error:", error)
    return NextResponse.json({ items: [] })
  }
}
