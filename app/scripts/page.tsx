"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AssetCard } from "@/components/asset-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Code, Zap, Grid, List } from "lucide-react"

export default function ScriptsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [price, setPrice] = useState<"all" | "free" | "premium">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchAssets()
  }, [search, price])

  async function fetchAssets() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ category: 'scripts' })
      if (search) params.set('search', search)
      if (price !== "all") params.set("price", price)
      
      const response = await fetch(`/api/assets?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch scripts')
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
      <div className="blur-orb" style={{ top: '5%', left: '10%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '50%', right: '5%', opacity: 0.1 }} />

      <div className="container mx-auto p-6 relative z-10">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Code className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Scripts</h1>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                  {assets.length} resources
                </span>
              </div>
              <p className="text-muted-foreground">Premium and free scripts for FiveM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search scripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64 bg-card/50 backdrop-blur-sm border-white/10"
              />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {(["all", "free", "premium"] as const).map((p) => (
                <Button
                  key={p}
                  variant={price === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrice(p)}
                  className={`capitalize transition-all ${
                    p === "free" && price === p ? "bg-success hover:bg-success/90" : 
                    p === "premium" && price === p ? "bg-warning hover:bg-warning/90" : ""
                  }`}
                >
                  {p}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 border border-white/10 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Scripts Grid */}
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
            className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}
          >
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AssetCard asset={asset} variant={viewMode === "list" ? "compact" : "default"} />
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
            <h3 className="text-xl font-semibold">No scripts found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search</p>
            <Button variant="link" className="text-primary mt-2" onClick={() => setSearch("")}>
              Clear Search
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
