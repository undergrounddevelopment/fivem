import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { XP_CONFIG, getLevelFromXP } from "@/lib/xp-badges"
import { hasPgConnection, pgPool } from "@/lib/db/postgres"

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

    const supabase = getSupabaseAdminClient()

    // Prefer Akamai Postgres when available
    if (hasPgConnection && pgPool) {
      // likes.user_id uses discord_id (varchar)
      const userDiscordId = session.user.id
      if (!userDiscordId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const client = await pgPool.connect()
      try {
        await client.query('BEGIN')

        const existing = await client.query(
          'SELECT id FROM likes WHERE user_id = $1 AND target_id = $2 AND target_type = $3 LIMIT 1',
          [userDiscordId, targetId, targetType],
        )

        if (existing.rows?.[0]?.id) {
          await client.query('DELETE FROM likes WHERE id = $1', [existing.rows[0].id])

          if (targetType === 'asset') {
            await client.query('UPDATE assets SET likes = GREATEST(COALESCE(likes,0) - 1, 0) WHERE id = $1', [targetId])
          } else if (targetType === 'thread') {
            await client.query('UPDATE forum_threads SET likes = GREATEST(COALESCE(likes,0) - 1, 0) WHERE id = $1', [targetId])
          } else if (targetType === 'reply') {
            await client.query('UPDATE forum_replies SET likes = GREATEST(COALESCE(likes,0) - 1, 0) WHERE id = $1', [targetId])
          }

          await client.query('COMMIT')
          return NextResponse.json({ success: true, liked: false })
        }

        await client.query(
          'INSERT INTO likes (user_id, target_id, target_type) VALUES ($1,$2,$3)',
          [userDiscordId, targetId, targetType],
        )

        if (targetType === 'asset') {
          await client.query('UPDATE assets SET likes = COALESCE(likes,0) + 1 WHERE id = $1', [targetId])
        } else if (targetType === 'thread') {
          await client.query('UPDATE forum_threads SET likes = COALESCE(likes,0) + 1 WHERE id = $1', [targetId])
        } else if (targetType === 'reply') {
          await client.query('UPDATE forum_replies SET likes = COALESCE(likes,0) + 1 WHERE id = $1', [targetId])
        }

        await client.query('COMMIT')
        return NextResponse.json({ success: true, liked: true })
      } catch (e: any) {
        await client.query('ROLLBACK')
        logger.error('Like PG error', e)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      } finally {
        client.release()
      }
    }

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

    // Award XP to the liker
    await awardXP(supabase, session.user.id, 'GIVE_LIKE', `Gave a like on a ${targetType}`)

    // Award XP to the content author
    let authorId: string | null = null
    if (targetType === 'thread') {
      const { data: thread } = await supabase.from('forum_threads').select('author_id').eq('id', targetId).single()
      authorId = thread?.author_id
    } else if (targetType === 'reply') {
      const { data: reply } = await supabase.from('forum_replies').select('author_id').eq('id', targetId).single()
      authorId = reply?.author_id
    }

    if (authorId && authorId !== session.user.id) {
      await awardXP(supabase, authorId, 'RECEIVE_LIKE', `Received a like on ${targetType}`)
    }

    return NextResponse.json({ success: true, liked: true })
  } catch (error: any) {
    logger.error("Like error", error, {
      endpoint: "/api/likes",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
