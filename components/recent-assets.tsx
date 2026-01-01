"use client"

import { useEffect, useState } from "react"
import { AssetCard } from "./asset-card"
import { Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Asset } from "@/lib/types"
import { motion } from "framer-motion"

export function RecentAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        const { getAssets } = await import('@/lib/actions/general')
        const data = await getAssets()
        setAssets(data.slice(0, 4) || [])
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
      <motion.div 
        className="mb-5 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="h-10 w-10 rounded-xl flex items-center justify-center glow-sm"
            style={{ background: "rgba(236, 72, 153, 0.2)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock className="h-5 w-5 text-[var(--primary)]" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">Recently Added</h2>
            <p className="text-sm text-[var(--textDim)]">Latest uploads to the platform</p>
          </div>
        </div>
        <Link
          href="/scripts"
          className="flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i} 
              className="glass rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <div className="aspect-[16/10] bg-secondary/50 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-1/3 bg-secondary/50 rounded animate-pulse" />
                <div className="h-5 w-2/3 bg-secondary/50 rounded animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {assets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <AssetCard asset={asset} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
