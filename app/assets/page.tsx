"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AssetCard } from "@/components/asset-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Package, Zap } from "lucide-react"

const categories = [
  { id: 'all', label: 'All Assets' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'mlo', label: 'MLO' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'clothing', label: 'Clothing' }
]

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
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      params.set('limit', '50')
      
      const response = await fetch(`/api/assets?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assets')
      }
      
      const result = await response.json()
      setAssets(result.assets || result.items || [])
    } catch (error) {
      console.error('Fetch error:', error)
      setAssets([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '10%', left: '5%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '60%', right: '10%', opacity: 0.1 }} />

      <div className="container mx-auto p-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Browse Assets</h1>
              <p className="text-muted-foreground">Discover premium FiveM resources for your server</p>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-6 space-y-4"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? 'default' : 'outline'}
                onClick={() => setCategory(cat.id)}
                className="transition-all"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search assets by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-card/50 backdrop-blur-sm border-white/10"
            />
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {assets.length} {assets.length === 1 ? 'asset' : 'assets'} found
              {category !== 'all' && ` in ${categories.find(c => c.id === category)?.label}`}
              {search && ` matching "${search}"`}
            </p>
          )}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <div className="aspect-[16/10] bg-secondary/50 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/3 bg-secondary/50 rounded animate-pulse" />
                  <div className="h-5 w-2/3 bg-secondary/50 rounded animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : assets.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AssetCard asset={asset} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl flex flex-col items-center justify-center py-20"
          >
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No assets found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
            <Button 
              variant="link" 
              className="text-primary mt-2" 
              onClick={() => {
                setSearch("")
                setCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
