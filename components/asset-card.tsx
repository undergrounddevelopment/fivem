"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Download, Heart, Star, Eye, Package, Sparkles, Crown, TrendingUp, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState, memo, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { SnowPile } from "@/components/snow-pile"

interface AssetCardProps {
  asset: {
    id?: string
    title?: string
    name?: string
    description?: string
    thumbnail?: string
    image?: string
    rating?: number | string
    downloads?: number | string
    likes?: number | string
    views?: number | string
    price?: number | string
    coinPrice?: number
    isPremium?: boolean
    category?: string
    framework?: string
    tags?: string[]
    features?: string
    installation?: string
    changelog?: string
    version?: string
    file_size?: string
    author?: string | {
      username?: string
      avatar?: string
      membership?: string
      xp?: number
      level?: number
    }
  }
  variant?: "default" | "compact"
}

export const AssetCard = memo(function AssetCard({ asset }: AssetCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  const imageUrl = asset.thumbnail || asset.image
  const hasImage = imageUrl && !imageError
  const isPremium = asset.isPremium || (asset.price && Number(asset.price) > 0)
  
  const formatNumber = useCallback((num: number | string | undefined) => {
    if (!num) return "0"
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toString()
  }, [])
  
  const handleImageError = useCallback(() => setImageError(true), [])
  const toggleLike = useCallback(() => setIsLiked(prev => !prev), [])

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col relative overflow-hidden rounded-2xl border-white/10 hover:border-primary/40 transition-all duration-500 group bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-sm">
        {/* Snow pile on top */}
        <SnowPile size="sm" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
          <div className="absolute -inset-px bg-gradient-to-r from-primary/20 via-pink-500/10 to-primary/20 rounded-2xl blur-xl" />
        </div>

        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-3 left-3 z-20">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/30"
            >
              <Crown className="w-3.5 h-3.5" />
              Premium
            </motion.div>
          </div>
        )}

        <CardHeader className="p-0 relative">
          <div className="relative aspect-video overflow-hidden rounded-t-2xl">
            {hasImage ? (
              <>
                <img
                  src={imageUrl}
                  alt={asset.title || asset.name || "Asset"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={handleImageError}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-pink-500/10 to-purple-500/20">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Package className="w-8 h-8 text-primary/70" />
                  </div>
                  <p className="text-sm text-muted-foreground/70 font-medium px-4 line-clamp-1">
                    {asset.title || asset.name || "Asset Preview"}
                  </p>
                </div>
              </div>
            )}
            
            {/* Quick action overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Link href={asset.id ? `/asset/${asset.id}` : "#"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-xl bg-white/90 text-gray-900 font-semibold text-sm flex items-center gap-2 shadow-xl backdrop-blur-sm"
                >
                  <Eye className="w-4 h-4" />
                  Quick View
                </motion.button>
              </Link>
            </div>

            {/* Category badge */}
            {asset.category && (
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-white/90 font-medium">
                {asset.category}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-3 relative z-10">
          {/* Title and price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors leading-tight">
              {asset.name || asset.title || "Untitled Asset"}
            </h3>
            <span className={cn(
              "shrink-0 px-2 py-1 rounded-lg text-xs font-bold",
              isPremium 
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30" 
                : "bg-green-500/20 text-green-400 border border-green-500/30"
            )}>
              {isPremium ? `$${asset.price}` : "FREE"}
            </span>
          </div>

          {/* Description - Compact */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {asset.description || "High-quality FiveM resource for your server."}
          </p>

          {/* Modern XP Bar */}
          {typeof asset.author === "object" && asset.author.xp && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-pink-500 ring-1 ring-white/20 overflow-hidden">
                    {asset.author.avatar && (
                      <img src={asset.author.avatar} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-foreground text-[11px]">
                    {asset.author.username || "Unknown"}
                  </span>
                  {asset.author.membership === "vip" && (
                    <Crown className="w-3 h-3 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold text-primary">
                    Lv.{asset.author.level || 1}
                  </span>
                </div>
              </div>
              
              {/* XP Progress Bar */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Experience</span>
                  <span className="text-[10px] text-muted-foreground">
                    {asset.author.xp?.toLocaleString()} XP
                  </span>
                </div>
                <div className="relative h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((asset.author.xp || 0) / 10000 * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      boxShadow: "0 0 10px rgba(236, 72, 153, 0.5)"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-foreground">{asset.rating || "4.8"}</span>
              </div>
              <span className="text-[9px] text-muted-foreground">Rating</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Download className="w-3 h-3" />
                <span>{formatNumber(asset.downloads)}</span>
              </div>
              <span className="text-[9px] text-muted-foreground">Downloads</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Heart className="w-3 h-3" />
                <span>{formatNumber(asset.likes)}</span>
              </div>
              <span className="text-[9px] text-muted-foreground">Likes</span>
            </div>
            {asset.views && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(asset.views)}</span>
                </div>
                <span className="text-[9px] text-muted-foreground">Views</span>
              </div>
            )}
          </div>

          {/* Tags - Compact */}
          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {asset.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-muted-foreground">
                  {tag}
                </span>
              ))}
              {asset.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-muted-foreground">
                  +{asset.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2 relative z-10">
          <Link href={asset.id ? `/asset/${asset.id}` : "#"} className="flex-1">
            <Button 
              className={cn(
                "w-full rounded-xl font-semibold transition-all duration-300 gap-2",
                isPremium
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                  : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40"
              )}
            >
              {isPremium ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Access
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </Button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLike}
            className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              isLiked 
                ? "bg-pink-500/20 border-pink-500/50 text-pink-400" 
                : "bg-white/5 border-white/10 text-muted-foreground hover:border-pink-500/30 hover:text-pink-400"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </motion.button>
        </CardFooter>
      </Card>
    </motion.div>
  )
})
