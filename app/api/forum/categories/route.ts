import { type NextRequest, NextResponse } from "next/server"
import { FORUM_CATEGORIES } from "@/lib/constants"
import { security } from "@/lib/security"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    if (!security.checkRateLimit(`forum_categories_${clientIP}`, 200, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const supabase = getSupabaseAdminClient()

    // First try to get from database
    const { data: dbCategories, error } = await supabase
      .from("forum_categories")
      .select("*")
      .order("sort_order", { ascending: true })

    if (dbCategories && dbCategories.length > 0) {
      // Get thread counts for each category - only count approved threads
      const categoriesWithCounts = await Promise.all(
        dbCategories.map(async (category) => {
          const { count: threadCount } = await supabase
            .from("forum_threads")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("is_deleted", false)
            .eq("status", "approved")

          const { count: replyCount } = await supabase
            .from("forum_replies")
            .select("*, thread:forum_threads!inner(*)", { count: "exact", head: true })
            .eq("forum_threads.category_id", category.id)
            .eq("forum_threads.status", "approved")

          return {
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            threadCount: threadCount || 0,
            postCount: (threadCount || 0) + (replyCount || 0),
          }
        }),
      )

      return NextResponse.json(categoriesWithCounts)
    }

    // Fallback to constants if no database categories
    return NextResponse.json(FORUM_CATEGORIES)
  } catch (error: any) {
    logger.error("Forum categories error", error, {
      endpoint: "/api/forum/categories",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json(FORUM_CATEGORIES)
  }
}
