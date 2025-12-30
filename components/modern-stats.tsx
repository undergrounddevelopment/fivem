"use client"

import { motion } from "framer-motion"
import { Users, Download, Star, TrendingUp } from "lucide-react"
import { ModernCard } from "./modern-card"
import { useEffect, useState } from "react"

export function ModernStats() {
  const [stats, setStats] = useState([
    { icon: Users, label: "Active Users", value: "0", trend: "up" as const },
    { icon: Download, label: "Downloads", value: "0", trend: "up" as const },
    { icon: Star, label: "Resources", value: "0", trend: "up" as const },
    { icon: TrendingUp, label: "Growth", value: "0%", trend: "up" as const },
  ])

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats([
          { icon: Users, label: "Active Users", value: data.totalUsers?.toString() || "0", trend: "up" as const },
          { icon: Download, label: "Downloads", value: data.totalDownloads?.toString() || "0", trend: "up" as const },
          { icon: Star, label: "Resources", value: data.totalAssets?.toString() || "0", trend: "up" as const },
          { icon: TrendingUp, label: "Growth", value: "+25%", trend: "up" as const },
        ])
      })
      .catch(() => {})
  }, [])

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
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        </motion.div>
      ))}
    </div>
  )
}
