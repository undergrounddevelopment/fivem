"use client"

import { useState, useEffect } from "react"
import { X, Bell, Sparkles, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PublicNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "alert" | "new_asset"
  link?: string
  asset_id?: string
  created_at: string
}

export function PublicNotifications() {
  const [notifications, setNotifications] = useState<PublicNotification[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]")
    setDismissedIds(dismissed)
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/public")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissNotification = (id: string) => {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    localStorage.setItem("dismissedNotifications", JSON.stringify(newDismissed))
  }

  const visibleNotifications = notifications.filter((n) => !dismissedIds.includes(n.id))

  if (isLoading || visibleNotifications.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "new_asset":
        return <Sparkles className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "alert":
        return <Bell className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case "new_asset":
        return "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-100"
      case "success":
        return "bg-green-500/20 border-green-500/50 text-green-100"
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-100"
      case "alert":
        return "bg-red-500/20 border-red-500/50 text-red-100"
      default:
        return "bg-blue-500/20 border-blue-500/50 text-blue-100"
    }
  }

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {visibleNotifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "rounded-xl border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300",
            getStyles(notification.type),
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{notification.title}</p>
              <p className="text-xs opacity-80 mt-1 line-clamp-2">{notification.message}</p>
              {notification.link && (
                <Link href={notification.link} className="text-xs underline mt-2 inline-block hover:opacity-80">
                  View Details
                </Link>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-white/10"
              onClick={() => dismissNotification(notification.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
