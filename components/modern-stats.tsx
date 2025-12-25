"use client"

import { motion } from "framer-motion"
import { Users, Download, Star, TrendingUp } from "lucide-react"
import { ModernCard } from "./modern-card"

const stats = [
  { icon: Users, label: "Active Users", value: "50K+", trend: "up" as const },
  { icon: Download, label: "Downloads", value: "1M+", trend: "up" as const },
  { icon: Star, label: "Resources", value: "5K+", trend: "up" as const },
  { icon: TrendingUp, label: "Growth", value: "+25%", trend: "up" as const },
]

export function ModernStats() {
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
