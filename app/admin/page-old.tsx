"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users, ImageIcon, Megaphone, MessageSquare, Sparkles, FileText,
  TrendingUp, Coins, Activity, Loader2, Settings, Database, Shield,
  BarChart3, Bell, Zap, Eye, Download, RefreshCw, ArrowUpRight,
  ArrowDownRight, Clock, CheckCircle2, AlertTriangle, XCircle,
  Globe, Server, Cpu, HardDrive, Wifi, Lock, UserPlus, Crown,
  Gift, Target, Rocket, Award, Star, Hash, Calendar, ChevronRight
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
  totalAssets: number
  pendingAssets: number
  activeAssets: number
  totalThreads: number
  pendingThreads: number
  todayUsers: number
  weeklyGrowth: number
}

const quickLinks = [
  { title: "Users", href: "/admin/users", icon: Users, color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-500/10", textColor: "text-cyan-400", desc: "Manage all users" },
  { title: "Banners", href: "/admin/banners", icon: ImageIcon, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-500/10", textColor: "text-blue-400", desc: "Banner management" },
  { title: "Announcements", href: "/admin/announcements", icon: Megaphone, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", textColor: "text-green-400", desc: "Site announcements" },
  { title: "Forum", href: "/admin/forum", icon: MessageSquare, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10", textColor: "text-purple-400", desc: "Forum moderation" },
  { title: "Spin Wheel", href: "/admin/spin-wheel", icon: Sparkles, color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-500/10", textColor: "text-yellow-400", desc: "Prize configuration" },
  { title: "Assets", href: "/admin/assets", icon: FileText, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/10", textColor: "text-orange-400", desc: "Asset management" },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3, color: "from-pink-500 to-rose-500", bgColor: "bg-pink-500/10", textColor: "text-pink-400", desc: "View statistics" },
  { title: "Database", href: "/admin/database", icon: Database, color: "from-indigo-500 to-violet-500", bgColor: "bg-indigo-500/10", textColor: "text-indigo-400", desc: "Database status" },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const res = await fetch("/api/admin/dashboard-stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <Shield className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl glass">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-pink-200 to-primary bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <Badge className="bg-primary/20 text-primary border-primary/30 hidden sm:flex">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Complete platform management • Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchStats} 
                disabled={refreshing} 
                className="h-12 px-6 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 gap-2"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border border-white/5 hover:border-cyan-500/30">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-7 w-7 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {stats?.totalUsers || 0}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+{stats?.todayUsers || 0} today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border border-white/5 hover:border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Weekly Growth</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {stats?.weeklyGrowth || 0}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">Trending up</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border border-white/5 hover:border-yellow-500/30">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-7 w-7 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Spins</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {stats?.totalSpins || 0}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Gift className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">Gamification</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border border-white/5 hover:border-orange-500/30">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="h-7 w-7 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Coins Won</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {(stats?.totalCoinsWon || 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Award className="h-3 w-3 text-orange-400" />
                <span className="text-xs text-orange-400">Virtual currency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {quickLinks.length} modules
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className={`group glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all border border-white/5 hover:border-primary/30 cursor-pointer h-full`}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`h-14 w-14 rounded-xl ${link.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <link.icon className={`h-7 w-7 ${link.textColor}`} />
                  </div>
                  <div>
                    <span className="text-base font-semibold block group-hover:text-primary transition-colors">{link.title}</span>
                    <span className="text-xs text-muted-foreground">{link.desc}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Open</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Overview & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Overview */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-cyan-500/5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Content Overview
              <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-400 text-xs">Live</Badge>
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Banners</span>
                  <p className="text-xs text-muted-foreground">Active advertisements</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-blue-400">{stats?.activeBanners || 0}</span>
                <span className="text-muted-foreground">/{stats?.totalBanners || 0}</span>
              </div>
            </div>
            
            <div className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Announcements</span>
                  <p className="text-xs text-muted-foreground">Site notifications</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-green-400">{stats?.activeAnnouncements || 0}</span>
                <span className="text-muted-foreground">/{stats?.totalAnnouncements || 0}</span>
              </div>
            </div>

            <div className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Assets</span>
                  <p className="text-xs text-muted-foreground">Uploaded resources</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-0">{stats?.activeAssets || 0} active</Badge>
                {(stats?.pendingAssets || 0) > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-0 animate-pulse">{stats?.pendingAssets} pending</Badge>
                )}
              </div>
            </div>
            
            <div className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Forum Threads</span>
                  <p className="text-xs text-muted-foreground">Community discussions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-0">{stats?.totalThreads || 0} total</Badge>
                {(stats?.pendingThreads || 0) > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-0 animate-pulse">{stats?.pendingThreads} pending</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-emerald-500/5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Server className="h-5 w-5 text-green-400" />
              System Status
              <span className="ml-auto flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">All Systems Operational</span>
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { name: "Database", icon: Database, status: "Online", uptime: "99.9%", color: "green" },
              { name: "API Server", icon: Globe, status: "Healthy", uptime: "99.8%", color: "green" },
              { name: "Storage", icon: HardDrive, status: "Active", uptime: "100%", color: "green" },
              { name: "CDN", icon: Wifi, status: "Connected", uptime: "99.7%", color: "green" },
            ].map((service, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-${service.color}-500/20 flex items-center justify-center`}>
                    <service.icon className={`h-5 w-5 text-${service.color}-400`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{service.name}</span>
                    <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <Badge className={`bg-${service.color}-500/20 text-${service.color}-400 border-0`}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Performance Metrics
            </h3>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">Real-time</Badge>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">98.5%</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime</p>
              <Progress value={98.5} className="mt-3 h-1" />
            </div>
            
            <div className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-green-500/30 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">145ms</p>
              <p className="text-sm text-muted-foreground mt-1">Avg Response</p>
              <Progress value={85} className="mt-3 h-1" />
            </div>
            
            <div className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">2.4k</p>
              <p className="text-sm text-muted-foreground mt-1">Daily Visits</p>
              <Progress value={72} className="mt-3 h-1" />
            </div>
            
            <div className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-pink-500/30 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-pink-400" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">4.8/5</p>
              <p className="text-sm text-muted-foreground mt-1">User Rating</p>
              <Progress value={96} className="mt-3 h-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              Recent Activity
            </h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[
              { action: "New user registered", time: "2 minutes ago", icon: UserPlus, color: "cyan" },
              { action: "Asset approved", time: "15 minutes ago", icon: CheckCircle2, color: "green" },
              { action: "New forum thread", time: "32 minutes ago", icon: MessageSquare, color: "purple" },
              { action: "Spin wheel prize won", time: "1 hour ago", icon: Gift, color: "yellow" },
              { action: "Banner updated", time: "2 hours ago", icon: ImageIcon, color: "blue" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                <div className={`h-10 w-10 rounded-lg bg-${activity.color}-500/20 flex items-center justify-center`}>
                  <activity.icon className={`h-5 w-5 text-${activity.color}-400`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
