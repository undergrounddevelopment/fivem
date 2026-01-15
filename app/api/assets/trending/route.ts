import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"

export const revalidate = 600 // Cache for 10 minutes

export async function GET(request: NextRequest) {
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  if (!security.checkRateLimit(`trending_${clientIP}`, 200, 60000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const supabase = getSupabaseAdminClient()

    const { data: assets, error } = await supabase
      .from("assets")
      .select("*, author:users!assets_author_id_fkey(username, avatar, membership, xp, level, is_banned)")
      .in("status", ["active", "approved"])
      .order("downloads", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4)

    if (error) throw error

    const formatted = assets.map((asset: any) => {
        const author = asset.author

        // Skip if author is banned - strictly enforce
        if (author?.is_banned) return null

        const rating = Math.min(5.0, 3.5 + (asset.downloads / 100) * 0.5)
        
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
          tags: asset.tags,
          author: author?.username || "Unknown",
          authorAvatar: author?.avatar,
          authorData: {
            username: author?.username || "Unknown",
            avatar: author?.avatar || null,
            membership: author?.membership || "free",
            xp: author?.xp ?? 0,
            level: author?.level ?? 1,
          },
          rating: Math.round(rating * 10) / 10,
          isVerified: asset.is_verified || asset.virus_scan_status === "clean",
          isFeatured: asset.is_featured || asset.downloads > 1000,
          trending: true,
          createdAt: asset.created_at,
        }
    })
    return NextResponse.json(formatted.filter(Boolean))
  } catch (error) {
    console.error("Trending API error:", error)
    return NextResponse.json([])
  }
}
