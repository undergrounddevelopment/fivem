"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AssetCard } from "@/components/asset-card"
import { SponsorBanner } from "@/components/sponsor-banner"
import { FrameworkSelector } from "@/components/framework-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Grid,
  List,
  Search,
  Code,
  Zap,
  TrendingUp,
  Clock,
  Star,
  Download,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import type { Asset, Framework } from "@/lib/types"

export default function ScriptsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [featuredAssets, setFeaturedAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [framework, setFramework] = useState<Framework | "all">("all")
  const [price, setPrice] = useState<"all" | "free" | "premium">("all")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "downloads" | "rating">("latest")

  useEffect(() => {
    async function fetchAssets() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ category: "scripts" })
        if (framework !== "all") params.set("framework", framework)
        if (price !== "all") params.set("price", price)
        if (search) params.set("search", search)
        params.set("sort", sortBy)

        const res = await fetch(`/api/assets?${params}`)
        const data = await res.json()
        const allAssets = data.items || data.assets || []
        setAssets(allAssets)
        setFeaturedAssets(allAssets.slice(0, 3))
      } catch (error) {
        console.error("Failed to fetch assets:", error)
        setAssets([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchAssets, 300)
    return () => clearTimeout(debounce)
  }, [framework, price, search, sortBy])

  const stats = {
    total: assets.length,
    free: assets.filter((a) => a.price === "free" || a.coinPrice === 0).length,
    premium: assets.filter((a) => a.price === "premium" && (a.coinPrice || 0) > 0).length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6 space-y-6">
          <SponsorBanner />

          {/* Modern Page Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-border p-8">
            <div className="absolute inset-0 bg-grid-white/5" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Scripts</h1>
                  <p className="text-muted-foreground max-w-xl">
                    Premium and free scripts for your FiveM server. QBCore, ESX, and QBox compatible.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Scripts</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{stats.free}</p>
                    <p className="text-xs text-muted-foreground">Free</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.premium}</p>
                    <p className="text-xs text-muted-foreground">Premium</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Featured Scripts */}
          {featuredAssets.length > 0 && !search && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Featured Scripts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    </div>
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={asset.thumbnail || "/placeholder.svg?height=200&width=400&query=script"}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{asset.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{asset.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" /> {asset.downloads || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" /> {asset.rating || "5.0"}
                          </span>
                        </div>
                        <Badge variant={asset.coinPrice === 0 ? "secondary" : "default"}>
                          {asset.coinPrice === 0 ? "FREE" : `${asset.coinPrice} Coins`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search scripts by name, author, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-11 h-11 bg-background border-border rounded-xl"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Framework selector */}
                  <FrameworkSelector selected={framework} onSelect={setFramework} />

                  {/* Price filter */}
                  <div className="flex gap-1 bg-background rounded-xl p-1 border border-border">
                    {(["all", "free", "premium"] as const).map((p) => (
                      <Button
                        key={p}
                        variant={price === p ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPrice(p)}
                        className={`rounded-lg capitalize ${
                          price === p
                            ? "bg-primary text-primary-foreground"
                            : p === "free"
                              ? "text-green-400 hover:text-green-300"
                              : p === "premium"
                                ? "text-primary hover:text-primary/80"
                                : ""
                        }`}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>

                  {/* Sort dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 rounded-xl border-border bg-transparent">
                        <SlidersHorizontal className="h-4 w-4" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSortBy("latest")}
                        className={sortBy === "latest" ? "bg-primary/10" : ""}
                      >
                        <Clock className="h-4 w-4 mr-2" /> Latest
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortBy("popular")}
                        className={sortBy === "popular" ? "bg-primary/10" : ""}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" /> Most Popular
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortBy("downloads")}
                        className={sortBy === "downloads" ? "bg-primary/10" : ""}
                      >
                        <Download className="h-4 w-4 mr-2" /> Most Downloads
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortBy("rating")}
                        className={sortBy === "rating" ? "bg-primary/10" : ""}
                      >
                        <Star className="h-4 w-4 mr-2" /> Highest Rated
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View toggle */}
                  <div className="flex gap-1 border border-border rounded-xl p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className={`h-9 w-9 rounded-lg ${viewMode === "grid" ? "bg-primary" : ""}`}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className={`h-9 w-9 rounded-lg ${viewMode === "list" ? "bg-primary" : ""}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-medium">{assets.length}</span> scripts
              {search && (
                <>
                  {" "}
                  for "<span className="text-primary">{search}</span>"
                </>
              )}
            </p>
          </div>

          {/* Scripts Grid/List */}
          {isLoading ? (
            <div
              className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="bg-card/50 border-border overflow-hidden">
                  <div className="aspect-[16/10] bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
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
            <Card className="bg-card/50 border-border">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Zap className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No scripts found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search query</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearch("")
                    setFramework("all")
                    setPrice("all")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
