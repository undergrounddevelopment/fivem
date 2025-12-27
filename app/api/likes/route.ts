import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetId, targetType } = await request.json()

    if (!targetId || !targetType) {
      return NextResponse.json({ error: "Missing targetId or targetType" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("target_id", targetId)
      .eq("target_type", targetType)
      .single()

    if (existingLike) {
      // Unlike
      await supabase.from("likes").delete().eq("id", existingLike.id)

      // Decrement like count
      if (targetType === "asset") {
        const { data: asset } = await supabase.from("assets").select("downloads").eq("id", targetId).single()
        // Note: assets don't have a likes column in our schema, skip
      } else if (targetType === "thread") {
        const { data: thread } = await supabase.from("forum_threads").select("likes").eq("id", targetId).single()
        if (thread) {
          await supabase
            .from("forum_threads")
            .update({ likes: Math.max(0, thread.likes - 1) })
            .eq("id", targetId)
        }
      } else if (targetType === "reply") {
        const { data: reply } = await supabase.from("forum_replies").select("likes").eq("id", targetId).single()
        if (reply) {
          await supabase
            .from("forum_replies")
            .update({ likes: Math.max(0, reply.likes - 1) })
            .eq("id", targetId)
        }
      }

      return NextResponse.json({ success: true, liked: false })
    }

    // Add like
    await supabase.from("likes").insert({
      user_id: session.user.id,
      target_id: targetId,
      target_type: targetType,
    })

    // Increment like count
    if (targetType === "thread") {
      const { data: thread } = await supabase.from("forum_threads").select("likes").eq("id", targetId).single()
      if (thread) {
        await supabase
          .from("forum_threads")
          .update({ likes: thread.likes + 1 })
          .eq("id", targetId)
      }
    } else if (targetType === "reply") {
      const { data: reply } = await supabase.from("forum_replies").select("likes").eq("id", targetId).single()
      if (reply) {
        await supabase
          .from("forum_replies")
          .update({ likes: reply.likes + 1 })
          .eq("id", targetId)
      }
    }

    // Log activity
    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "like",
      action: `liked a ${targetType}`,
      target_id: targetId,
    })

    return NextResponse.json({ success: true, liked: true })
  } catch (error: any) {
    logger.error("Like error", error, {
      endpoint: "/api/likes",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
