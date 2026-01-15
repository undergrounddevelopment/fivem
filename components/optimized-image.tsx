"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useImageOptimization } from '@/hooks/use-performance'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
  unoptimized?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = '/placeholder.svg',
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  onLoad,
  onError,
  unoptimized = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const { loadImage } = useImageOptimization()

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      loadImage(src, placeholder)
        .then(setImageSrc)
        .catch(() => {
          setHasError(true)
          setImageSrc(placeholder)
        })
    }
  }, [src, priority, placeholder, loadImage])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    setImageSrc(placeholder)
    onError?.()
  }, [placeholder, onError])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src, placeholder)
              .then(setImageSrc)
              .catch(() => {
                setHasError(true)
                setImageSrc(placeholder)
              })
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, placeholder, priority, loadImage])

  return (
    <div className={cn("relative overflow-hidden", fill && "w-full h-full")}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}

      <Image
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          fill && "object-cover h-full w-full",
          (isLoading && !priority) ? "opacity-0" : "opacity-100",
          hasError ? "opacity-50" : "",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        unoptimized={unoptimized || imageSrc?.includes('placeholder.svg') || src?.includes('placeholder.svg')}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-xs">
          Failed to load
        </div>
      )}
    </div>
  )
}