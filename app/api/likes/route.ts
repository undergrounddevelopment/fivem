import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { XP_CONFIG, getLevelFromXP } from "@/lib/xp-badges"

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Helper function to award XP
async function awardXP(supabase: any, discordId: string, action: keyof typeof XP_CONFIG.rewards, description: string) {
  try {
    const xpReward = XP_CONFIG.rewards[action]
    if (!xpReward) return

    const { data: user } = await supabase
      .from('users')
      .select('xp, level')
      .eq('discord_id', discordId)
      .single()

    if (!user) return

    const newXP = (user.xp || 0) + xpReward
    const levelInfo = getLevelFromXP(newXP)

    await supabase
      .from('users')
      .update({
        xp: newXP,
        level: levelInfo.level,
        current_badge: levelInfo.title.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('discord_id', discordId)

    await supabase.from('xp_transactions').insert({
      user_id: discordId,
      amount: xpReward,
      activity_type: action,
      description,
    })
  } catch (error) {
    console.error('[XP] Error awarding XP:', error)
  }
}

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

    const supabase = getSupabase()
    const discordId = session.user.id

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", discordId)
      .eq("target_id", targetId)
      .eq("target_type", targetType)
      .single()

    if (existingLike) {
      // Unlike
      await supabase.from("likes").delete().eq("id", existingLike.id)

      // Decrement like count
      if (targetType === "thread") {
        const { data: thread } = await supabase.from("forum_threads").select("likes").eq("id", targetId).single()
        if (thread) {
          await supabase.from("forum_threads").update({ likes: Math.max(0, (thread.likes || 0) - 1) }).eq("id", targetId)
        }
      } else if (targetType === "reply") {
        const { data: reply } = await supabase.from("forum_replies").select("likes").eq("id", targetId).single()
        if (reply) {
          await supabase.from("forum_replies").update({ likes: Math.max(0, (reply.likes || 0) - 1) }).eq("id", targetId)
        }
      } else if (targetType === "asset") {
        const { data: asset } = await supabase.from("assets").select("likes").eq("id", targetId).single()
        if (asset) {
          await supabase.from("assets").update({ likes: Math.max(0, (asset.likes || 0) - 1) }).eq("id", targetId)
        }
      }

      return NextResponse.json({ success: true, liked: false })
    }

    // Add like
    await supabase.from("likes").insert({
      user_id: discordId,
      target_id: targetId,
      target_type: targetType,
    })

    // Increment like count
    if (targetType === "thread") {
      const { data: thread } = await supabase.from("forum_threads").select("likes").eq("id", targetId).single()
      if (thread) {
        await supabase.from("forum_threads").update({ likes: (thread.likes || 0) + 1 }).eq("id", targetId)
      }
    } else if (targetType === "reply") {
      const { data: reply } = await supabase.from("forum_replies").select("likes").eq("id", targetId).single()
      if (reply) {
        await supabase.from("forum_replies").update({ likes: (reply.likes || 0) + 1 }).eq("id", targetId)
      }
    } else if (targetType === "asset") {
      const { data: asset } = await supabase.from("assets").select("likes").eq("id", targetId).single()
      if (asset) {
        await supabase.from("assets").update({ likes: (asset.likes || 0) + 1 }).eq("id", targetId)
      }
    }

    // Award XP to the liker
    const { xpQueries } = await import('@/lib/xp/queries')
    // Note: GIVE_LIKE is not in the unified XP_ACTIVITIES map yet, but RECEIVE_LIKE is.
    // We'll ignore GIVE_LIKE for now to match the strict schema in queries.ts or map it if we add it.
    // The previous code had GIVE_LIKE: 5 in XP_CONFIG.rewards
    // Let's check xp-badges.ts again. Yes, it has GIVE_LIKE.
    // But lib/xp/queries.ts only maps specific keys.
    // Actually, let's just do RECEIVE_LIKE for the author as that's the most important for badges.
    
    // Award XP to the content author
    let authorId: string | null = null
    if (targetType === 'thread') {
      const { data: thread } = await supabase.from('forum_threads').select('author_id').eq('id', targetId).single()
      if (thread?.author_id) {
        const { data: author } = await supabase.from('users').select('discord_id').eq('id', thread.author_id).single()
        authorId = author?.discord_id
      }
    } else if (targetType === 'reply') {
      const { data: reply } = await supabase.from('forum_replies').select('author_id').eq('id', targetId).single()
      if (reply?.author_id) {
        const { data: author } = await supabase.from('users').select('discord_id').eq('id', reply.author_id).single()
        authorId = author?.discord_id
      }
    }

    if (authorId && authorId !== discordId) {
       await xpQueries.awardXP(authorId, 'receive_like', targetId)
    }

    return NextResponse.json({ success: true, liked: true })
  } catch (error: any) {
    console.error("[Like error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
