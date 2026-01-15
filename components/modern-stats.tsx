"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Download, Star, TrendingUp } from "lucide-react"
import { ModernCard } from "./modern-card"
import { formatNumber } from "@/lib/utils"

export function ModernStats() {
  const [statsData, setStatsData] = useState<any>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats")
        const json = await res.json()
        if (json.success && json.data) {
          // PROTECTION: Ignore updates that drop to 0 if we already have data
          setStatsData((prev: any) => {
            if (prev && prev.totalUsers > 0 && json.data.totalUsers === 0) return prev
            return json.data
          })
        }
      } catch (e) {
        console.error("Failed to fetch modern stats", e)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { 
      icon: Users, 
      label: "Active Users", 
      value: statsData ? formatNumber(statsData.totalUsers) : "...", 
      trend: "up" as const 
    },
    { 
      icon: Download, 
      label: "Downloads", 
      value: statsData ? formatNumber(statsData.totalDownloads) : "...", 
      trend: "up" as const 
    },
    { 
      icon: Star, 
      label: "Resources", 
      value: statsData ? formatNumber(statsData.totalAssets) : "...", 
      trend: "up" as const 
    },
    { 
      icon: TrendingUp, 
      label: "Daily Online", 
      value: statsData ? formatNumber(statsData.onlineUsers) : "...", 
      trend: "up" as const 
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <ModernCard
            title={stat.label}
            value={stat.value.toString()}
            icon={stat.icon}
            trend={stat.trend}
          />
        </motion.div>
      ))}
    </div>
  )
}
