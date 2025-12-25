"use client"

import Image from "next/image"

const COIN_GIF_URL = "https://media.tenor.com/jX0Ytn_JLcIAAAAj/mario-coins.gif"

interface CoinIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56,
}

export function CoinIcon({ size = "md", className = "" }: CoinIconProps) {
  const dimension = sizeMap[size]

  return (
    <Image
      src={COIN_GIF_URL || "/placeholder.svg"}
      alt="Coins"
      width={dimension}
      height={dimension}
      className={className}
      unoptimized
    />
  )
}

// Export for direct img tag usage (for places that need regular img)
export const COIN_ICON_URL = COIN_GIF_URL
