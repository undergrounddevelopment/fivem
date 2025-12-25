"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AssetCard } from "@/components/asset-card"
import { SponsorBanner } from "@/components/sponsor-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Grid, List, Search, Shirt, Zap } from "lucide-react"
import type { Asset } from "@/lib/types"

export default function ClothingPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [price, setPrice] = useState<"all" | "free" | "premium">("all")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function fetchAssets() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ category: "clothing" })
        if (price !== "all") params.set("price", price)
        if (search) params.set("search", search)

        const res = await fetch(`/api/assets?${params}`)
        const data = await res.json()
        setAssets(data.items || data.assets || [])
      } catch (error) {
        console.error("Failed to fetch clothing:", error)
        setAssets([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchAssets, 300)
    return () => clearTimeout(debounce)
  }, [price, search])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6">
          <SponsorBanner />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-warning to-chart-5 flex items-center justify-center glow-sm">
                <Shirt className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">EUP & Clothing</h1>
                  <span className="rounded-full bg-warning/20 px-3 py-1 text-sm font-medium text-warning">
                    {assets.length} resources
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Emergency uniforms, civilian clothing, and character customization packs
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clothing..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
                  {(["all", "free", "premium"] as const).map((p) => (
                    <Button
                      key={p}
                      variant={price === p ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setPrice(p)}
                      className={`rounded-lg capitalize ${price === p ? "bg-card" : ""} ${
                        p === "free" ? "text-success" : p === "premium" ? "text-primary" : ""
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-1 border border-border/50 rounded-xl p-1 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={`h-9 w-9 rounded-lg ${viewMode === "grid" ? "bg-card" : ""}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={`h-9 w-9 rounded-lg ${viewMode === "list" ? "bg-card" : ""}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Clothing Grid */}
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] bg-secondary/50 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-1/3 bg-secondary/50 rounded animate-pulse" />
                    <div className="h-5 w-2/3 bg-secondary/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : assets.length > 0 ? (
            <div
              className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}
            >
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} variant={viewMode === "list" ? "compact" : "default"} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl flex flex-col items-center justify-center py-20">
              <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Zap className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No clothing found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
