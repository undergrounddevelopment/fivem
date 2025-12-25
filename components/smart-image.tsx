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
  const [imgSrc, setImgSrc] = useState(src || "/fivem-asset-thumbnail.jpg")
  const [hasError, setHasError] = useState(false)

  const fallbackImage = "/fivem-asset-thumbnail.jpg"

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackImage)
    }
  }

  // Reset state when src changes
  if (src && src !== imgSrc && !hasError) {
    setImgSrc(src)
  }

  if (fill) {
    return (
      <Image
        src={imgSrc || fallbackImage}
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
      src={imgSrc || fallbackImage}
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
