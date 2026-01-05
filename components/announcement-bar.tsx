"use client"

import { useState, useEffect, useCallback } from "react"
import { X, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, ExternalLink, Megaphone, Gift } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Announcement {
  id: string
  title?: string
  message: string
  type: string
  is_active: boolean
  is_dismissible: boolean
  sort_order: number
  link?: string
  created_at: string
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState(false)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      const data = json.data || json || []
      setAnnouncements(Array.isArray(data) ? data : [])
      setError(false)
    } catch (err) {
      console.error("Failed to fetch announcements:", err)
      setAnnouncements([])
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchAnnouncements()
      const interval = setInterval(fetchAnnouncements, 60000)
      return () => clearInterval(interval)
    }
  }, [fetchAnnouncements, isMounted])

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [announcements.length])

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    // Save to localStorage for persistence
    const dismissedArray = Array.from(dismissed).concat(id)
    localStorage.setItem("dismissed_announcements", JSON.stringify(dismissedArray))
  }

  // Load dismissed state from localStorage and mark as mounted
  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem("dismissed_announcements")
      if (saved) {
        const parsed = JSON.parse(saved)
        setDismissed(new Set(parsed))
      }
    } catch (e) {
      console.error("Error loading dismissed announcements:", e)
    }
  }, [])

  const visibleAnnouncements = announcements.filter((a) => (a.is_dismissible ? !dismissed.has(a.id) : true))

  if (!isMounted || (isLoading && announcements.length === 0)) return null
  if (error || visibleAnnouncements.length === 0) return null

  const current = visibleAnnouncements[currentIndex % visibleAnnouncements.length]
  if (!current || !current.message) return null

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "from-emerald-600/95 via-green-600/95 to-teal-600/95",
          glow: "shadow-emerald-500/30",
          icon: CheckCircle,
          iconColor: "text-emerald-200",
          iconBg: "bg-emerald-500/30",
        }
      case "warning":
        return {
          bg: "from-amber-600/95 via-orange-600/95 to-yellow-600/95",
          glow: "shadow-amber-500/30",
          icon: AlertTriangle,
          iconColor: "text-amber-200",
          iconBg: "bg-amber-500/30",
        }
      case "error":
        return {
          bg: "from-red-600/95 via-rose-600/95 to-pink-600/95",
          glow: "shadow-red-500/30",
          icon: AlertTriangle,
          iconColor: "text-red-200",
          iconBg: "bg-red-500/30",
        }
      case "promo":
        return {
          bg: "from-fuchsia-600/95 via-purple-600/95 to-pink-600/95",
          glow: "shadow-fuchsia-500/30",
          icon: Gift,
          iconColor: "text-fuchsia-200",
          iconBg: "bg-fuchsia-500/30",
        }
      default:
        return {
          bg: "from-cyan-600/95 via-blue-600/95 to-indigo-600/95",
          glow: "shadow-cyan-500/30",
          icon: Megaphone,
          iconColor: "text-cyan-200",
          iconBg: "bg-cyan-500/30",
        }
    }
  }

  const typeStyles = getTypeStyles(current.type)
  const IconComponent = typeStyles.icon

  const Content = (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative w-full overflow-hidden glass border-primary/30"
    >
      {/* Blur orb effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blur-orb" style={{ top: '50%', left: '30%', opacity: 0.15, width: '200px', height: '200px' }} />
      </div>

      <div className="relative flex items-center justify-center gap-3 px-4 py-3 md:py-3.5">
        {/* Navigation arrows for multiple announcements */}
        {visibleAnnouncements.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length)
            }}
            className="absolute left-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="flex-shrink-0 p-2 rounded-xl bg-primary/20"
        >
          <IconComponent className="w-4 h-4 text-primary" aria-hidden="true" />
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-base font-medium text-center line-clamp-1 flex items-center gap-2"
        >
          {current.title && (
            <span className="font-bold bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wide">
              {current.title}
            </span>
          )}
          <span className="hidden sm:inline">{current.message || ''}</span>
          <span className="sm:hidden">{(current.message || '').slice(0, 50)}{(current.message || '').length > 50 ? '...' : ''}</span>
          {current.link && (
            <span className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          )}
        </motion.p>

        {/* Navigation arrows for multiple announcements */}
        {visibleAnnouncements.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length)
            }}
            className="absolute right-10 p-1 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Close button - only show if dismissible */}
        {current.is_dismissible && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleDismiss(current.id)
            }}
            className="absolute right-2 p-1.5 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
        )}
      </div>

      {/* Pagination dots */}
      {visibleAnnouncements.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {visibleAnnouncements.map((_, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(idx)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentIndex % visibleAnnouncements.length
                  ? "bg-primary w-6 glow-sm"
                  : "bg-muted-foreground/40 hover:bg-primary/60 w-1.5",
              )}
              aria-label={`Go to announcement ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )

  if (current.link) {
    return (
      <a href={current.link} target="_blank" rel="noopener noreferrer" className="block">
        {Content}
      </a>
    )
  }

  return Content
}
