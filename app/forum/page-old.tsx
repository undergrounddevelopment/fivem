"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useStatsStore } from "@/lib/store"
import { FORUM_CATEGORIES } from "@/lib/constants"
import {
  MessageSquare,
  Plus,
  Pin,
  Eye,
  Heart,
  Megaphone,
  HelpCircle,
  Code,
  Star,
  MessageCircle,
  Users,
  TrendingUp,
  Flame,
  Clock,
  Crown,
  Shield,
  Search,
  Filter,
  ShoppingBag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { SnowPile } from "@/components/snow-pile"

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  "help-circle": HelpCircle,
  code: Code,
  star: Star,
  "shopping-bag": ShoppingBag,
  Megaphone: Megaphone,
  MessageSquare: MessageSquare,
  HelpCircle: HelpCircle,
  Code: Code,
  Star: Star,
  BookOpen: Code,
  Coffee: MessageCircle,
}

interface ForumThread {
  id: string
  title: string
  category: string
  author: {
    username: string
    avatar: string
    membership: "free" | "vip" | "admin"
  }
  replies: number
  likes: number
  views: number
  isPinned: boolean
  status: string
  createdAt: string
}

interface OnlineUser {
  id: string
  username: string
  avatar: string
  membership: "free" | "vip" | "admin"
  isOnline: boolean
}

interface TopContributor {
  id: string
  username: string
  avatar: string
  membership: "free" | "vip" | "admin"
  points: number
  threads: number
  replies: number
  assets: number
}

export default function ForumPage() {
  const { user } = useAuth()
  const { stats } = useStatsStore()
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 10

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [topContributors, setTopContributors] = useState<TopContributor[]>([])

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/forum/threads', { cache: 'no-store' })
        const json = await res.json()
        const list = Array.isArray(json?.threads) ? json.threads : []
        setThreads(
          list.slice(0, ITEMS_PER_PAGE).map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category_id,
            author: {
              username: t.users?.username || t.username || "Unknown",
              avatar: t.users?.avatar || t.avatar || "/placeholder.svg",
              membership: t.users?.membership || t.membership || "free",
            },
            replies: t.replies_count || t.reply_count || 0,
            likes: t.likes || 0,
            views: t.views || 0,
            isPinned: t.is_pinned || t.pinned || false,
            status: t.status || "approved",
            createdAt: t.created_at,
          })),
        )
      } catch (error) {
        console.error("Failed to fetch threads:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchThreads()
  }, [page])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/forum/categories', { cache: 'no-store' })
        if (res.ok) {
          const categories = await res.json()
          if (Array.isArray(categories) && categories.length > 0) {
            setCategoriesWithCounts(categories)
            return
          }
        } else {
          setCategoriesWithCounts(
            FORUM_CATEGORIES.map((cat, i) => ({
              ...cat,
              threadCount: 0,
              postCount: 0,
            })),
          )
        }
      } catch {
        setCategoriesWithCounts(
          FORUM_CATEGORIES.map((cat, i) => ({
            ...cat,
            threadCount: 0,
            postCount: 0,
          })),
        )
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch('/api/forum/online-users', { cache: 'no-store' })
        if (!res.ok) return
        const users = await res.json()
        if (Array.isArray(users)) setOnlineUsers(users)
      } catch (error) {
        console.error("Failed to fetch online users:", error)
      }
    }
    fetchOnlineUsers()

    const interval = setInterval(fetchOnlineUsers, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const res = await fetch('/api/forum/top-contributors', { cache: 'no-store' })
        if (!res.ok) return
        const contributors = await res.json()
        if (Array.isArray(contributors)) setTopContributors(contributors)
      } catch (error) {
        console.error("Failed to fetch top contributors:", error)
      }
    }
    fetchTopContributors()
  }, [])

  const pinnedThreads = threads.filter((t) => t.isPinned)
  const regularThreads = threads.filter((t) => !t.isPinned)

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
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
                  className="pl-10 w-64 bg-secondary/50 border-border/50 rounded-xl"
                />
              </div>
              {user && (
                <Link href="/forum/new">
                  <Button className="bg-primary hover:bg-primary/90 gap-2 rounded-xl glow-sm">
                    <Plus className="h-4 w-4" />
                    New Thread
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Moderation Notice for logged in users */}
          {user && (
            <div className="glass rounded-xl p-4 mb-6 border border-primary/30 bg-primary/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Community Guidelines</p>
                  <p className="text-sm text-muted-foreground">
                    All new posts are reviewed by moderators before being published. Please follow our community
                    guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 flex items-center gap-4 card-hover">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalThreads.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Threads</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-center gap-4 card-hover">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-center gap-4 card-hover">
              <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{Math.floor(stats.onlineUsers * 3.5)}</p>
                <p className="text-sm text-muted-foreground">Active Today</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-center gap-4 card-hover">
              <div className="h-12 w-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
                <div className="relative">
                  <Users className="h-6 w-6 text-chart-3" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full status-online" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.onlineUsers}</p>
                <p className="text-sm text-muted-foreground">Online Now</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Categories */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Categories
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoriesWithCounts.map((category) => {
                    const Icon = iconMap[category.icon] || MessageSquare
                    return (
                      <Link
                        key={category.id}
                        href={`/forum/category/${category.id}`}
                        className="group flex items-center gap-4 rounded-xl bg-secondary/30 p-4 transition-all hover:bg-secondary/50 card-hover"
                      >
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: category.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-foreground">{category.threadCount || 0}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">threads</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Pinned Threads */}
              {pinnedThreads.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Pin className="h-5 w-5 text-primary" />
                    Pinned Threads
                  </h2>
                  <div className="space-y-3">
                    {pinnedThreads.map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/forum/thread/${thread.id}`}
                        className="flex items-center gap-4 rounded-xl bg-primary/5 border border-primary/20 p-4 transition-all hover:bg-primary/10 hover:border-primary/40"
                      >
                        <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0 ring-2 ring-primary/30">
                          <img
                            src={thread.author.avatar || "/placeholder.svg"}
                            alt={thread.author.username}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Pin className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">{thread.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {thread.author.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                            <span className="font-medium text-foreground">{thread.author.username}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>
                              {categoriesWithCounts.find((c) => c.id === thread.category)?.name || thread.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium text-foreground">{thread.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium text-foreground">{thread.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Threads */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Recent Threads
                  </h2>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
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
                        <Button variant="link" className="text-primary mt-2">
                          Create the first thread
                        </Button>
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
                          <img
                            src={thread.author.avatar || "/placeholder.svg"}
                            alt={thread.author.username}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                            {thread.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {thread.author.membership === "vip" && <Crown className="h-3 w-3 text-primary" />}
                              {thread.author.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                              <span className="font-medium text-foreground">{thread.author.username}</span>
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>
                              {categoriesWithCounts.find((c) => c.id === thread.category)?.name || thread.category}
                            </span>
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
                
                {/* Pagination */}
                {!isLoading && regularThreads.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9 h-9"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      {totalPages > 5 && <span className="text-muted-foreground px-2">...</span>}
                      {totalPages > 5 && (
                        <Button
                          variant={page === totalPages ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          className="w-9 h-9"
                        >
                          {totalPages}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 relative overflow-hidden">
                <SnowPile size="sm" />
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 relative z-10">
                  <div className="h-2 w-2 rounded-full status-online" />
                  Online Users ({onlineUsers.length > 0 ? onlineUsers.length : stats.onlineUsers})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.length > 0 ? (
                    <>
                      {onlineUsers.slice(0, 5).map((onlineUser) => (
                        <Link
                          key={onlineUser.id}
                          href={`/profile/${onlineUser.id}`}
                          className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-xs hover:bg-secondary/70 transition-colors"
                        >
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent">
                            {onlineUser.avatar && (
                              <img
                                src={onlineUser.avatar || "/placeholder.svg"}
                                alt={onlineUser.username}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <span className="text-foreground font-medium flex items-center gap-1">
                            {onlineUser.username}
                            {onlineUser.membership === "admin" && <Shield className="h-3 w-3 text-destructive" />}
                            {onlineUser.membership === "vip" && <Crown className="h-3 w-3 text-primary" />}
                          </span>
                        </Link>
                      ))}
                      {onlineUsers.length > 5 && (
                        <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground">
                          +{onlineUsers.length - 5} more
                        </div>
                      )}
                    </>
                  ) : stats.onlineUsers > 0 ? (
                    <p className="text-sm text-muted-foreground">{stats.onlineUsers} user(s) browsing</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No users online</p>
                  )}
                </div>
              </div>

              <div className="glass rounded-2xl p-6 relative overflow-hidden">
                <SnowPile size="sm" />
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 relative z-10">
                  <TrendingUp className="h-5 w-5 text-warning" />
                  Top Contributors
                </h3>
                <div className="space-y-3 relative z-10">
                  {topContributors.length > 0 ? (
                    topContributors.map((contributor, i) => (
                      <Link
                        key={contributor.id}
                        href={`/profile/${contributor.id}`}
                        className="flex items-center gap-3 hover:bg-secondary/30 rounded-lg p-1 -m-1 transition-colors"
                      >
                        <span className="text-lg font-bold text-muted-foreground w-5">#{i + 1}</span>
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-primary/50 to-accent/50">
                          {contributor.avatar && (
                            <img
                              src={contributor.avatar || "/placeholder.svg"}
                              alt={contributor.username}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground text-sm truncate">{contributor.username}</span>
                            {contributor.membership === "admin" && <Shield className="h-3.5 w-3.5 text-destructive" />}
                            {contributor.membership === "vip" && <Crown className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{contributor.points.toLocaleString()} points</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No contributors yet</p>
                  )}
                </div>
              </div>

              {/* Forum Rules */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Forum Rules</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Be respectful to all members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>No spam or self-promotion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Use appropriate categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    <span>Search before posting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">5.</span>
                    <span>No pirated content</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
    </div>
  )
}
