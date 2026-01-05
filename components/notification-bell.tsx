"use client"

import { useState } from 'react'
import { Bell, MessageSquare, Heart, Download, Trophy, Gift, UserPlus, Star, Check, CheckCheck } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) return { notifications: [] }
  return res.json()
}

function getTimeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return past.toLocaleDateString()
}

function NotificationItem({ notification, onRead }: { notification: any; onRead: (id: string) => void }) {
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'reply':
      case 'mention':
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          color: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20'
        }
      case 'like':
        return {
          icon: <Heart className="h-4 w-4" />,
          color: 'from-pink-500 to-rose-500',
          bg: 'bg-pink-500/10',
          border: 'border-pink-500/20'
        }
      case 'download':
        return {
          icon: <Download className="h-4 w-4" />,
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20'
        }
      case 'achievement':
      case 'badge':
        return {
          icon: <Trophy className="h-4 w-4" />,
          color: 'from-amber-500 to-yellow-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20'
        }
      case 'reward':
      case 'coins':
        return {
          icon: <Gift className="h-4 w-4" />,
          color: 'from-purple-500 to-violet-500',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20'
        }
      case 'follow':
        return {
          icon: <UserPlus className="h-4 w-4" />,
          color: 'from-indigo-500 to-blue-500',
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/20'
        }
      default:
        return {
          icon: <Bell className="h-4 w-4" />,
          color: 'from-gray-500 to-slate-500',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20'
        }
    }
  }

  const style = getNotificationStyle()

  return (
    <Link href={notification.link || '#'} onClick={() => onRead(notification.id)}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "group relative p-3 rounded-xl transition-all duration-200 cursor-pointer border",
          notification.is_read 
            ? "bg-transparent hover:bg-white/5 border-transparent" 
            : cn(style.bg, style.border, "hover:bg-white/10")
        )}
      >
        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
            style.color
          )}>
            {style.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm leading-snug",
              notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"
            )}>
              {notification.title || 'New notification'}
            </p>
            {notification.message && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {notification.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {getTimeAgo(notification.created_at)}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useSWR('/api/notifications', fetcher, { refreshInterval: 30000 })

  const handleMarkAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    })
    mutate('/api/notifications')
  }

  const handleMarkAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    mutate('/api/notifications')
  }

  const notifications = data?.notifications || []
  const unreadCount = notifications.filter((n: any) => !n.is_read).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-xl hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[360px] p-0 rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-1">
            {notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onRead={handleMarkAsRead} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-white/10">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" className="w-full h-9 text-sm hover:bg-white/5">
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
