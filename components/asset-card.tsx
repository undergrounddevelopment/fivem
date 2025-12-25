"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { FrameworkBadge } from "@/components/framework-selector"
import type { Asset } from "@/lib/types"
import { Download, Star, ArrowUpRight, CheckCircle, Sparkles } from "lucide-react"
import { useState } from "react"
import { CoinIcon } from "@/components/coin-icon"
import { motion } from "framer-motion"
import { SeasonalCard } from "@/components/seasonal-card"

interface AssetCardProps {
  asset: Asset
  variant?: "default" | "compact"
}

function SmartImage({
  src,
  alt,
  className,
  fill,
  priority,
}: {
  src: string
  alt: string
  className?: string
  fill?: boolean
  priority?: boolean
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const fallbackImage = "/fivem-asset-thumbnail.jpg"

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackImage)
    }
  }

  return (
    <Image
      src={imgSrc || fallbackImage}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized
      priority={priority}
      onError={handleError}
    />
  )
}

export function AssetCard({ asset, variant = "default" }: AssetCardProps) {
  const imageUrl = asset.thumbnail || asset.image || "/fivem-script.jpg"
  const downloads = asset.downloads || 0
  const rating = asset.rating || 5.0
  const price = asset.price || (asset.coinPrice === 0 ? "free" : "premium")
  const coinPrice = asset.coinPrice || asset.coin_price || 0
  const author = typeof asset.author === "string" ? asset.author : asset.author?.username || "Unknown"

  if (variant === "compact") {
    return (
      <Link href={`/asset/${asset.id}`}>
        <motion.div 
          className="group flex items-center gap-4 glass rounded-xl p-3 glass-hover"
          whileHover={{ scale: 1.02, x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-lg shrink-0">
            <SmartImage
              src={imageUrl}
              alt={asset.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {asset.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {downloads.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
          {price === "free" ? (
            <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
              FREE
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
              <CoinIcon size="xs" />
              {coinPrice}
            </Badge>
          )}
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/asset/${asset.id}`}>
      <SeasonalCard>
        <motion.div 
          className="group relative overflow-hidden rounded-2xl glass glass-hover"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <SmartImage
            src={imageUrl}
            alt={asset.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60" />
          
          {/* Animated glow on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FrameworkBadge framework={asset.framework} />
            </motion.div>
            {asset.isVerified && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Badge variant="secondary" className="bg-success/20 text-success border-0 gap-1 glow-sm">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.div 
            className="absolute right-3 top-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {price === "free" ? (
              <Badge className="bg-success text-success-foreground border-0 glow-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                FREE
              </Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground border-0 glow flex items-center gap-1">
                <CoinIcon size="xs" />
                {coinPrice}
              </Badge>
            )}
          </motion.div>

          {/* Hover arrow */}
          <motion.div 
            className="absolute right-3 bottom-3"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center glow-sm"
              whileHover={{ scale: 1.1, rotate: 45 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowUpRight className="h-4 w-4 text-primary-foreground" />
            </motion.div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase font-medium text-primary/80">{asset.category}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span>v{asset.version || "1.0.0"}</span>
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {asset.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{asset.description}</p>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <motion.span 
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.1 }}
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{downloads.toLocaleString()}</span>
              </motion.span>
              <motion.span 
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.1 }}
              >
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
              </motion.span>
            </div>
            <span className="text-muted-foreground">
              by <span className="text-foreground font-medium">{author}</span>
            </span>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
      </SeasonalCard>
    </Link>
  )
}
