"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Star, Eye, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

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
  created_at: string
  status: string
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Assets</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No assets available yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Assets will appear here once they are uploaded and approved
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Assets</CardTitle>
        <Link href="/assets">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/asset/${asset.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    {asset.thumbnail_url || asset.thumbnail ? (
                      <img 
                        src={asset.thumbnail_url || asset.thumbnail} 
                        alt={asset.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="text-white text-center">
                        <div className="text-2xl mb-2">📦</div>
                        <div className="text-sm font-medium">{asset.category}</div>
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/asset/${asset.id}`}>
                      <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary">
                        {asset.title}
                      </h3>
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      {asset.category}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {asset.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {asset.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {(asset.rating || 4.8).toFixed(1)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(asset.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={asset.coin_price === 0 ? "secondary" : "default"}>
                      {asset.coin_price === 0 ? "FREE" : `${asset.coinPrice || asset.coin_price} coins`}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {asset.framework}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}