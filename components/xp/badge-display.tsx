"use client"
import Image from "next/image"
import type { Badge } from "@/lib/xp/types"

interface BadgeDisplayProps {
  badge: Badge
  size?: "sm" | "md" | "lg" | "xl"
  showTooltip?: boolean
  className?: string
}

export function BadgeDisplay({ badge, size = "md", showTooltip = true, className = "" }: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  return (
    <div className={`relative group flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative transition-transform duration-300 group-hover:scale-110`}>
        <div
          className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: badge.color }}
        />
        <Image
          src={badge.imageUrl || "/placeholder.svg"}
          alt={badge.name}
          fill
          className="object-contain relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        />
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl border border-gray-700">
            <div className="font-bold">{badge.name}</div>
            <div className="text-gray-400 text-[10px]">{badge.description}</div>
            <div className="text-gray-500 text-[10px] mt-1">Tier {badge.tier}</div>
          </div>
        </div>
      )}
    </div>
  )
}
