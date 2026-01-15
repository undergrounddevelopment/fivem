"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, MessageSquare, Download, TrendingUp, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { cn, formatNumber } from "@/lib/utils"

interface Stats {
  totalUsers: number
  totalAssets: number
  totalThreads: number
  totalPosts: number
  totalDownloads: number
  onlineUsers: number
  totalUpvotes: number
}


export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        next: { revalidate: 60 }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const result = await response.json()
      
      // Prevent flashing: If we have existing data and new data shows 0 users (likely DB error), ignore it
      if (stats && stats.totalUsers > 0 && result.data?.totalUsers === 0) {
        console.warn('Ignoring stats update with 0 users (likely temporary failure)')
        return
      }

      setStats(result.data)
      setError(false)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Fallback to zeros instead of showing error
  const displayStats = stats || {
    totalUsers: 0,
    totalAssets: 0,
    totalThreads: 0,
    totalPosts: 0,
    totalDownloads: 0,
    onlineUsers: 0
  }

  // Only show error if explicitly desired, otherwise just show 0s
  // if (error) return ... (removed to prevent ugly red box)

  const statItems = [
    {
      title: "Total Members",
      value: displayStats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Assets",
      value: displayStats.totalAssets,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Forum Threads",
      value: displayStats.totalThreads,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Forum Posts",
      value: displayStats.totalPosts,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Downloads",
      value: displayStats.totalDownloads,
      icon: Download,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Online Now",
      value: displayStats.onlineUsers,
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
        >
          <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-200 backdrop-blur-sm">
            {/* Ambient Background Glow */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${item.bgColor.replace('bg-', 'bg-')}`} />

            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105",
                item.bgColor,
                "border-white/10"
              )}>
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>

              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                  {item.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {formatNumber(item.value)}
                  </p>
                  <span className="text-[10px] font-bold text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                    UNIT
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Progress Bar Decor */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}