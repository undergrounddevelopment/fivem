"use client"

import { useState, useEffect, useCallback } from "react"
import { SPONSORS } from "@/lib/constants"
import { X, ExternalLink, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface DBBanner {
  id: string
  title: string
  image_url: string
  link: string | null
  position: string
  is_active: boolean
}

export function SponsorBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [dbBanners, setDbBanners] = useState<DBBanner[]>([])
  const activeSponsors = SPONSORS.filter((s) => s.isActive)

  // Fetch banners from database
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/banners?position=hero")
      const data = await res.json()
      setDbBanners(data.banners || [])
    } catch (error) {
      console.error("Failed to fetch banners:", error)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    if (supabase) {
      try {
        channel = supabase
          .channel("banners:hero")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "banners", filter: "position=eq.hero" },
            () => fetchBanners(),
          )
          .subscribe()
      } catch (error) {
        console.error("Failed to subscribe to hero banners:", error)
      }
    }

    // Fallback polling
    const interval = setInterval(fetchBanners, 30000)
    return () => {
      if (channel && supabase) supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchBanners])

  // Combine database banners with local sponsors
  const allBanners = [
    // Database banners first (from admin panel)
    ...dbBanners.map(b => ({
      name: b.title || "Featured",
      image: b.image_url,
      url: b.link || "#",
      isActive: b.is_active,
      type: "image" as const
    })),
    // Then static sponsors
    ...activeSponsors
  ]

  // Fallback if no banners
  const finalBanners = allBanners.length > 0 ? allBanners : [
    { name: "Featured", image: "/banner1.png", url: "#", isActive: true, type: "image" as const }
  ]

  useEffect(() => {
    if (finalBanners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % finalBanners.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [finalBanners.length])

  if (!isVisible || finalBanners.length === 0) return null

  const sponsor = finalBanners[currentIndex % finalBanners.length]
  const href = sponsor?.url || "#"
  const isExternal = Boolean(sponsor?.url && sponsor.url !== "#")

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl glass border border-primary/20 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Close Button */}
      <motion.button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 z-20 p-2 rounded-lg glass hover:bg-background/90 text-muted-foreground hover:text-foreground transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="h-4 w-4" />
      </motion.button>

      {/* Sponsor Badge */}
      <motion.div 
        className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg glass border border-primary/30 text-xs font-semibold flex items-center gap-1.5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        <span className="gradient-text">Featured</span>
      </motion.div>

      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="block relative aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1] group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            {sponsor.type === "video" ? (
              <video 
                src={sponsor.image} 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={sponsor.image || "/placeholder.svg"} 
                alt={sponsor.name} 
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hover Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.span 
            className="flex items-center gap-2 text-sm font-semibold text-foreground glass px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            Visit {sponsor.name} <ExternalLink className="h-4 w-4" />
          </motion.span>
        </motion.div>

        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-shimmer" />
        </div>
      </a>

      {/* Indicator Dots */}
      {finalBanners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {finalBanners.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === currentIndex 
                  ? "w-8 bg-primary glow-sm" 
                  : "w-2 glass hover:bg-foreground/50"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
