"use client"

import { useEffect, useState } from "react"
import { AssetCard } from "./asset-card"
import { Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Asset } from "@/lib/types"

export function RecentAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/assets?limit=4")
        if (res.ok) {
          const data = await res.json()
          setAssets(data.items || [])
        }
      } catch (error) {
        console.error("Failed to fetch recent:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-info/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-info" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Recently Added</h2>
            <p className="text-sm text-muted-foreground">Latest uploads to the platform</p>
          </div>
        </div>
        <Link
          href="/scripts"
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2">
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
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </section>
  )
}
