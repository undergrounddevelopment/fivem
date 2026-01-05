"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  MessageSquare,
  Eye,
  BarChart3,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const weeklyDownloads = [
  { day: "Mon", downloads: 120 },
  { day: "Tue", downloads: 180 },
  { day: "Wed", downloads: 150 },
  { day: "Thu", downloads: 220 },
  { day: "Fri", downloads: 280 },
  { day: "Sat", downloads: 350 },
  { day: "Sun", downloads: 300 },
]

const categoryStats = [
  { name: "Scripts", count: 850, percentage: 56 },
  { name: "Vehicles", count: 320, percentage: 21 },
  { name: "MLO", count: 220, percentage: 15 },
  { name: "Clothing", count: 110, percentage: 8 },
]

const topAssets = [
  { name: "Electron AC", downloads: 3500, growth: 24 },
  { name: "Prism - Appearance", downloads: 2100, growth: 18 },
  { name: "BMW M5 F90", downloads: 2340, growth: 32 },
  { name: "Police EUP Pack", downloads: 1890, growth: 12 },
  { name: "Advanced Garage", downloads: 1560, growth: 8 },
]

export default function AnalyticsPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<{
    weeklyDownloads?: Array<{ day: string; downloads: number }>;
    categoryStats?: Array<{ name: string; count: number; percentage: number }>;
    topAssets?: Array<{ title: string; downloads: number; growth: number }>;
    overview?: { totalUsers: number; totalDownloads: number; totalPosts: number; newUsersToday: number };
  } | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/")
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/analytics')
        const data = await res.json()
        setAnalytics(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null
  const maxDownloads = Math.max(...(analytics?.weeklyDownloads ?? [{ downloads: 1 }]).map((d) => d.downloads || 1))

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance and monitor growth metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Last 7 Days
          </Button>
          <Button variant="ghost" size="sm">
            Last 30 Days
          </Button>
          <Button variant="ghost" size="sm">
            All Time
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              +12%
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{analytics?.overview?.totalUsers ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Download className="h-5 w-5 text-success" />
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              +24%
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{(analytics?.overview?.totalDownloads ?? 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Downloads</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-accent" />
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              +18%
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{(analytics?.overview?.totalPosts ?? 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Posts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="h-5 w-5 text-warning" />
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" />
              -5%
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{analytics?.overview?.newUsersToday ?? 0}</p>
          <p className="text-sm text-muted-foreground">New Users Today</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Downloads Chart */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Download Trends
            </h2>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {(analytics?.weeklyDownloads ?? []).map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                  style={{ height: `${(Math.max(1, day.downloads) / Math.max(1, maxDownloads)) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Categories
            </h2>
          </div>
          <div className="space-y-4">
            {(analytics?.categoryStats ?? []).map((cat, i: number) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{cat.name}</span>
                  <span className="text-sm text-muted-foreground">{cat.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      i === 0 ? "bg-primary" : i === 1 ? "bg-success" : i === 2 ? "bg-accent" : "bg-warning"
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Assets */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Performing Assets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Asset Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Downloads</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Growth</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.topAssets ?? []).map((asset, i: number) => (
                <tr key={asset.title} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-warning/20 text-warning"
                          : i === 1
                            ? "bg-muted-foreground/20 text-muted-foreground"
                            : i === 2
                              ? "bg-amber-600/20 text-amber-600"
                              : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">{asset.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{asset.downloads.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="h-4 w-4" />+{asset.growth}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
