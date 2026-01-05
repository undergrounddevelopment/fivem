import { createAdminClient } from "@/lib/supabase/server"

export async function broadcastEvent(channelName: string, event: string, payload: any) {
  const supabase = createAdminClient()
  const channel = supabase.channel(channelName)

  return await new Promise<{ ok: boolean; error?: string }>((resolve) => {
    const timeout = setTimeout(() => {
      try {
        supabase.removeChannel(channel)
      } catch {
        // ignore
      }
      resolve({ ok: false, error: "Broadcast subscribe timeout" })
    }, 3000)

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout)
        try {
          await channel.send({
            type: "broadcast",
            event,
            payload,
          })
          resolve({ ok: true })
        } catch (e) {
          resolve({ ok: false, error: String(e) })
        } finally {
          try {
            supabase.removeChannel(channel)
          } catch {
            // ignore
          }
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        clearTimeout(timeout)
        try {
          supabase.removeChannel(channel)
        } catch {
          // ignore
        }
        resolve({ ok: false, error: `Broadcast channel status: ${status}` })
      }
    })
  })
}
