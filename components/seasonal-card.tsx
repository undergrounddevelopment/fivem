"use client"

import { useEffect, useState } from "react"
import { getCurrentHoliday } from "@/lib/seasonal-theme"

export function SeasonalCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [season, setSeason] = useState(getCurrentHoliday())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setSeason(getCurrentHoliday())
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -20
    })
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
    setIsHovered(false)
  }

  if (!season) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(${isHovered ? 30 : 0}px)`,
        transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        transformStyle: "preserve-3d",
        borderColor: season.theme.primary,
        boxShadow: `0 ${isHovered ? 30 : 10}px ${isHovered ? 60 : 40}px ${season.theme.primary}${isHovered ? "40" : "30"}, 
                    inset 0 1px 0 ${season.theme.primary}20,
                    0 0 0 1px ${season.theme.primary}10`
      }}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${season.theme.primary}10, transparent, ${season.theme.secondary}10)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          transform: "translateZ(-10px)"
        }}
      />
    </div>
  )
}
