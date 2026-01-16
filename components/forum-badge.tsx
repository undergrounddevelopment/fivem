"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { BADGE_TIERS } from "@/lib/xp-badges"

interface ForumBadgeProps {
  userId: string
  size?: "sm" | "md"
}

export function ForumBadge({ userId, size = "sm" }: ForumBadgeProps) {
  const [badgeInfo, setBadgeInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const res = await fetch(`/api/xp/stats?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          // data.badgeTier is the number, find the tier info
          const tier = BADGE_TIERS.find(t => t.tier === (data.badgeTier || 1)) || BADGE_TIERS[0]
          setBadgeInfo(tier)
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

  if (loading || !badgeInfo) return null

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7"
  }

  return (
    <div className="flex items-center gap-1.5" title={`${badgeInfo.name} Rank`}>
      <img 
        src={badgeInfo.icon} 
        alt={badgeInfo.name}
        className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]`}
      />
      {size === "md" && (
        <Badge 
          variant="outline" 
          className="text-[10px] px-1.5 py-0 h-5 font-bold uppercase tracking-wider"
          style={{ borderColor: `${badgeInfo.color}40`, color: badgeInfo.color, backgroundColor: `${badgeInfo.color}10` }}
        >
          {badgeInfo.name}
        </Badge>
      )}
    </div>
  )
}