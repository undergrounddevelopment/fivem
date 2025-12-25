"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Banner {
  id: string
  title: string | null
  image_url: string
  link: string | null
  position: string
  is_active: boolean
}

interface DynamicBannerProps {
  position: "top" | "sidebar" | "footer" | "hero"
  className?: string
  showClose?: boolean
}

export function DynamicBanner({ position, className, showClose = true }: DynamicBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/banners?position=${position}`)
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error("Failed to fetch banners:", error)
    } finally {
      setIsLoading(false)
    }
  }, [position])

  useEffect(() => {
    fetchBanners()
    const interval = setInterval(fetchBanners, 30000)
    return () => clearInterval(interval)
  }, [fetchBanners])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    const dismissed = localStorage.getItem(`banner_dismissed_${position}`)
    if (dismissed) {
      const dismissedTime = Number.parseInt(dismissed)
      // Reset after 24 hours
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        setIsVisible(false)
      } else {
        localStorage.removeItem(`banner_dismissed_${position}`)
      }
    }
  }, [position])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem(`banner_dismissed_${position}`, Date.now().toString())
  }

  if (isLoading || !isVisible || banners.length === 0) return null

  const currentBanner = banners[currentIndex]
  const hasMultiple = banners.length > 1

  const BannerContent = (
    <div className={cn("relative overflow-hidden rounded-xl", position === "top" && "rounded-none", className)}>
      {showClose && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {hasMultiple && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentIndex((prev) => (prev + 1) % banners.length)
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div
        className={cn(
          "relative group",
          position === "sidebar" && "aspect-[3/2]",
          position === "top" && "aspect-[6/1]",
          position === "hero" && "aspect-[16/5]",
          position === "footer" && "aspect-[4/1]",
        )}
      >
        <img
          src={currentBanner.image_url || "/placeholder.svg?height=200&width=800&query=promotional banner"}
          alt={currentBanner.title || "Banner"}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=800"
          }}
        />

        {currentBanner.link && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              {currentBanner.title || "Learn More"} <ExternalLink className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>

      {/* Indicator dots */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(i)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )

  if (currentBanner.link) {
    return (
      <a href={currentBanner.link} target="_blank" rel="noopener noreferrer" className="block">
        {BannerContent}
      </a>
    )
  }

  return BannerContent
}
