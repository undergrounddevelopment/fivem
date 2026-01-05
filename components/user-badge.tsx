"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface UserBadgeProps {
  userId: string
  size?: "xs" | "sm" | "md"
  showTooltip?: boolean
  className?: string
}

export function UserBadge({ userId, size = "sm", showTooltip = true, className }: UserBadgeProps) {
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
    if (userId) fetchBadge()
  }, [userId])

  if (loading || !badge) return null

  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
  }

  return (
    <div className={cn("relative group inline-flex", className)}>
      <img
        src={badge.imageUrl}
        alt={badge.name}
        className={cn(
          "rounded-full object-cover ring-1 ring-white/20",
          sizeClasses[size]
        )}
        style={{
          filter: badge.tier >= 5 ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' : 'none'
        }}
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
          <div 
            className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl border"
            style={{ borderColor: badge.color }}
          >
            <div className="font-bold">{badge.name}</div>
            <div className="text-gray-400 text-[10px]">{badge.description}</div>
            <div className="text-gray-500 text-[10px] mt-1">Tier {badge.tier}</div>
          </div>
        </div>
      )}
    </div>
  )
}
