"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, MessageSquare, Download, TrendingUp, Activity } from "lucide-react"
import { motion } from "framer-motion"

interface Stats {
  totalUsers: number
  totalAssets: number
  totalThreads: number
  totalPosts: number
  totalDownloads: number
  onlineUsers: number
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
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const result = await response.json()
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

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 text-center">
          <p className="text-red-600">Failed to load statistics</p>
          <button 
            onClick={fetchStats}
            className="mt-2 text-sm text-red-700 underline"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  const statItems = [
    {
      title: "Total Members",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Assets",
      value: stats.totalAssets,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Forum Threads",
      value: stats.totalThreads,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Forum Posts",
      value: stats.totalPosts,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Downloads",
      value: stats.totalDownloads,
      icon: Download,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Online Now",
      value: stats.onlineUsers,
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {item.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}