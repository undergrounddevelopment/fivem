"use client"

import { useState, useEffect } from "react"
import { AssetCard } from "@/components/asset-card"
import { FrameworkSelector } from "@/components/framework-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Grid,
  List,
  Search,
  Package,
  Zap,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Star,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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

const CATEGORIES = [
  { id: "all", name: "All", icon: Package },
  { id: "scripts", name: "Scripts", icon: Zap },
  { id: "mlo", name: "MLO", icon: Package },
  { id: "vehicles", name: "Vehicles", icon: Package },
  { id: "clothing", name: "Clothing", icon: Package },
]

const SORT_OPTIONS = [
  { id: "newest", name: "Newest First", icon: Clock },
  { id: "popular", name: "Most Popular", icon: TrendingUp },
  { id: "rating", name: "Highest Rated", icon: Star },
  { id: "downloads", name: "Most Downloads", icon: Package },
]

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [framework, setFramework] = useState<Framework | "all">("all")
  const [price, setPrice] = useState<"all" | "free" | "premium">("all")
  const [category, setCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 12

  // Stats
  const [stats, setStats] = useState({ total: 0, free: 0, premium: 0 })

  useEffect(() => {
    async function fetchAssets() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (category !== "all") params.set("category", category)
        if (framework !== "all") params.set("framework", framework)
        if (price !== "all") params.set("price", price)
        if (search) params.set("search", search)
        params.set("sort", sortBy)
        params.set("page", page.toString())
        params.set("limit", ITEMS_PER_PAGE.toString())

        const res = await fetch(`/api/assets?${params}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch assets: ${res.status}`)
        }

        const data = await res.json()
        const assetItems = data?.items || data?.assets || []
        const assetArray = Array.isArray(assetItems) ? assetItems : []
        setAssets(assetArray)
        setTotalPages(data.totalPages || 1)

        // Calculate stats
        const freeCount = assetArray.filter(
          (a: Asset) => a.price === "free" || a.coinPrice === 0 || (a as any).coin_price === 0,
        ).length
        setStats({
          total: data.total || assetArray.length,
          free: freeCount,
          premium: assetArray.length - freeCount,
        })
      } catch (err) {
        console.error("Failed to fetch assets:", err)
        setError(err instanceof Error ? err.message : "Failed to load assets")
        setAssets([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchAssets, 300)
    return () => clearTimeout(debounce)
  }, [framework, price, category, search, sortBy, page])

  const activeFiltersCount = (framework !== "all" ? 1 : 0) + (price !== "all" ? 1 : 0) + (category !== "all" ? 1 : 0)

  const clearFilters = () => {
    setFramework("all")
    setPrice("all")
    setCategory("all")
    setSearch("")
  }

  return (
    <div className="p-4 md:p-6">

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                <Package className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Asset Store</h1>
                <p className="text-muted-foreground">Browse {stats.total} FiveM resources</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">{stats.free} Free</span>
              </div>
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">{stats.premium} Premium</span>
              </div>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assets by name, description, or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 bg-secondary/50 border-border/50 rounded-xl text-base"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Filter Toggle & Sort */}
              <div className="flex items-center gap-2">
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-primary text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 gap-2 bg-transparent">
                      <TrendingUp className="h-4 w-4" />
                      {SORT_OPTIONS.find((s) => s.id === sortBy)?.name || "Sort"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={sortBy === option.id ? "bg-secondary" : ""}
                      >
                        <option.icon className="h-4 w-4 mr-2" />
                        {option.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex gap-1 border border-border/50 rounded-xl p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={`h-10 w-10 rounded-lg ${viewMode === "grid" ? "bg-card" : ""}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={`h-10 w-10 rounded-lg ${viewMode === "list" ? "bg-card" : ""}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                <div className="flex flex-wrap items-start gap-6">
                  {/* Categories */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={category === cat.id ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setCategory(cat.id)}
                          className={`rounded-xl ${
                            category === cat.id ? "bg-primary/20 text-primary border-primary/30" : ""
                          }`}
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Framework */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Framework</label>
                    <FrameworkSelector selected={framework} onSelect={setFramework} />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <div className="flex gap-2">
                      {(["all", "free", "premium"] as const).map((p) => (
                        <Button
                          key={p}
                          variant={price === p ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setPrice(p)}
                          className={`rounded-xl capitalize ${
                            price === p
                              ? p === "free"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : p === "premium"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-secondary"
                              : ""
                          }`}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-destructive hover:text-destructive gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Active Filters Pills */}
          {activeFiltersCount > 0 && !showFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {category !== "all" && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {category}
                  <button
                    onClick={() => setCategory("all")}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-destructive hover:text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {framework !== "all" && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {framework}
                  <button
                    onClick={() => setFramework("all")}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-destructive hover:text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {price !== "all" && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {price}
                  <button
                    onClick={() => setPrice("all")}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-destructive hover:text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass rounded-2xl p-6 mb-6 border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-red-500" />
                <div>
                  <p className="font-medium text-foreground">Error loading assets</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div
              className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] bg-secondary/50 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-1/3 bg-secondary/50 rounded animate-pulse" />
                    <div className="h-5 w-2/3 bg-secondary/50 rounded animate-pulse" />
                    <div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !error && assets.length > 0 ? (
            <div
              className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}
            >
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} variant={viewMode === "list" ? "compact" : "default"} />
              ))}
            </div>
          ) : !error ? (
            <div className="glass rounded-2xl flex flex-col items-center justify-center py-20">
              <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No assets found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search term</p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : null}

          {/* Results Count */}
          {!isLoading && !error && assets.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {assets.length} {assets.length === 1 ? "asset" : "assets"}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && assets.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-9 h-9"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && <span className="text-muted-foreground px-2">...</span>}
                {totalPages > 5 && (
                  <Button
                    variant={page === totalPages ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    className="w-9 h-9"
                  >
                    {totalPages}
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
    </div>
  )
}
