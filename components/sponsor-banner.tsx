"use client"

import { useState, useEffect } from "react"
import { SPONSORS } from "@/lib/constants"
import { X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export function SponsorBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const activeSponsors = SPONSORS.filter((s) => s.isActive)

  useEffect(() => {
    if (activeSponsors.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSponsors.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [activeSponsors.length])

  if (!isVisible || activeSponsors.length === 0) return null

  const sponsor = activeSponsors[currentIndex]
  const href = sponsor.url || "#"
  const isExternal = Boolean(sponsor.url)

  return (
    <div className="relative overflow-hidden rounded-xl glass border border-primary/20 mb-6">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-medium">
        Sponsor
      </div>

      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="block relative aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1] group"
      >
        {sponsor.type === "video" ? (
          <video src={sponsor.image} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={sponsor.image || "/placeholder.svg"} alt={sponsor.name} className="w-full h-full object-cover" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            Visit {sponsor.name} <ExternalLink className="h-4 w-4" />
          </span>
        </div>
      </a>

      {/* Indicator dots */}
      {activeSponsors.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {activeSponsors.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/30 hover:bg-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
