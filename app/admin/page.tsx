"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ImageIcon,
  Megaphone,
  MessageSquare,
  Sparkles,
  FileText,
  TrendingUp,
  Coins,
  Activity,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalBanners: number
  activeBanners: number
  totalAnnouncements: number
  activeAnnouncements: number
  forumCategories: number
  totalSpins: number
  totalCoinsWon: number
  pendingAssets: number
}

const quickLinks = [
  { title: "Manage Banners", href: "/admin/banners", icon: ImageIcon, color: "text-blue-500" },
  { title: "Announcements", href: "/admin/announcements", icon: Megaphone, color: "text-green-500" },
  { title: "Forum Settings", href: "/admin/forum-settings", icon: MessageSquare, color: "text-purple-500" },
  { title: "Spin Wheel", href: "/admin/spin-wheel", icon: Sparkles, color: "text-yellow-500" },
  { title: "Users", href: "/admin/users", icon: Users, color: "text-cyan-500" },
  { title: "Assets", href: "/admin/assets", icon: FileText, color: "text-orange-500" },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard-stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your site management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <ImageIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Banners</p>
                <p className="text-2xl font-bold">
                  {stats?.activeBanners || 0}
                  <span className="text-sm text-muted-foreground font-normal ml-1">/ {stats?.totalBanners || 0}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spins</p>
                <p className="text-2xl font-bold">{stats?.totalSpins || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/20">
                <Coins className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coins Won</p>
                <p className="text-2xl font-bold">{(stats?.totalCoinsWon || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="bg-card/50 border-border hover:bg-secondary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-lg bg-secondary/50 ${link.color}`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{link.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Announcements</span>
              <Badge variant="secondary">
                {stats?.activeAnnouncements || 0} active / {stats?.totalAnnouncements || 0} total
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Forum Categories</span>
              <Badge variant="secondary">{stats?.forumCategories || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm">Pending Assets</span>
              <Badge variant={stats?.pendingAssets ? "destructive" : "secondary"}>{stats?.pendingAssets || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">Activity feed coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
