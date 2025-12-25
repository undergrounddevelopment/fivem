"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Sparkles, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements")
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [fetchAnnouncements])

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

  // Load dismissed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dismissed_announcements")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setDismissed(new Set(parsed))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  const visibleAnnouncements = announcements.filter((a) => (a.is_dismissible ? !dismissed.has(a.id) : true))

  if (isLoading || visibleAnnouncements.length === 0) return null

  const current = visibleAnnouncements[currentIndex % visibleAnnouncements.length]
  if (!current) return null

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "from-emerald-600/90 via-teal-600/90 to-cyan-600/90",
          icon: CheckCircle,
          iconColor: "text-emerald-200",
        }
      case "warning":
        return {
          bg: "from-amber-600/90 via-orange-600/90 to-yellow-600/90",
          icon: AlertTriangle,
          iconColor: "text-amber-200",
        }
      case "error":
        return {
          bg: "from-red-600/90 via-rose-600/90 to-pink-600/90",
          icon: AlertTriangle,
          iconColor: "text-red-200",
        }
      case "promo":
        return {
          bg: "from-cyan-600/90 via-teal-500/90 to-emerald-500/90",
          icon: Sparkles,
          iconColor: "text-cyan-200",
        }
      default:
        return {
          bg: "from-cyan-600/90 via-teal-600/90 to-cyan-700/90",
          icon: Info,
          iconColor: "text-cyan-200",
        }
    }
  }

  const typeStyles = getTypeStyles(current.type)
  const IconComponent = typeStyles.icon

  const Content = (
    <div className={cn("relative w-full overflow-hidden bg-gradient-to-r", typeStyles.bg)}>
      {/* Animated background shimmer for promo */}
      {current.type === "promo" && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

      <div className="relative flex items-center justify-center gap-3 px-4 py-2.5 md:py-3">
        {/* Navigation arrows for multiple announcements */}
        {visibleAnnouncements.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length)
            }}
            className="absolute left-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
        )}

        {/* Icon */}
        <div className={cn("flex-shrink-0 p-1.5 rounded-full bg-white/10 backdrop-blur-sm", typeStyles.iconColor)}>
          <IconComponent className="w-4 h-4" aria-hidden="true" />
        </div>

        {/* Message */}
        <p className="text-sm md:text-base font-medium text-center line-clamp-1 text-white">
          {current.title && <span className="font-bold mr-1">{current.title}</span>}
          {current.message}
          {current.link && <ExternalLink className="inline-block ml-2 h-4 w-4" />}
        </p>

        {/* Navigation arrows for multiple announcements */}
        {visibleAnnouncements.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length)
            }}
            className="absolute right-10 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-4 h-4 text-white/70" />
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
            className="absolute right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
        )}
      </div>

      {/* Pagination dots */}
      {visibleAnnouncements.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {visibleAnnouncements.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(idx)
              }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentIndex % visibleAnnouncements.length ? "bg-white w-3" : "bg-white/40 hover:bg-white/60",
              )}
              aria-label={`Go to announcement ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
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
