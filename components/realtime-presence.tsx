"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

export function RealtimePresence() {
  const { user } = useAuth()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user?.id || 'guest-' + Math.random().toString(36).substring(7),
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('[Presence] Synced state:', state)
        // You could update a global store here if needed
      })
      .on('presence', { event: 'join', filter: { event: 'join' } }, ({ key, newPresences }) => {
        console.log('[Presence] User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave', filter: { event: 'leave' } }, ({ key, leftPresences }) => {
        console.log('[Presence] User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presenceTrack = {
            user_id: user?.id || null,
            username: user?.username || 'Guest',
            avatar: user?.avatar || null,
            online_at: new Date().toISOString(),
          }
          await channel.track(presenceTrack)
        }
      })

    channelRef.current = channel

    // Periodic heartbeat to update 'last_seen' in database
    const heartbeat = setInterval(async () => {
      if (user?.id) {
         // We can use an API call or Supabase directly
         // Using Supabase directly is faster for heartbeat
         await supabase
           .from('users')
           .update({ last_seen: new Date().toISOString() })
           .eq('id', user.id)
      }
    }, 60000) // Every minute

    return () => {
      clearInterval(heartbeat)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user?.id, user?.username, user?.avatar])

  return null // This component doesn't render anything
}
