"use client"

import { useState, useEffect } from "react"
import { AssetCard } from "@/components/asset-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Search, Package, Zap } from "lucide-react"

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")

  useEffect(() => {
    fetchAssets()
  }, [search, category])

  async function fetchAssets() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      if (!supabase) return

      let query = supabase
        .from('assets')
        .select('*')
        .eq('status', 'active')

      if (category !== 'all') query = query.eq('category', category)
      if (search) query = query.ilike('title', `%${search}%`)
      
      query = query.order('created_at', { ascending: false }).limit(50)

      const { data, error } = await query

      if (error) {
        console.error('Error:', error)
        setAssets([])
        return
      }

      const formatted = (data || []).map((asset: any) => ({
        ...asset,
        coinPrice: asset.coin_price || 0,
        price: asset.coin_price === 0 ? 'free' : 'premium',
      }))

      setAssets(formatted)
    } catch (error) {
      console.error('Fetch error:', error)
      setAssets([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Package className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Browse Assets</h1>
            <p className="text-muted-foreground">Discover FiveM resources</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          {['all', 'scripts', 'mlo', 'vehicles', 'clothing'].map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              onClick={() => setCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assets.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Zap className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No assets found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch("")
                setCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
