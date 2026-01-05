import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

function sseFormat(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

async function getLiveStats() {
  const supabase = createAdminClient()

  const now = Date.now()
  const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString()
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString()
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()

  const [onlineResult, downloadsResult, uploadsResult, threadsResult, repliesResult] = await Promise.all([
    supabase.from("users").select("discord_id", { count: "exact", head: true }).gte("last_seen", fiveMinutesAgo),
    supabase.from("downloads").select("id", { count: "exact", head: true }).gte("created_at", fiveMinutesAgo),
    supabase.from("assets").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
    supabase.from("forum_threads").select("id", { count: "exact", head: true }).gte("created_at", hourAgo).eq("is_deleted", false),
    supabase.from("forum_replies").select("id", { count: "exact", head: true }).gte("created_at", hourAgo).eq("is_deleted", false),
  ])

  return {
    online_users: onlineResult.count || 0,
    active_downloads: downloadsResult.count || 0,
    recent_uploads: uploadsResult.count || 0,
    forum_activity: (threadsResult.count || 0) + (repliesResult.count || 0),
    total_revenue: 0,
    server_load: 0,
  }
}

export async function GET() {
  const encoder = new TextEncoder()

  let closed = false
  let statsInterval: ReturnType<typeof setInterval> | undefined
  let keepAlive: ReturnType<typeof setInterval> | undefined

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        if (closed) return
        controller.enqueue(encoder.encode(sseFormat(payload)))
      }

      // Initial hello + first stats snapshot
      send({ type: "system_event", payload: { message: "SSE connected" } })
      try {
        const stats = await getLiveStats()
        send({ type: "stats_update", payload: stats })
      } catch (error) {
        // keep stream alive even if stats fails
      }

      statsInterval = setInterval(async () => {
        try {
          const stats = await getLiveStats()
          send({ type: "stats_update", payload: stats })
        } catch {
          // ignore
        }
      }, 15000)

      keepAlive = setInterval(() => {
        if (closed) return
        controller.enqueue(encoder.encode(`: keep-alive\n\n`))
      }, 25000)
    },
    cancel() {
      closed = true
      if (statsInterval) clearInterval(statsInterval)
      if (keepAlive) clearInterval(keepAlive)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
