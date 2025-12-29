"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { CoinIcon } from "@/components/coin-icon"
import {
  Download,
  MessageSquare,
  Heart,
  Star,
  Award,
  Settings,
  Crown,
  Calendar,
  Clock,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Shield,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface DownloadHistory {
  id: string
  assetId: string // Added assetId for proper linking
  title: string
  category: string
  thumbnail: string | null
  downloadedAt: string
}

interface UserStats {
  downloads: number
  posts: number
  likes: number
  points: number
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([])
  const [userStats, setUserStats] = useState<UserStats>({ downloads: 0, posts: 0, likes: 0, points: 0 })
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.id) {
      fetchUserData()
    }
  }, [user?.id])

  const fetchUserData = async () => {
    if (!user?.id) return

    setIsLoadingData(true)
    setError(null)

    try {
      const res = await fetch(`/api/profile/${user.id}`)

      if (!res.ok) {
        throw new Error("Failed to fetch user data")
      }

      const data = await res.json()

      if (data.downloads && Array.isArray(data.downloads)) {
        const mappedDownloads = data.downloads.slice(0, 5).map((d: any) => ({
          id: d.id || Math.random().toString(),
          assetId: d.assetId || d.asset_id || d.id,
          title: d.asset?.title || "Unknown Asset",
          category: d.asset?.category || "scripts",
          thumbnail: d.asset?.thumbnail || null,
          downloadedAt: d.createdAt || d.created_at || new Date().toISOString(),
        }))
        setDownloadHistory(mappedDownloads)
      } else {
        setDownloadHistory([])
      }

      setUserStats({
        downloads: data.downloadCount || data.stats?.totalDownloads || 0,
        posts: data.postCount || data.stats?.totalPosts || 0,
        likes: data.likeCount || 0,
        points: data.points || user?.coins || 0,
      })
    } catch (err: any) {
      console.error("Failed to fetch user data:", err)
      setError(err.message)
      setDownloadHistory([])
      setUserStats({
        downloads: 0,
        posts: 0,
        likes: 0,
        points: user?.coins || 0,
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const achievements = [
    {
      id: "1",
      name: "First Download",
      description: "Downloaded your first resource",
      icon: "🏆",
      unlocked: userStats.downloads >= 1,
    },
    {
      id: "2",
      name: "First Post",
      description: "Created your first forum post",
      icon: "💬",
      unlocked: userStats.posts >= 1,
    },
    {
      id: "3",
      name: "Community Member",
      description: "Collected 100 coins",
      icon: "⭐",
      unlocked: userStats.points >= 100,
    },
    {
      id: "4",
      name: "Resource Hunter",
      description: "Downloaded 10 resources",
      icon: "🎯",
      unlocked: userStats.downloads >= 10,
    },
    {
      id: "5",
      name: "Active Contributor",
      description: "Created 5 forum posts",
      icon: "📝",
      unlocked: userStats.posts >= 5,
    },
  ]

  const unlockedAchievements = achievements.filter((a) => a.unlocked)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-6">

          {/* Profile Header */}
          <div className="glass rounded-2xl p-4 md:p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="relative">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.username}
                    className="h-16 w-16 md:h-24 md:w-24 rounded-2xl object-cover ring-4 ring-primary/20"
                  />
                  {user.membership === "admin" && (
                    <div className="absolute -bottom-2 -right-2 h-7 w-7 md:h-9 md:w-9 rounded-xl bg-destructive flex items-center justify-center glow-sm">
                      <Shield className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                  )}
                  {user.membership === "vip" && (
                    <div className="absolute -bottom-2 -right-2 h-7 w-7 md:h-9 md:w-9 rounded-xl bg-primary flex items-center justify-center glow-sm">
                      <Crown className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">{user.username}</h1>
                    <Badge
                      className={`${
                        user.membership === "admin"
                          ? "bg-destructive/20 text-destructive border-destructive/30"
                          : user.membership === "vip"
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {user.membership === "admin" && <Shield className="h-3 w-3 mr-1" />}
                      {user.membership === "vip" && <Crown className="h-3 w-3 mr-1" />}
                      {user.membership.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{user.email || "No email provided"}</p>
                  <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      Member since 2025
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 md:h-4 md:w-4 text-warning" />
                      Discord Connected
                    </span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/settings" className="self-start">
                <Button variant="outline" className="gap-2 rounded-xl bg-background/50">
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              {
                label: "Total Downloads",
                value: userStats.downloads,
                change: userStats.downloads > 0 ? "Active" : null,
                icon: Download,
                color: "text-primary",
                bg: "bg-primary/20",
              },
              {
                label: "Forum Posts",
                value: userStats.posts,
                change: userStats.posts > 0 ? "Active" : null,
                icon: MessageSquare,
                color: "text-success",
                bg: "bg-success/20",
              },
              {
                label: "Likes Given",
                value: userStats.likes,
                change: null,
                icon: Heart,
                color: "text-chart-5",
                bg: "bg-chart-5/20",
              },
              {
                label: "Total Coins",
                value: user.coins || 0,
                change: null,
                icon: null, // Using CoinIcon for coins stat
                color: "text-warning",
                bg: "bg-warning/20",
                useCoinIcon: true,
              },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 md:p-5 card-hover">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className={`h-8 w-8 md:h-10 md:w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    {stat.useCoinIcon ? (
                      <CoinIcon size="sm" />
                    ) : stat.icon ? (
                      <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                    ) : null}
                  </div>
                  {stat.change && (
                    <span className="text-xs text-success font-medium hidden md:inline">{stat.change}</span>
                  )}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            {/* Achievements */}
            <div className="glass rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Achievements
                </h2>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {unlockedAchievements.length}/{achievements.length} unlocked
                </span>
              </div>
              <div className="space-y-2 md:space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 md:gap-4 rounded-xl p-2 md:p-3 transition-colors ${
                      achievement.unlocked ? "bg-secondary/30 hover:bg-secondary/50" : "bg-secondary/10 opacity-50"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center text-lg md:text-xl ${
                        achievement.unlocked ? "bg-background/50" : "bg-background/30 grayscale"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm md:text-base">{achievement.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && <span className="text-xs text-success font-medium shrink-0">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Download History */}
            <div className="glass rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Downloads
                </h2>
                <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={fetchUserData}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {isLoadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/20 p-3 animate-pulse">
                      <div className="h-11 w-11 rounded-xl bg-secondary/50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary/50 rounded w-3/4" />
                        <div className="h-3 bg-secondary/50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-2">Failed to load downloads</p>
                  <Button variant="outline" size="sm" onClick={fetchUserData}>
                    Try Again
                  </Button>
                </div>
              ) : downloadHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No downloads yet</p>
                  <Link href="/scripts">
                    <Button variant="link" className="text-primary mt-2">
                      Browse Resources
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {downloadHistory.map((download) => (
                    <Link
                      key={download.id}
                      href={`/asset/${download.assetId}`}
                      className="flex items-center justify-between rounded-xl bg-secondary/30 p-2 md:p-3 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
                          {download.thumbnail ? (
                            <img
                              src={download.thumbnail || "/placeholder.svg"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Download className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm md:text-base group-hover:text-primary transition-colors line-clamp-1">
                            {download.title}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground capitalize">{download.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          {new Date(download.downloadedAt).toLocaleDateString()}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Membership Status */}
          <div className="mt-6 glass rounded-2xl p-4 md:p-6 border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center animate-pulse-glow ${
                    user.membership === "admin" ? "bg-destructive/20" : "bg-primary/20"
                  }`}
                >
                  {user.membership === "admin" ? (
                    <Shield className="h-6 w-6 md:h-7 md:w-7 text-destructive" />
                  ) : (
                    <Crown className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                    {user.membership === "admin"
                      ? "Administrator Account"
                      : user.membership === "vip"
                        ? "VIP Membership Active"
                        : "Free Member"}
                    <Zap className="h-4 w-4 text-warning" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user.membership === "admin"
                      ? "Full access to all features and admin panel."
                      : user.membership === "vip"
                        ? "Enjoy unlimited downloads, premium assets, and priority support."
                        : "Upgrade to VIP for unlimited access to premium content."}
                  </p>
                </div>
              </div>
              {user.membership === "free" && (
                <Link href="/membership" className="self-start md:self-center">
                  <Button className="bg-primary hover:bg-primary/90 rounded-xl glow-sm">Upgrade to VIP</Button>
                </Link>
              )}
            </div>
          </div>
    </div>
  )
}
