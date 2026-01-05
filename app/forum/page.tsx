"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useStatsStore } from "@/lib/store"
import { FORUM_CATEGORIES } from "@/lib/constants"
import {
  MessageSquare, Plus, Pin, Eye, Heart, Users, Search, Filter, Clock, Trophy, Award, Star, Crown
} from "lucide-react"
import Link from "next/link"
import { OnlineUsersList } from "@/components/forum/online-users"

interface ThreadAuthor {
  username: string
  avatar: string
  membership: string
}

interface Thread {
  id: string
  title: string
  category: string
  author: ThreadAuthor
  replies: number
  likes: number
  views: number
  isPinned: boolean
  status: string
  createdAt: string
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  threadCount?: number
  postCount?: number
}

interface TopBadgeUser {
  id: string
  username: string
  avatar: string | null
  level: number
  xp: number
  badge_name: string
  badge_color: string
}

export default function ForumPage() {
  const { user } = useAuth()
  const { stats } = useStatsStore()
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<Category[]>([])
  const [topBadgeUsers, setTopBadgeUsers] = useState<TopBadgeUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)

  // Safe stats with defaults
  const safeStats = {
    totalThreads: stats?.totalThreads || 0,
    totalPosts: stats?.totalPosts || 0,
    totalUsers: (stats as any)?.totalUsers || (stats as any)?.totalMembers || 0,
    onlineUsers: onlineCount || stats?.onlineUsers || 0,
  }

  // Fetch threads using API directly
  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/forum/threads?limit=10')
        const data = await res.json()
        if (data.success && data.threads) {
          setThreads(data.threads.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category_id,
            author: {
              username: t.author.username,
              avatar: t.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${t.author.username}`,
              membership: t.author.membership
            },
            replies: t.replies || t.reply_count || t.replies_count || 0,
            likes: t.likes || 0,
            views: t.views || 0,
            isPinned: t.is_pinned || t.pinned || false,
            status: t.status || "approved",
            createdAt: t.created_at
          })))
        }
      } catch (error) {
        console.error("Failed to fetch threads:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchThreads()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/forum/categories')
        const categories = await res.json()
        if (categories && categories.length > 0) {
          setCategoriesWithCounts(categories)
        } else {
          setCategoriesWithCounts(FORUM_CATEGORIES.map((cat) => ({ ...cat, threadCount: 0, postCount: 0 })))
        }
      } catch {
        setCategoriesWithCounts(FORUM_CATEGORIES.map((cat) => ({ ...cat, threadCount: 0, postCount: 0 })))
      }
    }
    fetchCategories()
  }, [])

  // Fetch top badge users (highest XP/Level)
  useEffect(() => {
    const fetchTopBadgeUsers = async () => {
      try {
        const res = await fetch('/api/forum/top-badges')
        const data = await res.json()
        if (data.success && data.users) {
          setTopBadgeUsers(data.users)
        }
      } catch (error) {
        console.error("Failed to fetch top badge users:", error)
      }
    }
    fetchTopBadgeUsers()
  }, [])

  // Fetch online count
  useEffect(() => {
    const fetchOnlineCount = async () => {
      try {
        const res = await fetch("/api/realtime/online-users")
        const data = await res.json()
        if (data.success && data.data) {
          setOnlineCount(data.data.length)
        }
      } catch (error) {
        console.error("Failed to fetch online count:", error)
      }
    }
    fetchOnlineCount()
    const interval = setInterval(fetchOnlineCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const pinnedThreads = threads.filter((t) => t.isPinned)
  const regularThreads = threads.filter((t) => !t.isPinned)

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground">Join discussions, get help, and connect with the community</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {user && (
            <Link href="/forum/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Thread
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{safeStats.totalThreads.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Threads</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{safeStats.totalPosts.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{Math.floor(safeStats.onlineUsers * 3.5)}</p>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-chart-3" />
          </div>
          <div>
            <p className="text-2xl font-bold">{safeStats.onlineUsers}</p>
            <p className="text-sm text-muted-foreground">Online Now</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Categories
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {categoriesWithCounts.map((category) => (
                <Link
                  key={category.id}
                  href={`/forum/category/${category.id}`}
                  className="group flex items-center gap-4 rounded-xl bg-secondary/30 p-4 transition-all hover:bg-secondary/50"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <MessageSquare className="h-5 w-5" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{category.threadCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">threads</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {pinnedThreads.length > 0 && (
            <div className="bg-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Pin className="h-5 w-5 text-primary" />
                Pinned Threads
              </h2>
              <div className="space-y-3">
                {pinnedThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/forum/thread/${thread.id}`}
                    className="flex items-center gap-4 rounded-xl bg-primary/5 border border-primary/20 p-4 transition-all hover:bg-primary/10"
                  >
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0">
                      <img src={thread.author.avatar} alt={thread.author.username} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Pin className="h-4 w-4 text-primary shrink-0" />
                        <h3 className="font-semibold truncate">{thread.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium">{thread.author.username}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{categoriesWithCounts.find((c) => c.id === thread.category)?.name || thread.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">{thread.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Threads
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4">
                    <div className="h-11 w-11 rounded-full bg-secondary/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-secondary/50 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-secondary/50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : regularThreads.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No approved threads yet</p>
                {user && (
                  <Link href="/forum/new">
                    <Button variant="link" className="text-primary mt-2">Create the first thread</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {regularThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/forum/thread/${thread.id}`}
                    className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4 transition-all hover:bg-secondary/40"
                  >
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0">
                      <img src={thread.author.avatar} alt={thread.author.username} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate hover:text-primary transition-colors">{thread.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium">{thread.author.username}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{categoriesWithCounts.find((c) => c.id === thread.category)?.name || thread.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{thread.likes}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Online Users - Real profiles */}
          <OnlineUsersList />

          {/* Forum Stats */}
          <div className="bg-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">Forum Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Members</span>
                <span className="font-semibold">{safeStats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Threads</span>
                <span className="font-semibold">{safeStats.totalThreads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Posts</span>
                <span className="font-semibold">{safeStats.totalPosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Online Now</span>
                <span className="font-semibold text-emerald-400">{safeStats.onlineUsers}</span>
              </div>
            </div>
          </div>

          {/* Top Badges - Modern Leaderboard */}
          <div className="bg-card rounded-2xl p-5 overflow-hidden relative">
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 relative z-10">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              Top Badges
            </h2>
            
            <div className="space-y-2 relative z-10">
              {topBadgeUsers.length > 0 ? (
                topBadgeUsers.slice(0, 5).map((user, index) => {
                  // Badge images based on level
                  const badgeImages: Record<number, string> = {
                    1: "/badges/badge1.png", 2: "/badges/badge1.png",
                    3: "/badges/badge2.png", 4: "/badges/badge2.png",
                    5: "/badges/badge3.png", 6: "/badges/badge3.png",
                    7: "/badges/badge4.png", 8: "/badges/badge4.png",
                    9: "/badges/badge5.png", 10: "/badges/badge5.png",
                  }
                  const badgeImage = badgeImages[user.level] || "/badges/badge1.png"
                  
                  // Rank colors
                  const rankColors = [
                    "from-amber-400 to-yellow-500 shadow-amber-500/40", // 1st
                    "from-gray-300 to-gray-400 shadow-gray-400/40", // 2nd
                    "from-amber-600 to-orange-700 shadow-orange-600/40", // 3rd
                    "from-blue-400 to-blue-500 shadow-blue-500/30", // 4th
                    "from-purple-400 to-purple-500 shadow-purple-500/30", // 5th
                  ]
                  
                  const levelColors: Record<number, string> = {
                    1: "text-gray-400", 2: "text-gray-400",
                    3: "text-green-400", 4: "text-green-500",
                    5: "text-blue-400", 6: "text-blue-500",
                    7: "text-purple-400", 8: "text-purple-500",
                    9: "text-amber-400", 10: "text-red-400",
                  }
                  
                  return (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                        index === 0 
                          ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 hover:border-amber-500/40" 
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className={`relative h-8 w-8 rounded-lg bg-gradient-to-br ${rankColors[index]} flex items-center justify-center shadow-lg shrink-0`}>
                        {index < 3 ? (
                          <Crown className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        )}
                      </div>
                      
                      {/* Avatar with Badge */}
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary ring-2 ring-white/10">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30 text-sm font-bold text-white">
                              {user.username?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        {/* Level Badge Icon */}
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full overflow-hidden border-2 border-card">
                          <img src={badgeImage} alt={`Level ${user.level}`} className="h-full w-full object-cover" />
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors block">
                          {user.username}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-white/10 ${levelColors[user.level] || 'text-gray-400'}`}>
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                            Lv.{user.level}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{user.badge_name}</span>
                        </div>
                      </div>
                      
                      {/* XP */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{user.xp.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">XP</p>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="text-center py-6">
                  <Trophy className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No badge leaders yet</p>
                </div>
              )}
            </div>
            
            {/* View All Link */}
            <Link href="/badges" className="block mt-4 relative z-10">
              <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/10">
                <Award className="h-4 w-4 mr-2" />
                View All Badges
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}