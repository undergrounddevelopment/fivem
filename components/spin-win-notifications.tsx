'use client'

import { useEffect, useState } from 'react'
import { Trophy, X } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface WinNotification {
  id: string
  username: string
  prize_name: string
  coins_won: number
  avatar?: string
}

export function SpinWinNotifications() {
  const [notifications, setNotifications] = useState<WinNotification[]>([])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    
    // Guard against null supabase client
    if (!supabase) {
      console.warn("[SpinWinNotifications] Supabase client not available")
      return
    }

    // Subscribe to new spin wins
    const channel = supabase
      .channel('spin_wins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'spin_history',
        },
        async (payload) => {
          const spin = payload.new as any
          
          // Fetch user info
          const { data: user } = await supabase
            .from('users')
            .select('username, avatar')
            .eq('discord_id', spin.user_id)
            .single()

          if (user && spin.coins_won >= 100) { // Only show big wins
            const notification: WinNotification = {
              id: spin.id,
              username: user.username,
              prize_name: spin.prize_name,
              coins_won: spin.coins_won,
              avatar: user.avatar,
            }

            setNotifications(prev => [...prev, notification])

            // Auto remove after 5 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id))
            }, 5000)
          }
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="glass rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-lg animate-in slide-in-from-right shadow-lg"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-secondary/50 flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
            
            {notif.avatar && (
              <img
                src={notif.avatar}
                alt={notif.username}
                className="h-10 w-10 rounded-full"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-yellow-500">Big Win!</span>
              </div>
              <p className="text-sm text-foreground">
                <span className="font-semibold">{notif.username}</span> won{' '}
                <span className="font-bold text-yellow-500">+{notif.coins_won}</span> coins
              </p>
              <p className="text-xs text-muted-foreground">{notif.prize_name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
