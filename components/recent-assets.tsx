"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Star, Eye, Calendar, Package } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/optimized-image"

interface Asset {
  id: string
  title: string
  description: string
  category: string
  framework: string
  downloads: number
  rating: number
  coin_price: number
  thumbnail_url: string
  thumbnail?: string
  created_at: string
  status: string
  coinPrice?: number
}

export function RecentAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets?limit=6&status=approved')
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setAssets(data.assets || data.items || [])
      setError(false)
    } catch (err) {
      console.error("Failed to fetch assets:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-2">Failed to load assets</p>
          <Button onClick={fetchAssets} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-[2rem] bg-white/[0.02] border border-white/5 p-12 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/20 transition-all duration-300 group-hover:scale-105">
            <Package className="h-10 w-10 text-primary/50" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Warehouse Depleted</h3>
          <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed mb-8">
            The neural marketplace is ready for fresh asset injections. Be the pioneer of our current era.
          </p>
          <Link href="/upload">
            <Button className="bg-primary text-black font-black uppercase tracking-widest px-8 h-12 rounded-xl hover:scale-105 transition-all">
              Initialize Upload
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-3 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]" />
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Strategic Assets</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Recent Resource Uplinks</p>
          </div>
        </div>
        <Link href="/assets">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-primary hover:text-black hover:border-primary font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl transition-all">
            Scan All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="group"
          >
            <div className="relative h-full overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300 backdrop-blur-sm">
              <Link href={`/asset/${asset.id}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  {asset.thumbnail_url || asset.thumbnail ? (
                    <OptimizedImage
                      src={asset.thumbnail_url || asset.thumbnail}
                      alt={asset.title}
                      fill
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center">
                      <Package className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

                  {/* Category Badge Floating */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                      {asset.category}
                    </Badge>
                  </div>
                </div>
              </Link>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Link href={`/asset/${asset.id}`}>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {asset.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                    <Star className="w-3 h-3 text-primary" fill="currentColor" />
                    <span className="text-[10px] font-black text-primary">{(asset.rating || 0.0).toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed opacity-60 mb-6 min-h-[2.5rem]">
                  {asset.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 block mb-1">Framework</span>
                    <span className="text-[10px] font-black text-white uppercase">{asset.framework}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 block mb-1">Downloads</span>
                    <span className="text-[10px] font-black text-white uppercase">{asset.downloads.toLocaleString()} Units</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {asset.coin_price === 0 ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                      Public Access
                    </Badge>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-primary">{asset.coinPrice || asset.coin_price}</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Coins</span>
                    </div>
                  )}

                  <Link href={`/asset/${asset.id}`}>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-black hover:border-primary transition-all p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Card Footer Decor */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}