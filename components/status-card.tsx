"use client"

import { useState, useEffect } from "react"
import { Users, Package, Download } from "lucide-react"

interface Stats {
  onlineUsers: number
  totalMembers: number
  totalAssets: number
  totalDownloads: number
  totalPosts: number
}

export function StatusCard() {
  const [stats, setStats] = useState<Stats>({
    onlineUsers: 0,
    totalMembers: 0,
    totalAssets: 0,
    totalDownloads: 0,
    totalPosts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats({
          onlineUsers: data.onlineUsers || 0,
          totalMembers: data.totalUsers || 0,
          totalAssets: data.totalAssets || 0,
          totalDownloads: 0,
          totalPosts: data.totalPosts || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-16 rounded-lg bg-secondary/50" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-24 rounded-lg bg-secondary/50" />
          <div className="h-24 rounded-lg bg-secondary/50" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Server Status */}
      <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Status Server</p>
          <p className="text-xs text-muted-foreground">All systems operational</p>
        </div>
        <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-success/10 px-4 py-3">
          <div className="flex items-center gap-1 text-xs text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            ONLINE
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.onlineUsers}</p>
          <p className="text-xs text-muted-foreground">Active users</p>
        </div>
        <div className="rounded-lg bg-primary/10 px-4 py-3">
          <div className="flex items-center gap-1 text-xs text-primary">
            <Users className="h-3 w-3" />
            MEMBERS
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalMembers}</p>
          <p className="text-xs text-muted-foreground">Registered</p>
        </div>
        <div className="rounded-lg bg-accent/10 px-4 py-3">
          <div className="flex items-center gap-1 text-xs text-accent">
            <Package className="h-3 w-3" />
            ASSETS
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalAssets}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="rounded-lg bg-blue-500/10 px-4 py-3">
          <div className="flex items-center gap-1 text-xs text-blue-500">
            <Download className="h-3 w-3" />
            DOWNLOADS
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalDownloads}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  )
}
