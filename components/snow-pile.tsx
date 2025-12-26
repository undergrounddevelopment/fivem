"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"

interface SnowPileProps {
  className?: string
  variant?: "top" | "bottom"
  size?: "sm" | "md" | "lg"
}

const heights = { sm: "h-2", md: "h-3", lg: "h-4" }

export const SnowPile = memo(function SnowPile({ className, variant = "top", size = "md" }: SnowPileProps) {
  const sparkles = useMemo(() => Array.from({ length: 5 }), [])

  return (
    <div 
      className={cn(
        "absolute left-0 right-0 pointer-events-none z-10",
        variant === "top" ? "top-0" : "bottom-0",
        className
      )}
    >
      {/* Main snow layer */}
      <svg 
        viewBox="0 0 200 20" 
        preserveAspectRatio="none" 
        className={cn("w-full", heights[size])}
        style={{ filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.3))" }}
      >
        <path 
          d="M0,20 Q10,5 20,15 T40,12 T60,18 T80,10 T100,16 T120,8 T140,14 T160,10 T180,16 T200,12 L200,0 L0,0 Z" 
          fill="white"
          opacity="0.95"
        />
        <path 
          d="M0,20 Q15,12 30,18 T50,14 T70,19 T90,12 T110,17 T130,11 T150,16 T170,13 T190,18 T200,15 L200,0 L0,0 Z" 
          fill="white"
          opacity="0.7"
        />
      </svg>
      
      {/* Sparkle dots */}
      <div className="absolute inset-0 overflow-hidden">
        {sparkles.map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${15 + i * 18}%`,
              top: `${30 + (i % 2) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.8
            }}
          />
        ))}
      </div>
    </div>
  )
})

export const SnowPileBottom = memo(function SnowPileBottom({ className, size = "md" }: Omit<SnowPileProps, "variant">) {
  return (
    <div 
      className={cn(
        "absolute left-0 right-0 bottom-0 pointer-events-none z-10",
        className
      )}
    >
      <svg 
        viewBox="0 0 200 20" 
        preserveAspectRatio="none" 
        className={cn("w-full", heights[size])}
        style={{ filter: "drop-shadow(0 -2px 4px rgba(255,255,255,0.3))" }}
      >
        <path 
          d="M0,0 Q10,15 20,5 T40,8 T60,2 T80,10 T100,4 T120,12 T140,6 T160,10 T180,4 T200,8 L200,20 L0,20 Z" 
          fill="white"
          opacity="0.95"
        />
        <path 
          d="M0,0 Q15,8 30,2 T50,6 T70,1 T90,8 T110,3 T130,9 T150,4 T170,7 T190,2 T200,5 L200,20 L0,20 Z" 
          fill="white"
          opacity="0.7"
        />
      </svg>
    </div>
  )
})
