"use client"

import { useState, useEffect } from "react"
import { Bell, MessageCircle, Heart, Info, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Notification {
  id: string
  userId: string
  type: "reply" | "like" | "system" | "mention" | "download"
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

const iconMap = {
  reply: MessageCircle,
  like: Heart,
  system: Info,
  mention: MessageCircle,
  download: Download,
}

export function NotificationDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          setNotifications(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Supabase Realtime for Notifications
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    if (!supabase) return

    const currentUserId = user.discordId || user.id

    const channel = supabase
      .channel(`user_notifications_${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log("[Notifications] Realtime update:", payload)
          
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as any
            setNotifications(prev => [{
              id: newNotif.id,
              userId: newNotif.user_id,
              type: newNotif.type,
              title: newNotif.title,
              message: newNotif.message,
              link: newNotif.link,
              read: newNotif.read,
              createdAt: newNotif.created_at
            }, ...prev])

            toast.info(newNotif.title, {
              description: newNotif.message,
              action: newNotif.link ? {
                label: "View",
                onClick: () => window.location.href = newNotif.link
              } : undefined
            })
            
            // Play sound? (Optional)
            const audio = new Audio("/notification.mp3")
            audio.volume = 0.2
            audio.play().catch(() => {})
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new as any
            setNotifications(prev => prev.map(n => 
              n.id === updatedNotif.id ? { ...n, read: updatedNotif.read } : n
            ))
          } else if (payload.eventType === 'DELETE') {
             setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])
  
  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "POST" })
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  if (!user) {
    return (
      <Button variant="ghost" size="icon" className="relative text-[var(--textDim)] hover:text-[var(--text)]">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-[var(--textDim)] hover:text-[var(--text)]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white" style={{ background: 'var(--primary)' }}>
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 border" style={{ background: 'rgba(0, 0, 0, 0.95)', borderColor: 'var(--primary)' }}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--primary)' }}>
          <h3 className="font-semibold text-[var(--text)]">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-[var(--primary)]" onClick={markAllRead}>
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-[var(--textDim)]">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = iconMap[notification.type] || Info
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer",
                    !notification.read && "" 
                  )}
                  style={!notification.read ? { background: 'rgba(236, 72, 153, 0.05)' } : {}}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: 'rgba(236, 72, 153, 0.2)', color: 'var(--primary)' }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">{notification.title}</p>
                    <p className="text-xs text-[var(--textDim)]">{notification.message}</p>
                    <p className="mt-1 text-xs text-[var(--textDim)]">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full" style={{ background: 'var(--primary)' }} />}
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
