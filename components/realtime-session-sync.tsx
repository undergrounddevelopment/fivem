"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function RealtimeSessionSync() {
  const { data: session, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.id) return

    const supabase = createClient()
    const channel = supabase
      .channel('realtime-user-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `discord_id=eq.${session.user.id}`
        },
        async (payload) => {
          console.log('[RealtimeSync] User data changed in DB, syncing session...', payload)
          
          // Force session update
          await update()
          
          // Optional: Force router refresh to update server components
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, update, router])

  return null
}
