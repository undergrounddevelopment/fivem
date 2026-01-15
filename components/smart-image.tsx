"use client"

import Image from "next/image"
import { useState } from "react"

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  priority?: boolean
  width?: number
  height?: number
}

export default function SmartImage({ src, alt, className, fill, priority, width, height }: SmartImageProps) {
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
  }

  // If no src provided or error occurred, render nothing (100% real data only)
  if (!src || hasError) {
    return null
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        unoptimized
        priority={priority}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      unoptimized
      priority={priority}
      onError={handleError}
    />
  )
}

