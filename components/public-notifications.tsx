"use client"

import { useState, useEffect } from "react"
import { X, Bell, Sparkles, AlertTriangle, Info, CheckCircle, ExternalLink, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

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
  // Temporarily disabled - API not available
  const [notifications, setNotifications] = useState<PublicNotification[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]")
    setDismissedIds(dismissed)
    fetchNotifications()

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    if (supabase) {
      try {
        channel = supabase
          .channel("public-notifications")
          .on("postgres_changes", { event: "*", schema: "public", table: "public_notifications" }, () => {
            fetchNotifications()
          })
          .subscribe()
      } catch (error) {
        console.error("Failed to subscribe to public notifications:", error)
      }
    }

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => {
      if (channel && supabase) supabase.removeChannel(channel)
      clearInterval(interval)
    }
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

  // Prevent hydration mismatch - only render on client
  if (!isMounted || isLoading || visibleNotifications.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "new_asset":
        return <Sparkles className="h-5 w-5" />
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "alert":
        return <Bell className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case "new_asset":
        return {
          container: "bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30 border-cyan-400/60 shadow-cyan-500/20",
          icon: "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30",
          text: "text-cyan-50",
          subtext: "text-cyan-200/80",
          button: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
        }
      case "success":
        return {
          container: "bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-teal-500/30 border-green-400/60 shadow-green-500/20",
          icon: "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30",
          text: "text-green-50",
          subtext: "text-green-200/80",
          button: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white"
        }
      case "warning":
        return {
          container: "bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-yellow-500/30 border-amber-400/60 shadow-amber-500/20",
          icon: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30",
          text: "text-amber-50",
          subtext: "text-amber-200/80",
          button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
        }
      case "alert":
        return {
          container: "bg-gradient-to-br from-red-500/30 via-rose-500/20 to-pink-500/30 border-red-400/60 shadow-red-500/20",
          icon: "bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/30",
          text: "text-red-50",
          subtext: "text-red-200/80",
          button: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white"
        }
      default:
        return {
          container: "bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-violet-500/30 border-blue-400/60 shadow-blue-500/20",
          icon: "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30",
          text: "text-blue-50",
          subtext: "text-blue-200/80",
          button: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white"
        }
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-[380px] max-w-[calc(100vw-2rem)]">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.slice(0, 3).map((notification, index) => {
          const styles = getStyles(notification.type)
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30,
                delay: index * 0.1 
              }}
              className={cn(
                "relative rounded-2xl border-2 p-4 backdrop-blur-xl shadow-2xl overflow-hidden",
                styles.container
              )}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl animate-pulse" />
              </div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              </div>

              <div className="relative flex items-start gap-4">
                {/* Icon with glow */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className={cn(
                    "flex-shrink-0 p-2.5 rounded-xl",
                    styles.icon
                  )}
                >
                  {getIcon(notification.type)}
                </motion.div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Title with badge */}
                  <div className="flex items-center gap-2">
                    <p className={cn("font-bold text-base", styles.text)}>
                      {notification.title}
                    </p>
                    {notification.type === "new_asset" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                        <Zap className="h-3 w-3" />
                        New
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <p className={cn("text-sm leading-relaxed", styles.subtext)}>
                    {notification.message}
                  </p>

                  {/* Action button */}
                  {notification.link && (
                    <Link href={notification.link}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                          styles.button
                        )}
                      >
                        View Details
                        <ExternalLink className="h-4 w-4" />
                      </motion.button>
                    </Link>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => dismissNotification(notification.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4 text-white/80" />
                </motion.button>
              </div>

              {/* Progress bar for auto-dismiss (visual only) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="h-full bg-white/30"
                />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
