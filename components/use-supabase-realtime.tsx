"use client"

import { createClient } from '@supabase/supabase-js'
import { useEffect } from 'react'
import { useAuth } from './auth-provider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useSupabaseRealtime() {
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    // Subscribe to user changes
    const channel = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `discord_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User updated:', payload)
          refreshUser()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, refreshUser])
}
