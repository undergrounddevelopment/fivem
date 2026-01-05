"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface ForumBadgeProps {
  userId: string
  size?: "sm" | "md"
}

export function ForumBadge({ userId, size = "sm" }: ForumBadgeProps) {
  const [badge, setBadge] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const res = await fetch(`/api/xp/stats?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setBadge(data.badge)
        }
      } catch (error) {
        console.error('Failed to fetch badge:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchBadge()
    }
  }, [userId])

  if (loading || !badge) return null

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5"
  }

  return (
    <div className="flex items-center gap-1" title={badge.name}>
      <img 
        src={badge.imageUrl} 
        alt={badge.name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-white/20`}
      />
      {size === "md" && (
        <Badge 
          variant="outline" 
          className="text-xs px-1.5 py-0 h-5"
          style={{ borderColor: badge.color, color: badge.color }}
        >
          Tier {badge.tier}
        </Badge>
      )}
    </div>
  )
}